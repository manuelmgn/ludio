import Link from "next/link"
import { GlassPanel } from "@/components/ui/GlassPanel"

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 relative">
      <div className="fixed top-1/3 right-1/3 w-96 h-96 bg-primary/20 rounded-full blur-[140px] -z-10" />
      <GlassPanel className="max-w-md w-full p-8 flex flex-col items-center text-center gap-4">
        <span className="font-pixel text-7xl text-primary drop-shadow-[0_0_20px_rgba(157,0,255,0.6)]">
          404
        </span>
        <h1 className="text-xl font-pixel text-white tracking-wider">
          XOGO NON ATOPADO
        </h1>
        <p className="text-sm font-sans text-zinc-300">
          A pantalla ou recurso que buscas parece que non existe neste nivel.
        </p>
        <div className="flex items-center gap-3 mt-4">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-sans font-medium shadow-[0_0_15px_rgba(157,0,255,0.4)] transition-all"
          >
            Volver ao Inicio
          </Link>
          <Link
            href="/library"
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-sm font-sans border border-white/10 transition-colors"
          >
            Biblioteca
          </Link>
        </div>
      </GlassPanel>
    </div>
  )
}
