"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

const SHOW_DELAY_MS = 120
const FINISH_HIDE_DELAY_MS = 240
const FAILSAFE_TIMEOUT_MS = 12000

/**
 * Subtle, non-intrusive top navigation progress bar.
 * - Waits 120ms before appearing so instant/cached navigations never flash.
 * - Anchored via `view-transition-name: nav-progress` so it stays pinned above view transitions.
 * - Respects `prefers-reduced-motion` via CSS.
 */
export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [phase, setPhase] = useState<"idle" | "loading" | "finishing">("idle")
  const [progress, setProgress] = useState(0)

  const showTimerRef = useRef<number | null>(null)
  const trickleTimerRef = useRef<number | null>(null)
  const hideTimerRef = useRef<number | null>(null)
  const failsafeTimerRef = useRef<number | null>(null)
  const isNavigatingRef = useRef(false)
  const routeKey = `${pathname}?${searchParams.toString()}`
  const prevRouteKeyRef = useRef(routeKey)

  const clearAllTimers = () => {
    if (showTimerRef.current !== null) window.clearTimeout(showTimerRef.current)
    if (trickleTimerRef.current !== null) window.clearInterval(trickleTimerRef.current)
    if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current)
    if (failsafeTimerRef.current !== null) window.clearTimeout(failsafeTimerRef.current)
    showTimerRef.current = null
    trickleTimerRef.current = null
    hideTimerRef.current = null
    failsafeTimerRef.current = null
  }

  // Complete navigation whenever the route key actually commits
  useEffect(() => {
    if (prevRouteKeyRef.current === routeKey) return
    prevRouteKeyRef.current = routeKey

    if (!isNavigatingRef.current) return
    isNavigatingRef.current = false
    clearAllTimers()

    const rafId = window.requestAnimationFrame(() => {
      setPhase((currentPhase) => {
        if (currentPhase === "loading") {
          setProgress(100)
          hideTimerRef.current = window.setTimeout(() => {
            setPhase("idle")
            setProgress(0)
          }, FINISH_HIDE_DELAY_MS)
          return "finishing"
        }
        setProgress(0)
        return "idle"
      })
    })

    return () => {
      window.cancelAnimationFrame(rafId)
    }
  }, [routeKey])

  // Start tracking when the user initiates an internal navigation
  useEffect(() => {
    const startNavigation = () => {
      clearAllTimers()
      isNavigatingRef.current = true

      showTimerRef.current = window.setTimeout(() => {
        if (!isNavigatingRef.current) return
        setPhase("loading")
        setProgress(22)

        trickleTimerRef.current = window.setInterval(() => {
          setProgress((current) => {
            if (current >= 88) return current
            const step = Math.max(2, (90 - current) * 0.16)
            return Math.min(88, current + step)
          })
        }, 220)
      }, SHOW_DELAY_MS)

      failsafeTimerRef.current = window.setTimeout(() => {
        isNavigatingRef.current = false
        clearAllTimers()
        setPhase("idle")
        setProgress(0)
      }, FAILSAFE_TIMEOUT_MS)
    }

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const target = event.target as HTMLElement | null
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null
      if (!anchor) return
      if (anchor.target && anchor.target !== "_self") return
      if (anchor.hasAttribute("download")) return

      const hrefAttr = anchor.getAttribute("href")
      if (!hrefAttr || hrefAttr.startsWith("#") || hrefAttr.startsWith("mailto:") || hrefAttr.startsWith("tel:")) {
        return
      }

      try {
        const nextUrl = new URL(anchor.href, window.location.href)
        const currentUrl = new URL(window.location.href)
        if (nextUrl.origin !== currentUrl.origin) return
        if (nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search) {
          return
        }
        startNavigation()
      } catch {
        // Ignore malformed URLs
      }
    }

    const handlePopState = () => {
      startNavigation()
    }

    document.addEventListener("click", handleClick, true)
    window.addEventListener("popstate", handlePopState)

    return () => {
      document.removeEventListener("click", handleClick, true)
      window.removeEventListener("popstate", handlePopState)
      clearAllTimers()
    }
  }, [])

  const isVisible = phase !== "idle"

  return (
    <div
      aria-hidden="true"
      style={{ viewTransitionName: "nav-progress" }}
      className={`fixed inset-x-0 top-0 z-[70] h-[2.5px] pointer-events-none transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-purple-500 via-primary-hover to-accent-cyan shadow-[0_0_12px_rgba(168,85,247,0.75)] transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] relative overflow-hidden"
        style={{ transform: `scaleX(${progress / 100})` }}
      >
        <div className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/55 to-transparent nav-progress-sheen" />
      </div>
    </div>
  )
}
