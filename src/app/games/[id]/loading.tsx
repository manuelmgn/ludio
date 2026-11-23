import { GlassPanel } from "@/components/ui/GlassPanel"

export default function GameDetailLoading() {
  return (
    <div className="flex flex-1 flex-col items-center px-4 sm:px-8 py-6 sm:py-8">
      <div className="w-full max-w-5xl flex items-center justify-between mb-6">
        <div className="h-5 w-36 rounded-lg skeleton-shimmer" />
        <div className="h-5 w-24 rounded-lg skeleton-shimmer" />
      </div>

      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-7">
        <div className="w-full md:w-[320px] shrink-0 flex flex-col gap-4">
          <GlassPanel className="p-4 flex flex-col items-center gap-4">
            <div className="w-full aspect-[3/4] rounded-xl skeleton-shimmer" />
            <div className="h-6 w-3/4 rounded-lg skeleton-shimmer" />
          </GlassPanel>
          <div className="h-14 w-full rounded-2xl skeleton-shimmer" />
          <div className="h-14 w-full rounded-2xl skeleton-shimmer" />
        </div>

        <div className="flex-1 flex flex-col gap-6">
          <GlassPanel className="p-6 flex flex-col gap-4">
            <div className="h-7 w-48 rounded-lg skeleton-shimmer" />
            <div className="h-24 w-full rounded-2xl skeleton-shimmer" />
            <div className="h-16 w-full rounded-2xl skeleton-shimmer" />
          </GlassPanel>
        </div>
      </div>
    </div>
  )
}
