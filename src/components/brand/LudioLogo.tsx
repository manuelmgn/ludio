"use client"

import { useId } from "react"

type MarkSize = "xs" | "sm" | "md" | "lg" | "xl"

const markSizeClasses: Record<MarkSize, string> = {
  xs: "w-5 h-5",
  sm: "w-8 h-8",
  md: "w-9 h-9",
  lg: "w-11 h-11",
  xl: "w-16 h-16",
}

interface LudioMarkProps {
  size?: MarkSize
  className?: string
  glow?: boolean
}

export function LudioMark({
  size = "sm",
  className = "",
  glow = true,
}: LudioMarkProps) {
  const uid = useId().replace(/:/g, "")
  const bgId = `ludio-bg-${uid}`
  const glowId = `ludio-glow-${uid}`
  const cyanId = `ludio-cyan-${uid}`
  const borderId = `ludio-border-${uid}`
  const letterId = `ludio-letter-${uid}`
  const sparkId = `ludio-spark-${uid}`

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={`${markSizeClasses[size]} shrink-0 ${
        glow ? "drop-shadow-[0_0_16px_rgba(168,85,247,0.45)]" : ""
      } ${className}`}
    >
      <defs>
        <linearGradient id={bgId} x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2e1065" />
          <stop offset="48%" stopColor="#140c29" />
          <stop offset="100%" stopColor="#08080f" />
        </linearGradient>
        <radialGradient
          id={glowId}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(18 14) rotate(48) scale(52)"
        >
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.58" />
          <stop offset="55%" stopColor="#7e22ce" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#08080d" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id={cyanId}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(47 18) rotate(135) scale(24)"
        >
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.48" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={borderId} x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e9d5ff" stopOpacity="0.6" />
          <stop offset="45%" stopColor="#a855f7" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={letterId} x1="16" y1="14" x2="46" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f3e8ff" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
        <linearGradient id={sparkId} x1="36" y1="13" x2="51" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="55%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${bgId})`} />
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${glowId})`} />
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${cyanId})`} />
      <path
        d="M18 3.5H46C53.4558 3.5 59.5 9.54416 59.5 17V18C59.5 11.5 53.5 6 46 6H18C10.5 6 4.5 11.5 4.5 18V17C4.5 9.54416 10.5442 3.5 18 3.5Z"
        fill="#ffffff"
        fillOpacity="0.12"
      />
      <rect
        x="2.75"
        y="2.75"
        width="58.5"
        height="58.5"
        rx="15.25"
        stroke={`url(#${borderId})`}
        strokeWidth="1.5"
      />

      <path
        d="M18 16.5C18 15.1193 19.1193 14 20.5 14H26.5C27.8807 14 29 15.1193 29 16.5V39H46.5C47.8807 39 49 40.1193 49 41.5V47.5C49 48.8807 47.8807 50 46.5 50H23.5C20.4624 50 18 47.5376 18 44.5V16.5Z"
        fill={`url(#${letterId})`}
      />
      <rect x="21.5" y="18" width="4" height="4" rx="1" fill="#7e22ce" fillOpacity="0.32" />

      <path d="M42.5 14L48.5 20L42.5 26L36.5 20L42.5 14Z" fill={`url(#${sparkId})`} />
      <rect x="35" y="29" width="5" height="5" rx="1.5" fill="#c084fc" fillOpacity="0.85" />
    </svg>
  )
}

interface LudioLogoProps {
  size?: "sm" | "md" | "lg"
  showVersion?: boolean
  className?: string
}

const wordmarkClasses = {
  sm: "text-[1.45rem]",
  md: "text-[1.75rem]",
  lg: "text-4xl",
}

const logoMarkSize: Record<"sm" | "md" | "lg", MarkSize> = {
  sm: "xs",
  md: "sm",
  lg: "lg",
}

export function LudioLogo({
  size = "md",
  showVersion = false,
  className = "",
}: LudioLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LudioMark
        size={logoMarkSize[size]}
        className="group-hover:scale-105 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
      />
      <span
        className={`font-pixel ${wordmarkClasses[size]} tracking-[0.12em] leading-none bg-gradient-to-b from-white via-purple-100 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_16px_rgba(168,85,247,0.5)] group-hover:from-white group-hover:to-cyan-200 transition-all`}
      >
        LUDIO
      </span>
      {showVersion && (
        <span className="hidden lg:inline-flex items-center text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-primary/15 text-purple-200 border border-primary/25">
          v0.2
        </span>
      )}
    </span>
  )
}
