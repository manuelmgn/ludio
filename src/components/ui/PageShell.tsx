import React from "react"
import { cn } from "./GlassPanel"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  innerClassName?: string
}

/**
 * Standard full-width page wrapper aligned directly with the max-w-6xl Navbar container.
 */
export function PageContainer({
  children,
  className,
  innerClassName,
}: PageContainerProps) {
  return (
    <div className={cn("flex flex-1 flex-col items-center px-3 sm:px-6 py-6 sm:py-8", className)}>
      <div className={cn("w-full max-w-6xl flex flex-col gap-6", innerClassName)}>
        {children}
      </div>
    </div>
  )
}

interface PageHeaderProps {
  icon: React.ReactNode
  title: string
  description?: string
  badge?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

/**
 * Consistent top-of-page header used across primary sections (Library, Search, Dashboard, Settings, etc.).
 */
export function PageHeader({
  icon,
  title,
  description,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4",
        className
      )}
    >
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary-hover shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]">
            {icon}
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && <div className="w-full sm:w-auto shrink-0">{actions}</div>}
    </div>
  )
}
