"use client"

import { useEffect } from "react"
import Link from "next/link"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button } from "@/components/ui/Button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error caught:", error)
  }, [error])

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 relative">
      <div className="fixed top-1/3 left-1/3 w-96 h-96 bg-rose-900/20 rounded-full blur-[140px] -z-10" />
      <GlassPanel className="max-w-md w-full p-8 flex flex-col items-center text-center gap-4 border-rose-500/20 bg-rose-950/10">
        <span className="text-4xl">💥</span>
        <h1 className="text-2xl font-pixel text-white tracking-wider">
          Algo fallou
        </h1>
        <p className="text-sm font-sans text-zinc-300">
          Produciuse un erro inesperado. Podes tentalo de novo ou volver ao inicio.
        </p>
        {error.message && (
          <p className="text-xs font-mono text-rose-400 bg-rose-950/40 p-2.5 rounded-lg w-full break-all border border-rose-500/20">
            {error.message}
          </p>
        )}
        <div className="flex items-center gap-3 mt-4">
          <Button onClick={() => reset()} variant="primary">
            Tentar de novo
          </Button>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-sans transition-colors"
          >
            Inicio
          </Link>
        </div>
      </GlassPanel>
    </div>
  )
}
