import React from "react"
import { cn } from "./GlassPanel"

export type ButtonVariant = "primary" | "secondary" | "glass" | "ghost" | "danger"
export type ButtonSize = "sm" | "md" | "lg"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-xl font-sans font-medium transition-[transform,background-color,border-color,box-shadow,color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] disabled:opacity-45 disabled:pointer-events-none cursor-pointer"

const sizes: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-b from-purple-500 to-purple-700 text-white border border-purple-300/35 shadow-[0_6px_22px_-4px_rgba(168,85,247,0.58),inset_0_1px_0_rgba(255,255,255,0.3)] hover:from-purple-400 hover:to-purple-600 hover:shadow-[0_10px_28px_-4px_rgba(168,85,247,0.72)]",
  secondary:
    "bg-[#1c1c2b]/85 text-zinc-100 hover:bg-[#252538] border border-white/12 hover:border-white/22 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md",
  glass:
    "bg-white/[0.07] text-zinc-100 hover:bg-white/[0.13] border border-white/14 hover:border-white/24 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]",
  ghost:
    "bg-transparent text-zinc-400 hover:text-white hover:bg-white/[0.07]",
  danger:
    "bg-rose-600/90 hover:bg-rose-500 text-white border border-rose-400/35 shadow-[0_6px_18px_-4px_rgba(225,29,72,0.45),inset_0_1px_0_rgba(255,255,255,0.2)]",
}

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
} = {}) {
  return cn(baseStyles, sizes[size], variants[variant], className)
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      {...props}
    >
      {children}
    </button>
  )
}
