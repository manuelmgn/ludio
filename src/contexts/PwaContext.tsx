"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useSyncExternalStore,
} from "react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
  prompt(): Promise<void>
}

interface NavigatorWithInstall extends Navigator {
  standalone?: boolean
  install?: (options?: { manifest?: string; manifestId?: string }) => Promise<void>
}

export type InstallOutcome = "installed" | "dismissed" | "error" | "unavailable"

interface PwaContextValue {
  isStandalone: boolean
  isOnline: boolean
  canInstallPrompt: boolean
  isIOSInstallable: boolean
  isInstalling: boolean
  bannerDismissed: boolean
  dismissBanner: () => void
  triggerInstall: () => Promise<InstallOutcome>
}

const DISMISS_STORAGE_KEY = "flux_pwa_banner_dismissed_at"
const DISMISS_TTL_MS = 14 * 24 * 60 * 60 * 1000 // 14 days

const PwaContext = createContext<PwaContextValue | undefined>(undefined)

const subscribeNever = () => () => {}

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback)
  window.addEventListener("offline", callback)
  return () => {
    window.removeEventListener("online", callback)
    window.removeEventListener("offline", callback)
  }
}

function getOnlineSnapshot() {
  return navigator.onLine
}

function getOnlineServerSnapshot() {
  return true
}

function subscribeStandalone(callback: () => void) {
  const mediaQuery = window.matchMedia("(display-mode: standalone)")
  mediaQuery.addEventListener("change", callback)
  window.addEventListener("appinstalled", callback)
  return () => {
    mediaQuery.removeEventListener("change", callback)
    window.removeEventListener("appinstalled", callback)
  }
}

function detectStandalone(): boolean {
  const nav = navigator as NavigatorWithInstall
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    nav.standalone === true
  )
}

function detectIOS(): boolean {
  const ua = navigator.userAgent
  const isClassicIOS = /iPad|iPhone|iPod/.test(ua)
  const isIPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1
  return isClassicIOS || isIPadOS
}

function detectWebInstall(): boolean {
  const nav = navigator as NavigatorWithInstall
  return typeof nav.install === "function"
}

let dismissListeners: Array<() => void> = []

function subscribeDismiss(listener: () => void): () => void {
  dismissListeners = [...dismissListeners, listener]
  return () => {
    dismissListeners = dismissListeners.filter((l) => l !== listener)
  }
}

function emitDismissChange() {
  for (const listener of dismissListeners) {
    listener()
  }
}

function readBannerDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_STORAGE_KEY)
    if (!raw) return false
    const timestamp = Number.parseInt(raw, 10)
    if (!Number.isFinite(timestamp)) return false
    return Date.now() - timestamp < DISMISS_TTL_MS
  } catch {
    return false
  }
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const isOnline = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getOnlineServerSnapshot
  )
  const isStandalone = useSyncExternalStore(
    subscribeStandalone,
    detectStandalone,
    () => false
  )
  const isIOS = useSyncExternalStore(subscribeNever, detectIOS, () => false)
  const supportsWebInstall = useSyncExternalStore(
    subscribeNever,
    detectWebInstall,
    () => false
  )
  const bannerDismissed = useSyncExternalStore(
    subscribeDismiss,
    readBannerDismissed,
    () => true
  )

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err)
        })
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const dismissBanner = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()))
    } catch {
      // Ignore storage quota errors
    }
    emitDismissChange()
  }, [])

  const triggerInstall = useCallback(async (): Promise<InstallOutcome> => {
    if (isInstalling) return "unavailable"
    const nav = navigator as NavigatorWithInstall

    setIsInstalling(true)
    try {
      if (typeof nav.install === "function") {
        // Prefer Web Install API directly within user activation
        await nav.install()
        setDeferredPrompt(null)
        return "installed"
      }

      if (deferredPrompt) {
        // Discard single-use event before awaiting user choice
        const promptEvent = deferredPrompt
        setDeferredPrompt(null)
        await promptEvent.prompt()
        const { outcome } = await promptEvent.userChoice
        if (outcome === "accepted") {
          return "installed"
        }
        return "dismissed"
      }

      return "unavailable"
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "dismissed"
      }
      console.error("[PWA] Install failed:", error)
      return "error"
    } finally {
      setIsInstalling(false)
    }
  }, [deferredPrompt, isInstalling])

  const canInstallPrompt = !isStandalone && (supportsWebInstall || deferredPrompt !== null)
  const isIOSInstallable = !isStandalone && isIOS && !canInstallPrompt

  return (
    <PwaContext.Provider
      value={{
        isStandalone,
        isOnline,
        canInstallPrompt,
        isIOSInstallable,
        isInstalling,
        bannerDismissed,
        dismissBanner,
        triggerInstall,
      }}
    >
      {children}
    </PwaContext.Provider>
  )
}

export function usePwa() {
  const ctx = useContext(PwaContext)
  if (!ctx) {
    throw new Error("usePwa must be used within a PwaProvider")
  }
  return ctx
}
