import { GlassPanel } from "@/components/ui/GlassPanel"

export default function RootLoading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-8 py-12">
      <div className="w-full max-w-5xl flex flex-col items-center gap-6">
        <div className="h-7 w-44 rounded-full skeleton-shimmer" />
        <div className="h-20 w-72 rounded-2xl skeleton-shimmer" />
        <div className="h-14 w-full max-w-2xl rounded-2xl skeleton-shimmer" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mt-8">
          {[1, 2, 3, 4].map((i) => (
            <GlassPanel key={i} className="p-2.5 flex flex-col gap-3">
              <div className="w-full aspect-[3/4] rounded-xl skeleton-shimmer" />
              <div className="h-3.5 w-3/4 rounded skeleton-shimmer" />
            </GlassPanel>
          ))}
        </div>
      </div>
    </div>
  )
}
