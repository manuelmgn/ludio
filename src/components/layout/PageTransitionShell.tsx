"use client"

import { ViewTransition, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

interface PageTransitionShellProps {
  children: React.ReactNode
}

/**
 * Single unified page transition shell mounted in `RootLayout`.
 * Keying `<ViewTransition>` by `pathname` ensures:
 * - Every existing and future route at any nesting depth transitions coherently.
 * - Query string changes (search, filters) never trigger unwanted full-page transitions.
 * - Lateral routes use `page-transition`, while drill-down / back links tagged with
 *   `transitionTypes={['nav-forward']}` or `['nav-back']` animate directionally.
 * - Browsers without the View Transitions API fall back cleanly to `page-enter-fallback`.
 * - Programmatic focus moves to `#main-content` when focus would otherwise be abandoned
 *   after a route change, without stealing focus from an autofocused control inside `<main>`.
 */
export function PageTransitionShell({ children }: PageTransitionShellProps) {
  const pathname = usePathname()
  const prevPathnameRef = useRef(pathname)

  useEffect(() => {
    if (prevPathnameRef.current === pathname) return
    prevPathnameRef.current = pathname

    const main = document.getElementById("main-content")
    if (!main) return

    const active = document.activeElement
    const focusAbandoned =
      !active || active === document.body || !main.contains(active)

    if (focusAbandoned) {
      main.focus({ preventScroll: true })
    }
  }, [pathname])

  return (
    <ViewTransition
      key={pathname}
      enter={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "page-transition",
      }}
      exit={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "page-transition",
      }}
      default="none"
    >
      <div className="flex-1 flex flex-col page-enter-fallback">{children}</div>
    </ViewTransition>
  )
}
