import { GlassPanel } from "@/components/ui/GlassPanel"

export default function SearchLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center p-4 sm:p-8 relative animate-pulse">
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="h-10 w-44 rounded-xl bg-white/10 mt-6 mb-2" />
      <div className="h-4 w-64 rounded bg-white/5 mb-8" />
      <GlassPanel className="w-full max-w-2xl mb-8 p-3">
        <div className="h-12 w-full rounded-xl bg-white/5" />
      </GlassPanel>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-5xl">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <GlassPanel key={i} className="p-4 flex flex-col gap-3">
            <div className="w-full aspect-[3/4] rounded-lg bg-white/5" />
            <div className="h-4 w-3/4 rounded bg-white/10 mx-auto" />
          </GlassPanel>
        ))}
      </div>
    </div>
  )
}
