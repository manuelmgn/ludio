import { GlassPanel } from "@/components/ui/GlassPanel"

export default function LibraryLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center p-4 sm:p-8 relative animate-pulse">
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="w-full max-w-5xl mt-6 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-48 rounded-xl bg-white/10" />
            <div className="h-6 w-16 rounded-full bg-white/5" />
          </div>
          <div className="h-10 w-full sm:w-72 rounded-xl bg-white/5" />
        </div>

        <div className="flex gap-2 pb-2 border-b border-white/10">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-9 w-24 rounded-xl bg-white/5" />
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <GlassPanel key={i} className="p-3 flex flex-col gap-3">
              <div className="w-full aspect-[3/4] rounded-xl bg-white/5" />
              <div className="h-4 w-3/4 rounded bg-white/10" />
              <div className="h-3 w-1/2 rounded bg-white/5" />
            </GlassPanel>
          ))}
        </div>
      </div>
    </div>
  )
}
