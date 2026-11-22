import React from "react"
import { cn } from "./GlassPanel"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={id} className="text-xs font-sans text-zinc-300 uppercase tracking-wider">
            {label}
          </label>
        )}
        <select
          id={id}
          ref={ref}
          className={cn(
            "w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all font-sans text-sm cursor-pointer",
            error && "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-xs text-rose-400 font-sans mt-0.5">{error}</span>}
      </div>
    )
  }
)
Select.displayName = "Select"
