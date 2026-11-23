import { GlassPanel } from "@/components/ui/GlassPanel"

export default function SearchLoading() {
  return (
    <div className="flex flex-1 flex-col items-center px-4 sm:px-8 py-6 sm:py-8">
      <div className="h-6 w-36 rounded-full skeleton-shimmer mb-4" />
      <div className="h-10 w-44 rounded-xl skeleton-shimmer mb-2" />
      <div className="h-4 w-72 rounded skeleton-shimmer mb-8" />
      <GlassPanel className="w-full max-w-2xl mb-8 p-2.5">
        <div className="h-11 w-full rounded-xl skeleton-shimmer" />
      </GlassPanel>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full max-w-6xl">
        {Array.from({ length: 12 }).map((_, i) => (
          <GlassPanel key={i} className="p-2.5 flex flex-col gap-2.5">
            <div className="w-full aspect-[3/4] rounded-xl skeleton-shimmer" />
            <div className="h-3.5 w-3/4 rounded skeleton-shimmer" />
          </GlassPanel>
        ))}
      </div>
    </div>
  )
}
