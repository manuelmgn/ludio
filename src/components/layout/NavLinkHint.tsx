"use client"

import { useLinkStatus } from "next/link"

interface NavLinkHintProps {
  className?: string
}

/**
 * Fixed-size, zero-layout-shift inline pending dot powered by Next.js `useLinkStatus`.
 * Only becomes visible if navigation takes longer than 120ms (handled via CSS animation delay).
 */
export function NavLinkHint({ className = "" }: NavLinkHintProps) {
  const { pending } = useLinkStatus()

  return (
    <span
      aria-hidden="true"
      data-pending={pending ? "true" : "false"}
      className={`nav-link-pending-dot w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(34,211,238,0.85)] shrink-0 ${className}`}
    />
  )
}
