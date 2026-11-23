import { GlassPanel } from "@/components/ui/GlassPanel"

export default function DashboardLoading() {
  return (
    <div className="flex flex-1 flex-col items-center px-4 sm:px-8 py-6 sm:py-8">
      <div className="w-full max-w-5xl flex flex-col gap-6">
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
          <GlassPanel variant="card" className="p-6 h-44 flex flex-col gap-3">
            <div className="h-5 w-40 rounded skeleton-shimmer" />
            <div className="h-24 w-full rounded-xl skeleton-shimmer" />
          </GlassPanel>
          <GlassPanel variant="card" className="p-6 h-44 flex flex-col gap-3">
            <div className="h-5 w-40 rounded skeleton-shimmer" />
            <div className="h-24 w-full rounded-xl skeleton-shimmer" />
          </GlassPanel>
        </div>
      </div>
    </div>
  )
}
