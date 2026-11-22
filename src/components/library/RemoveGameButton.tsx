"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { removeGameFromLibrary } from "@/lib/actions/library"
import { useLanguage } from "@/contexts/LanguageContext"

interface RemoveGameButtonProps {
  gameId: string
  gameTitle: string
}

export function RemoveGameButton({ gameId, gameTitle }: RemoveGameButtonProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRemove = () => {
    setError(null)
    startTransition(async () => {
      const res = await removeGameFromLibrary(gameId)
      if (res.success) {
        router.push("/library")
      } else {
        setError(res.error || "Erro ao eliminar.")
        setShowConfirm(false)
      }
    })
  }

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30">
        <p className="text-xs text-rose-200 font-sans">
          ¿Eliminar <strong>{gameTitle}</strong> da túa biblioteca e diario?
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRemove}
            disabled={isPending}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium font-sans transition-colors disabled:opacity-50"
          >
            {isPending ? t("saving") : "Si, eliminar"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isPending}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 text-xs font-sans transition-colors"
          >
            Cancelar
          </button>
        </div>
        {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-xs text-zinc-500 hover:text-rose-400 transition-colors font-sans flex items-center gap-1.5 self-center"
      title="Eliminar da biblioteca"
    >
      <span>🗑️</span>
      <span>Eliminar da biblioteca</span>
    </button>
  )
}
