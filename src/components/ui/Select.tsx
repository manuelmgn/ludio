import React from "react"
import { ChevronDown } from "lucide-react"
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
          <label
            htmlFor={id}
            className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative w-full">
          <select
            id={id}
            ref={ref}
            className={cn(
              "w-full min-h-[44px] sm:min-h-0 appearance-none rounded-xl border border-white/10 bg-[#0b0b12]/85 pl-4 pr-10 py-2.5 text-base sm:text-sm text-zinc-100 outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]",
              "hover:border-white/20 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all font-sans cursor-pointer",
              error && "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/25",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
          />
        </div>
        {error && <span className="text-xs text-rose-400 font-sans mt-0.5">{error}</span>}
      </div>
    )
  }
)
Select.displayName = "Select"
