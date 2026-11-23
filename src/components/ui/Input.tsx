import React from "react"
import { cn } from "./GlassPanel"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={id}
            className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full group">
          {icon && (
            <div className="absolute left-3.5 text-zinc-500 group-focus-within:text-primary-hover transition-colors pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={cn(
              "w-full min-h-[44px] sm:min-h-0 rounded-xl border border-white/10 bg-[#0b0b12]/80 px-4 py-2.5 text-base sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]",
              "hover:border-white/20 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:bg-[#0d0d16] transition-all font-sans",
              icon && "pl-10",
              error && "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/25",
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-rose-400 font-sans mt-0.5">{error}</span>}
      </div>
    )
  }
)
Input.displayName = "Input"
