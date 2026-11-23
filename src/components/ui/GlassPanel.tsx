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
      "border-white/[0.11] bg-[#12121e]/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_14px_40px_-14px_rgba(0,0,0,0.78)] before:from-white/[0.08] before:via-white/[0.02] before:to-transparent",
    elevated:
      "border-white/[0.16] bg-[#171726]/68 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_22px_54px_-16px_rgba(0,0,0,0.85)] before:from-white/[0.12] before:via-white/[0.03] before:to-transparent",
    accent:
      "border-primary/35 bg-gradient-to-br from-primary/[0.16] via-[#151226]/72 to-[#10101c]/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_18px_46px_-14px_rgba(168,85,247,0.28)] before:from-primary/20 before:to-transparent",
    subtle:
      "border-white/[0.08] bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_10px_28px_-10px_rgba(0,0,0,0.6)] before:from-white/[0.05] before:to-transparent",
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6 backdrop-blur-2xl backdrop-saturate-[180%]",
        "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br",
        "after:pointer-events-none after:absolute after:inset-x-4 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent",
        variants[variant],
        interactive &&
          "transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-primary/45 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_22px_48px_-14px_rgba(168,85,247,0.3)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
