"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Star, Pencil, X, Check } from "lucide-react"
import { updateLibraryReview } from "@/lib/actions/library"
import { Button } from "@/components/ui/Button"
import { StarRatingInput } from "@/components/ui/StarRatingInput"

interface ReviewEditorProps {
  gameId: string
  initialRating: number | null
  initialReview: string | null
}

export function ReviewEditor({ gameId, initialRating, initialReview }: ReviewEditorProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [rating, setRating] = useState<number>(initialRating || 0)
  const [review, setReview] = useState(initialReview || "")
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  const handleSave = () => {
    setMessage(null)
    startTransition(async () => {
      const res = await updateLibraryReview(gameId, rating > 0 ? rating : null, review)
      if (res.success) {
        setIsEditing(false)
        router.refresh()
      } else {
        setMessage(res.error || "Erro ao gardar.")
      }
    })
  }

  if (!isEditing) {
    return (
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            A túa valoración e crítica
          </span>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1 text-xs font-mono text-primary-hover hover:text-white transition-colors cursor-pointer"
          >
            <Pencil className="w-3 h-3" aria-hidden="true" />
            <span>Editar</span>
          </button>
        </div>

        {initialRating ? (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= initialRating ? "fill-amber-400 text-amber-400" : "text-zinc-700"
                }`}
                aria-hidden="true"
              />
            ))}
            <span className="text-zinc-400 text-xs font-mono ml-1.5">({initialRating}/5)</span>
          </div>
        ) : (
          <span className="text-xs text-zinc-500 italic">Sen puntuación persoal</span>
        )}

        {initialReview ? (
          <p className="text-zinc-200 font-sans text-sm leading-relaxed italic mt-0.5 border-l-2 border-primary/40 pl-3">
            &ldquo;{initialReview}&rdquo;
          </p>
        ) : (
          <p className="text-xs text-zinc-500 font-sans">
            Engade unha crítica ou opinión rápida sobre este xogo.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-primary/[0.06] border border-primary/30 rounded-2xl p-4 flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-purple-200 uppercase tracking-wider">
          Editar valoración
        </span>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="inline-flex items-center gap-1 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Cancelar</span>
        </button>
      </div>

      <StarRatingInput value={rating} onChange={setRating} disabled={isPending} showValue />

      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        rows={3}
        disabled={isPending}
        placeholder="Escribe a túa crítica persoal..."
        className="w-full rounded-xl border border-white/10 bg-[#0b0b12]/80 p-3 text-zinc-100 placeholder-zinc-500 text-sm font-sans outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 resize-y leading-relaxed"
      />

      {message && <p className="text-xs text-rose-400">{message}</p>}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending} size="sm">
          <Check className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{isPending ? "Gardando..." : "Gardar cambios"}</span>
        </Button>
      </div>
    </div>
  )
}
