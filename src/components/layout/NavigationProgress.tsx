"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

const SHOW_DELAY_MS = 120
const FINISH_HIDE_DELAY_MS = 240
const FAILSAFE_TIMEOUT_MS = 12000

type ProgressPhase = "idle" | "loading" | "finishing"

interface ProgressState {
  phase: ProgressPhase
  progress: number
}

/**
 * Subtle, non-intrusive top navigation progress bar.
 * - Waits 120ms before appearing so instant/cached navigations never flash.
 * - Anchored via `view-transition-name: nav-progress` so it stays pinned above view transitions.
 * - Respects `prefers-reduced-motion` via CSS.
 */
export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [state, setState] = useState<ProgressState>({ phase: "idle", progress: 0 })

  const phaseRef = useRef<ProgressPhase>("idle")
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
      if (phaseRef.current === "loading") {
        phaseRef.current = "finishing"
        setState({ phase: "finishing", progress: 100 })
        hideTimerRef.current = window.setTimeout(() => {
          phaseRef.current = "idle"
          setState({ phase: "idle", progress: 0 })
        }, FINISH_HIDE_DELAY_MS)
      } else {
        phaseRef.current = "idle"
        setState({ phase: "idle", progress: 0 })
      }
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
        phaseRef.current = "loading"
        setState({ phase: "loading", progress: 22 })

        trickleTimerRef.current = window.setInterval(() => {
          setState((current) => {
            if (current.phase !== "loading" || current.progress >= 88) return current
            const step = Math.max(2, (90 - current.progress) * 0.16)
            return {
              phase: "loading",
              progress: Math.min(88, current.progress + step),
            }
          })
        }, 220)
      }, SHOW_DELAY_MS)

      failsafeTimerRef.current = window.setTimeout(() => {
        isNavigatingRef.current = false
        clearAllTimers()
        phaseRef.current = "idle"
        setState({ phase: "idle", progress: 0 })
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
      if (
        !hrefAttr ||
        hrefAttr.startsWith("#") ||
        hrefAttr.startsWith("mailto:") ||
        hrefAttr.startsWith("tel:")
      ) {
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

  const isVisible = state.phase !== "idle"

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
        style={{ transform: `scaleX(${state.progress / 100})` }}
      >
        <div className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/55 to-transparent nav-progress-sheen" />
      </div>
    </div>
  )
}
