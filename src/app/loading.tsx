import { GlassPanel } from "@/components/ui/GlassPanel"

export default function RootLoading() {
  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center p-4 sm:p-8 relative">
      <div className="fixed top-1/4 left-1/3 w-96 h-96 bg-primary/20 rounded-full blur-[140px] -z-10 animate-pulse" />
      <div className="w-full max-w-4xl flex flex-col items-center gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-full bg-white/10" />
        <div className="h-16 w-3/4 max-w-lg rounded-2xl bg-white/10" />
        <div className="h-12 w-full max-w-xl rounded-2xl bg-white/5" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mt-8">
          {[1, 2, 3, 4].map((i) => (
            <GlassPanel key={i} className="p-3 flex flex-col gap-3">
              <div className="w-full aspect-[3/4] rounded-xl bg-white/5" />
              <div className="h-4 w-3/4 rounded bg-white/10" />
            </GlassPanel>
          ))}
        </div>
      </div>
    </div>
  )
}
