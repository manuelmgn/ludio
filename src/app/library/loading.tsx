import { GlassPanel } from "@/components/ui/GlassPanel"

export default function LibraryLoading() {
  return (
    <div className="flex flex-1 flex-col items-center px-4 sm:px-8 py-6 sm:py-8">
      <div className="w-full max-w-6xl flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl skeleton-shimmer" />
            <div className="h-9 w-44 rounded-xl skeleton-shimmer" />
          </div>
          <div className="h-10 w-full sm:w-72 rounded-xl skeleton-shimmer" />
        </div>

        <div className="flex gap-2 pb-2 border-b border-white/[0.08]">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-9 w-24 rounded-xl skeleton-shimmer" />
          ))}
        </div>

        <div className="h-14 w-full rounded-2xl skeleton-shimmer" />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
          {Array.from({ length: 10 }).map((_, i) => (
            <GlassPanel key={i} className="p-2.5 flex flex-col gap-2.5">
              <div className="w-full aspect-[3/4] rounded-xl skeleton-shimmer" />
              <div className="h-3.5 w-4/5 rounded skeleton-shimmer" />
              <div className="h-3 w-1/2 rounded skeleton-shimmer" />
            </GlassPanel>
          ))}
        </div>
      </div>
    </div>
  )
}
