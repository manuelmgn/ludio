import React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: "default" | "elevated" | "accent" | "subtle"
  interactive?: boolean
}

export function GlassPanel({
  children,
  className,
  variant = "default",
  interactive = false,
  ...props
}: GlassPanelProps) {
  const variants = {
    default:
      "border-white/[0.08] bg-[#11111a]/75 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.75)] before:from-white/[0.06] before:to-transparent",
    elevated:
      "border-white/[0.12] bg-[#161624]/85 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.85)] before:from-white/[0.09] before:to-transparent",
    accent:
      "border-primary/30 bg-gradient-to-b from-primary/[0.12] via-[#131122]/85 to-[#10101a]/85 shadow-[0_16px_44px_-12px_rgba(168,85,247,0.22)] before:from-primary/15 before:to-transparent",
    subtle:
      "border-white/[0.06] bg-white/[0.025] shadow-lg before:from-white/[0.03] before:to-transparent",
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6 backdrop-blur-xl",
        "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-b",
        "after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-white/15 after:to-transparent",
        variants[variant],
        interactive &&
          "transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_18px_45px_-12px_rgba(168,85,247,0.25)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
