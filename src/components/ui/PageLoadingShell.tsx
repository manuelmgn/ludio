import { ViewTransition } from "react"
import { GlassPanel } from "@/components/ui/GlassPanel"

export type PageLoadingVariant =
  | "generic"
  | "home"
  | "library"
  | "search"
  | "dashboard"
  | "detail"
  | "editor"
  | "playthrough"
  | "settings"

interface PageLoadingShellProps {
  variant?: PageLoadingVariant
  label?: string
}

/**
 * Unified loading skeleton system for all Flux routes (existing and future).
 * - Wrapped in `<ViewTransition exit="skeleton-exit" default="none">` so the skeleton
 *   hands off smoothly to the real page content when Suspense resolves.
 * - Uses `skeleton-delay-enter` (80ms delay) so cached/fast navigations never flash.
 * - Exposes `role="status"` and `aria-busy="true"` for assistive technologies.
 */
export function PageLoadingShell({
  variant = "generic",
  label = "Cargando contido...",
}: PageLoadingShellProps) {
  return (
    <ViewTransition exit="skeleton-exit" default="none">
      <div
        role="status"
        aria-busy="true"
        aria-live="polite"
        className="flex flex-1 flex-col items-center px-3 sm:px-6 py-6 sm:py-8 skeleton-delay-enter"
      >
        <span className="sr-only">{label}</span>

        {variant === "home" && <HomeSkeleton />}
        {variant === "library" && <LibrarySkeleton />}
        {variant === "search" && <SearchSkeleton />}
        {variant === "dashboard" && <DashboardSkeleton />}
        {variant === "detail" && <DetailSkeleton />}
        {variant === "editor" && <EditorSkeleton />}
        {variant === "playthrough" && <PlaythroughSkeleton />}
        {variant === "settings" && <SettingsSkeleton />}
        {variant === "generic" && <GenericSkeleton />}
      </div>
    </ViewTransition>
  )
}

function GenericSkeleton() {
  return (
    <div className="w-full max-w-6xl flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl skeleton-shimmer" />
          <div className="flex flex-col gap-2">
            <div className="h-6 w-44 rounded-lg skeleton-shimmer" />
            <div className="h-3.5 w-60 rounded skeleton-shimmer" />
          </div>
        </div>
        <div className="h-9 w-28 rounded-xl skeleton-shimmer hidden sm:block" />
      </div>

      <GlassPanel className="p-6 flex flex-col gap-4">
        <div className="h-5 w-48 rounded-lg skeleton-shimmer" />
        <div className="h-24 w-full rounded-xl skeleton-shimmer" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl skeleton-shimmer" />
          ))}
        </div>
      </GlassPanel>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
        {[1, 2, 3, 4].map((i) => (
          <GlassPanel key={i} variant="card" className="p-2.5 flex flex-col gap-2.5">
            <div className="w-full aspect-[3/4] rounded-xl skeleton-shimmer" />
            <div className="h-3.5 w-3/4 rounded skeleton-shimmer" />
          </GlassPanel>
        ))}
      </div>
    </div>
  )
}

function HomeSkeleton() {
  return (
    <div className="w-full max-w-5xl flex flex-col items-center gap-6 py-4">
      <div className="h-7 w-44 rounded-full skeleton-shimmer" />
      <div className="h-16 sm:h-20 w-64 sm:w-80 rounded-2xl skeleton-shimmer" />
      <div className="h-14 w-full max-w-2xl rounded-2xl skeleton-shimmer" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mt-6">
        {[1, 2, 3, 4].map((i) => (
          <GlassPanel key={i} variant="card" className="p-2.5 flex flex-col gap-3">
            <div className="w-full aspect-[3/4] rounded-xl skeleton-shimmer" />
            <div className="h-3.5 w-3/4 rounded skeleton-shimmer" />
          </GlassPanel>
        ))}
      </div>
    </div>
  )
}

function LibrarySkeleton() {
  return (
    <div className="w-full max-w-6xl flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl skeleton-shimmer" />
          <div className="h-9 w-44 rounded-xl skeleton-shimmer" />
        </div>
        <div className="h-10 w-full sm:w-72 rounded-xl skeleton-shimmer" />
      </div>

      <div className="flex gap-2 pb-2 border-b border-white/[0.08] overflow-hidden">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-9 w-24 shrink-0 rounded-xl skeleton-shimmer" />
        ))}
      </div>

      <div className="h-14 w-full rounded-2xl skeleton-shimmer" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
        {Array.from({ length: 10 }).map((_, i) => (
          <GlassPanel key={i} variant="card" className="p-2.5 flex flex-col gap-2.5">
            <div className="w-full aspect-[3/4] rounded-xl skeleton-shimmer" />
            <div className="h-3.5 w-4/5 rounded skeleton-shimmer" />
            <div className="h-3 w-1/2 rounded skeleton-shimmer" />
          </GlassPanel>
        ))}
      </div>
    </div>
  )
}

