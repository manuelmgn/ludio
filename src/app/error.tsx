"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button, buttonVariants } from "@/components/ui/Button"

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
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <GlassPanel
        variant="elevated"
        className="max-w-md w-full p-8 flex flex-col items-center text-center gap-4 border-rose-500/25"
      >
        <span className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <AlertTriangle className="w-7 h-7" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-display font-bold text-white tracking-tight">
          Algo fallou
        </h1>
        <p className="text-sm font-sans text-zinc-300 leading-relaxed">
          Produciuse un erro inesperado. Podes tentalo de novo ou volver ao inicio.
        </p>
        {error.message && (
          <p className="text-xs font-mono text-rose-300 bg-rose-950/40 p-3 rounded-xl w-full break-all border border-rose-500/25">
            {error.message}
          </p>
        )}
        <div className="flex items-center gap-3 mt-3">
          <Button onClick={() => reset()} variant="primary">
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Tentar de novo</span>
          </Button>
          <Link
            href="/"
            className={buttonVariants({ variant: "glass", size: "md" })}
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Inicio</span>
          </Link>
        </div>
      </GlassPanel>
    </div>
  )
}
