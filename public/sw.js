const CACHE_VERSION = "flux-v1"
const STATIC_CACHE = `${CACHE_VERSION}-static`
const IMAGE_CACHE = `${CACHE_VERSION}-images`
const MAX_IMAGE_ENTRIES = 80

const PRECACHE_URLS = [
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        Promise.allSettled(
          PRECACHE_URLS.map((url) =>
            cache.add(new Request(url, { cache: "reload" }))
          )
        )
      )
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
  if (event.data?.type === "CLEAR_USER_CACHE") {
    event.waitUntil(caches.delete(IMAGE_CACHE))
  }
})

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length <= maxItems) return
  const excess = keys.length - maxItems
  for (let i = 0; i < excess; i += 1) {
    await cache.delete(keys[i])
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event

  // Never intercept non-GET requests (Server Actions, POST auth, uploads)
  if (request.method !== "GET") return

  const url = new URL(request.url)

  // Ignore unsupported schemes (chrome-extension, etc.)
  if (url.protocol !== "http:" && url.protocol !== "https:") return

  // Never cache NextAuth endpoints or dynamic API routes
  if (url.origin === self.location.origin && url.pathname.startsWith("/api/")) {
    return
  }

  // Never intercept Next.js RSC data/action requests
  if (
    request.headers.get("RSC") === "1" ||
    request.headers.get("Next-Action") !== null ||
    url.searchParams.has("_rsc")
  ) {
    return
  }

  // 1. HTML document navigations: Network-First with /offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedOffline = await caches.match("/offline")
        if (cachedOffline) return cachedOffline
        return new Response(
          "<!doctype html><html lang='gl'><body style='background:#08080d;color:#f4f4f7;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0'><div><h1>Flux</h1><p>Sen conexión a internet.</p></div></body></html>",
          { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
        )
      })
    )
    return
  }

  // 2. Immutable Next.js static bundles, icons, and PWA assets: Cache-First
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/static/") ||
      url.pathname.startsWith("/icons/") ||
      url.pathname.startsWith("/pwa/") ||
      url.pathname === "/apple-icon" ||
      url.pathname === "/favicon.ico")
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached
        try {
          const response = await fetch(request)
          if (response.ok && !response.redirected) {
            event.waitUntil(cache.put(request, response.clone()))
          }
          return response
        } catch {
          return Response.error()
        }
      })
    )
    return
  }

  // 3. Google Fonts: Stale-While-Revalidate
  if (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com"
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        const networkPromise = fetch(request)
          .then((response) => {
            if (response.ok || response.type === "opaque") {
              event.waitUntil(cache.put(request, response.clone()))
            }
            return response
          })
          .catch(() => cached || Response.error())
        return cached || networkPromise
      })
    )
    return
  }

  // 4. Game covers & user uploads: Stale-While-Revalidate with bounded cache
  const isImageAsset =
    request.destination === "image" ||
    url.hostname === "images.igdb.com" ||
    (url.origin === self.location.origin &&
      (url.pathname.startsWith("/uploads/") ||
        url.pathname.startsWith("/_next/image")))

  if (isImageAsset) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        const networkPromise = fetch(request)
          .then((response) => {
            if (
              (response.ok && !response.redirected) ||
              response.type === "opaque"
            ) {
              event.waitUntil(
                cache
                  .put(request, response.clone())
                  .then(() => trimCache(IMAGE_CACHE, MAX_IMAGE_ENTRIES))
              )
            }
            return response
          })
          .catch(() => cached || Response.error())
        return cached || networkPromise
      })
    )
  }
})