function SearchSkeleton() {
  return (
    <div className="w-full max-w-6xl flex flex-col items-center">
      <div className="h-6 w-36 rounded-full skeleton-shimmer mb-4" />
      <div className="h-10 w-44 rounded-xl skeleton-shimmer mb-2" />
      <div className="h-4 w-72 rounded skeleton-shimmer mb-8" />
      <GlassPanel className="w-full max-w-2xl mb-8 p-2.5">
        <div className="h-11 w-full rounded-xl skeleton-shimmer" />
      </GlassPanel>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full">
        {Array.from({ length: 12 }).map((_, i) => (
          <GlassPanel key={i} variant="card" className="p-2.5 flex flex-col gap-2.5">
            <div className="w-full aspect-[3/4] rounded-xl skeleton-shimmer" />
            <div className="h-3.5 w-3/4 rounded skeleton-shimmer" />
          </GlassPanel>
        ))}
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="w-full max-w-6xl flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl skeleton-shimmer" />
          <div className="flex flex-col gap-2">
            <div className="h-7 w-44 rounded-lg skeleton-shimmer" />
            <div className="h-3.5 w-56 rounded skeleton-shimmer" />
          </div>
        </div>
        <div className="h-9 w-28 rounded-xl skeleton-shimmer" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <GlassPanel key={i} variant="card" className="p-5 flex flex-col gap-3">
            <div className="h-3.5 w-24 rounded skeleton-shimmer" />
            <div className="h-8 w-16 rounded-lg skeleton-shimmer" />
          </GlassPanel>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <GlassPanel key={i} variant="card" className="p-6 h-44 flex flex-col gap-3">
            <div className="h-5 w-40 rounded skeleton-shimmer" />
            <div className="h-24 w-full rounded-xl skeleton-shimmer" />
          </GlassPanel>
        ))}
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="w-full max-w-5xl flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <div className="h-5 w-36 rounded-lg skeleton-shimmer" />
        <div className="h-5 w-24 rounded-lg skeleton-shimmer" />
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="w-36 sm:w-44 shrink-0 aspect-[3/4] rounded-2xl skeleton-shimmer" />
        <div className="flex-1 w-full flex flex-col gap-3.5 pt-1">
          <div className="flex gap-2">
            <div className="h-5 w-14 rounded-full skeleton-shimmer" />
            <div className="h-5 w-20 rounded-full skeleton-shimmer" />
            <div className="h-5 w-20 rounded-full skeleton-shimmer" />
          </div>
          <div className="h-9 w-3/4 rounded-xl skeleton-shimmer" />
          <div className="h-4 w-48 rounded skeleton-shimmer" />
          <div className="flex gap-3 pt-2">
            <div className="h-10 w-36 rounded-xl skeleton-shimmer" />
            <div className="h-10 w-32 rounded-xl skeleton-shimmer" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassPanel className="lg:col-span-2 p-6 flex flex-col gap-4">
          <div className="h-6 w-40 rounded-lg skeleton-shimmer" />
          <div className="h-24 w-full rounded-xl skeleton-shimmer" />
          <div className="h-16 w-full rounded-xl skeleton-shimmer" />
        </GlassPanel>
        <GlassPanel className="p-6 flex flex-col gap-3">
          <div className="h-6 w-32 rounded-lg skeleton-shimmer" />
          <div className="h-12 w-full rounded-xl skeleton-shimmer" />
          <div className="h-12 w-full rounded-xl skeleton-shimmer" />
        </GlassPanel>
      </div>
    </div>
  )
}

function EditorSkeleton() {
  return (
    <div className="w-full max-w-6xl flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
        <div className="h-5 w-48 rounded-lg skeleton-shimmer" />
        <div className="h-9 w-32 rounded-xl skeleton-shimmer" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl skeleton-shimmer" />
        <div className="flex flex-col gap-2">
          <div className="h-7 w-64 rounded-lg skeleton-shimmer" />
          <div className="h-3.5 w-80 max-w-full rounded skeleton-shimmer" />
        </div>
      </div>
      <GlassPanel className="p-6 flex flex-col gap-4">
        <div className="h-10 w-full rounded-xl skeleton-shimmer" />
        <div className="h-64 w-full rounded-2xl skeleton-shimmer" />
      </GlassPanel>
    </div>
  )
}

function PlaythroughSkeleton() {
  return (
    <div className="w-full max-w-6xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="h-5 w-44 rounded-lg skeleton-shimmer" />
        <div className="h-8 w-28 rounded-xl skeleton-shimmer" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
        <div className="flex flex-col gap-4">
          <GlassPanel className="p-5 flex flex-col gap-3">
            <div className="h-5 w-32 rounded skeleton-shimmer" />
            <div className="h-12 w-full rounded-xl skeleton-shimmer" />
            <div className="h-12 w-full rounded-xl skeleton-shimmer" />
          </GlassPanel>
          <GlassPanel className="p-5 flex flex-col gap-3">
            <div className="h-5 w-28 rounded skeleton-shimmer" />
            <div className="h-24 w-full rounded-xl skeleton-shimmer" />
          </GlassPanel>
        </div>
        <GlassPanel className="p-6 flex flex-col gap-4">
          <div className="h-7 w-48 rounded-lg skeleton-shimmer" />
          <div className="h-32 w-full rounded-2xl skeleton-shimmer" />
          <div className="h-32 w-full rounded-2xl skeleton-shimmer" />
        </GlassPanel>
      </div>
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="w-full max-w-6xl flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl skeleton-shimmer" />
        <div className="flex flex-col gap-2">
          <div className="h-7 w-40 rounded-lg skeleton-shimmer" />
          <div className="h-3.5 w-64 rounded skeleton-shimmer" />
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <GlassPanel key={i} className="p-6 flex flex-col gap-4">
          <div className="h-5 w-44 rounded-lg skeleton-shimmer" />
          <div className="h-11 w-full rounded-xl skeleton-shimmer" />
          <div className="flex flex-wrap gap-2">
            <div className="h-8 w-24 rounded-xl skeleton-shimmer" />
            <div className="h-8 w-28 rounded-xl skeleton-shimmer" />
            <div className="h-8 w-20 rounded-xl skeleton-shimmer" />
          </div>
        </GlassPanel>
      ))}
    </div>
  )
}
