import React from "react"
import { cn } from "./GlassPanel"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "glass" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none cursor-pointer"

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-sm",
  }

  const variants = {
    primary:
      "bg-gradient-to-b from-purple-500 to-purple-700 text-white border border-purple-400/30 shadow-[0_6px_20px_-4px_rgba(168,85,247,0.55),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-purple-400 hover:to-purple-600 hover:shadow-[0_8px_28px_-4px_rgba(168,85,247,0.7)]",
    secondary:
      "bg-[#1c1c2b] text-zinc-100 hover:bg-[#252538] border border-white/10 hover:border-white/20 shadow-sm",
    glass:
      "bg-white/[0.06] text-zinc-100 hover:bg-white/[0.12] border border-white/10 hover:border-white/20 backdrop-blur-md",
    ghost:
      "bg-transparent text-zinc-400 hover:text-white hover:bg-white/[0.06]",
    danger:
      "bg-rose-600/90 hover:bg-rose-500 text-white border border-rose-400/30 shadow-[0_6px_18px_-4px_rgba(225,29,72,0.45)]",
  }

  return (
    <button
      className={cn(baseStyles, sizes[size], variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  )
}
