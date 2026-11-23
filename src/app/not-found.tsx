import Link from "next/link"
import { Home, Library } from "lucide-react"
import { GlassPanel } from "@/components/ui/GlassPanel"

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <GlassPanel variant="elevated" className="max-w-md w-full p-8 flex flex-col items-center text-center gap-4">
        <span className="font-pixel text-8xl leading-none bg-gradient-to-b from-purple-300 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(168,85,247,0.55)]">
          404
        </span>
        <h1 className="text-xl font-display font-bold text-white tracking-tight">
          Xogo non atopado
        </h1>
        <p className="text-sm font-sans text-zinc-400 leading-relaxed">
          A pantalla ou recurso que buscas parece que non existe neste nivel.
        </p>
        <div className="flex items-center gap-3 mt-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 text-white text-sm font-sans font-medium shadow-[0_6px_20px_-4px_rgba(168,85,247,0.5)] transition-all"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Inicio</span>
          </Link>
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 hover:text-white text-sm font-sans border border-white/10 transition-colors"
          >
            <Library className="w-4 h-4" aria-hidden="true" />
            <span>Biblioteca</span>
          </Link>
        </div>
      </GlassPanel>
    </div>
  )
}
