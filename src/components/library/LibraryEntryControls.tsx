"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
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
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
            A túa valoración e crítica
          </span>
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs font-mono text-primary hover:underline"
          >
            ✏️ Editar
          </button>
        </div>

        {initialRating ? (
          <div className="text-amber-400 text-sm font-mono tracking-widest">
            {"⭐".repeat(initialRating)}
            <span className="text-zinc-400 text-xs ml-1.5">({initialRating}/5)</span>
          </div>
        ) : (
          <span className="text-xs text-zinc-500 italic">Sen puntuación persoal</span>
        )}

        {initialReview ? (
          <p className="text-zinc-200 font-sans text-sm italic mt-1">
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
    <div className="bg-primary/5 border border-primary/30 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-purple-300 uppercase tracking-wider">
          Editar valoración
        </span>
        <button
          onClick={() => setIsEditing(false)}
          className="text-xs font-mono text-zinc-400 hover:text-white"
        >
          ✕ Cancelar
        </button>
      </div>

      {/* Interactive Star Picker */}
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(rating === star ? 0 : star)}
            className={`text-xl transition-transform hover:scale-110 ${
              star <= rating ? "opacity-100" : "opacity-25 grayscale"
            }`}
            title={`${star} estrela(s)`}
          >
            ⭐
          </button>
        ))}
        {rating > 0 && (
          <span className="text-xs font-mono text-amber-400 ml-2">{rating}/5</span>
        )}
      </div>

      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        rows={3}
        disabled={isPending}
        placeholder="Escribe a túa crítica persoal..."
        className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-white text-sm font-sans outline-none focus:border-primary/50 resize-none"
      />

      {message && <p className="text-xs text-rose-400">{message}</p>}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending} className="text-xs py-1.5 px-4">
          {isPending ? "Gardando..." : "Gardar cambios"}
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
      onClick={handleDelete}
      disabled={isPending}
      className="text-zinc-500 hover:text-rose-400 transition-colors p-1 rounded"
      title="Eliminar partida"
      aria-label="Eliminar partida"
    >
      {isPending ? "..." : "✕"}
    </button>
  )
}
