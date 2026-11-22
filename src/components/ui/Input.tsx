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
          <label htmlFor={id} className="text-xs font-sans text-zinc-300 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute left-3.5 text-zinc-500 pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={cn(
              "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all font-sans text-sm",
              icon && "pl-10",
              error && "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30",
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
