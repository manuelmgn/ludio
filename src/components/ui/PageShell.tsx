import React from "react"
import { GlassPanel, cn } from "./GlassPanel"

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

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

/**
 * Consistent empty state card used across Library, Dashboard, Home, Search, Journal and Canvas.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <GlassPanel
      className={cn(
        "p-10 sm:p-12 text-center flex flex-col items-center justify-center gap-3",
        className
      )}
    >
      <span className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary-hover mb-1">
        {icon}
      </span>
      <p className="text-zinc-100 font-display font-medium text-base">{title}</p>
      {description && (
        <p className="text-zinc-400 text-xs sm:text-sm font-sans max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </GlassPanel>
  )
}
