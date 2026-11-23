"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Trash2, AlertTriangle } from "lucide-react"
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
      <div className="w-full flex flex-col gap-2.5 p-3 rounded-xl bg-rose-950/40 border border-rose-500/35">
        <p className="text-xs text-rose-200 font-sans flex items-start gap-2 leading-snug">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            ¿Eliminar <strong>{gameTitle}</strong> da túa biblioteca e diario?
          </span>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            className="flex-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium font-sans transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isPending ? t("saving") : "Si, eliminar"}
          </button>
          <button
            type="button"
            onClick={() => setShowConfirm(false)}
            disabled={isPending}
            className="flex-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-sans transition-colors cursor-pointer"
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
      type="button"
      onClick={() => setShowConfirm(true)}
      className="text-xs text-zinc-500 hover:text-rose-400 transition-colors font-sans inline-flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-rose-500/10 cursor-pointer"
      title="Eliminar da biblioteca"
    >
      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
      <span>Eliminar da biblioteca</span>
    </button>
  )
}
