"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Star, Pencil, X, Check } from "lucide-react"
import { updateLibraryReview, deletePlaythrough } from "@/lib/actions/library"
import { Button } from "@/components/ui/Button"

interface ReviewEditorProps {
  gameId: string
  initialRating: number | null
  initialReview: string | null
}

export function ReviewEditor({ gameId, initialRating, initialReview }: ReviewEditorProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [rating, setRating] = useState<number>(initialRating || 0)
  const [hoveredStar, setHoveredStar] = useState<number>(0)
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

  const activeStars = hoveredStar || rating

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

      {/* Interactive Star Picker */}
      <div
        className="flex items-center gap-1.5"
        onMouseLeave={() => setHoveredStar(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoveredStar(star)}
            onClick={() => setRating(rating === star ? 0 : star)}
            className="p-1 transition-transform hover:scale-115 cursor-pointer"
            title={`${star} estrela(s)`}
            aria-label={`${star} estrela(s)`}
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                star <= activeStars
                  ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.45)]"
                  : "text-zinc-600 hover:text-zinc-400"
              }`}
              aria-hidden="true"
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="text-xs font-mono text-amber-300 ml-2 tabular-nums">{rating}/5</span>
        )}
      </div>

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

export function DeletePlaythroughButton({
  playthroughId,
  gameId,
}: {
  playthroughId: string
  gameId: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!confirm("Eliminar esta partida do historial?")) return
    startTransition(async () => {
      const res = await deletePlaythrough(playthroughId, gameId)
      if (res.success) {
        router.refresh()
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="text-zinc-500 hover:text-rose-400 transition-colors p-1 rounded cursor-pointer"
      title="Eliminar partida"
      aria-label="Eliminar partida"
    >
      {isPending ? "..." : <X className="w-3.5 h-3.5" aria-hidden="true" />}
    </button>
  )
}
