import { GlassPanel } from "@/components/ui/GlassPanel"

export default function GameDetailLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center p-4 sm:p-8 relative animate-pulse">
      <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="w-full max-w-4xl flex items-center justify-between mb-6">
        <div className="h-6 w-36 rounded-lg bg-white/10" />
        <div className="h-6 w-24 rounded-lg bg-white/10" />
      </div>

      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <GlassPanel className="p-4 flex flex-col items-center gap-4">
            <div className="w-full aspect-[3/4] rounded-xl bg-white/5" />
            <div className="h-6 w-3/4 rounded-lg bg-white/10" />
          </GlassPanel>
          <div className="h-12 w-full rounded-xl bg-white/5" />
          <div className="h-12 w-full rounded-xl bg-white/5" />
        </div>

        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <GlassPanel className="p-6 flex flex-col gap-4">
            <div className="h-8 w-48 rounded-lg bg-white/10" />
            <div className="h-20 w-full rounded-xl bg-white/5" />
            <div className="h-14 w-full rounded-xl bg-white/5" />
          </GlassPanel>
        </div>
      </div>
    </div>
  )
}
