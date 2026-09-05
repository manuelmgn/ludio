"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button } from "@/components/ui/Button"
import { addGameToLibrary } from "@/lib/actions/library"
import type { PlaythroughStatus } from "../../../generated/prisma/client"

interface AddGameFormProps {
  gameId: string
}

export function AddGameForm({ gameId }: AddGameFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [status, setStatus] = useState<"WISHED" | PlaythroughStatus>("WISHED")
  
  const isPlaythrough = status !== "WISHED"
  const isCompleted = status === "COMPLETED"

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const platform = formData.get("platform") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string
    const ratingStr = formData.get("rating") as string
    const publicReview = formData.get("publicReview") as string

    if (isPlaythrough && !platform.trim()) {
      setError("Debes indicar una plataforma para registrar tu actividad.")
      return
    }

    if (isCompleted && !ratingStr) {
      setError("Debes dejar una valoración para un juego completado.")
      return
    }

    const rating = isCompleted && ratingStr ? parseInt(ratingStr, 10) : undefined

    startTransition(async () => {
      const result = await addGameToLibrary(gameId, {
        status,
        platform: platform.trim(),
        startDate: startDate?.trim() || undefined,
        endDate: endDate?.trim() || undefined,
        rating,
        publicReview: publicReview?.trim() || undefined,
      })

      if (result.success) {
        router.push("/library")
      } else {
        setError(result.error || "Error desconocido")
      }
    })
  }

  return (
    <GlassPanel className="w-full flex flex-col gap-6">
      <h2 className="text-xl font-pixel text-white">Añadir a Mi Biblioteca</h2>
      
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="status" className="text-white/70 font-sans text-sm">Estado</label>
          <select 
            name="status" 
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "WISHED" | PlaythroughStatus)}
            disabled={isPending}
            className="rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors font-sans appearance-none"
          >
            <option value="WISHED">Deseado (Solo añadir a Wishlist)</option>
            <option value="PLAYING">Jugando</option>
            <option value="COMPLETED">Completado</option>
            <option value="ON_HOLD">En Pausa</option>
            <option value="ABANDONED">Abandonado</option>
          </select>
        </div>

        {isPlaythrough && (
          <>
            <div className="flex flex-col gap-2">
              <label htmlFor="platform" className="text-white/70 font-sans text-sm">Plataforma</label>
              <select 
                name="platform" 
                id="platform"
                disabled={isPending}
                className="rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors font-sans appearance-none"
              >
                <option value="">Selecciona Plataforma</option>
                <option value="PC">PC</option>
                <option value="PS5">PlayStation 5</option>
                <option value="PS4">PlayStation 4</option>
                <option value="Switch">Nintendo Switch</option>
                <option value="Xbox Series X/S">Xbox Series X/S</option>
                <option value="Xbox One">Xbox One</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex flex-col gap-2">
                <label htmlFor="startDate" className="text-white/70 font-sans text-sm">Fecha de inicio (opcional)</label>
                <input 
                  type="date" 
                  name="startDate" 
                  id="startDate"
                  disabled={isPending}
                  className="rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors font-sans"
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label htmlFor="endDate" className="text-white/70 font-sans text-sm">Fecha de fin (opcional)</label>
                <input 
                  type="date" 
                  name="endDate" 
                  id="endDate"
                  disabled={isPending}
                  className="rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors font-sans"
                />
              </div>
            </div>
          </>
        )}

        {isCompleted && (
          <div className="mt-4 p-4 border border-primary/30 bg-primary/5 rounded-lg flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="rating" className="text-white/70 font-sans text-sm">
                Valoración <span className="text-red-400">*</span>
              </label>
              <select 
                name="rating" 
                id="rating"
                disabled={isPending}
                required
                className="rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors font-sans appearance-none"
              >
                <option value="">Selecciona estrellas</option>
                <option value="5">⭐⭐⭐⭐⭐ (5) - Obra Maestra</option>
                <option value="4">⭐⭐⭐⭐ (4) - Muy Bueno</option>
                <option value="3">⭐⭐⭐ (3) - Bueno</option>
                <option value="2">⭐⭐ (2) - Regular</option>
                <option value="1">⭐ (1) - Malo</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="publicReview" className="text-white/70 font-sans text-sm">Reseña Pública (opcional)</label>
              <textarea 
                name="publicReview" 
                id="publicReview"
                disabled={isPending}
                rows={3}
                placeholder="¿Qué te ha parecido el juego?"
                className="rounded-lg border border-white/10 bg-black/40 p-4 text-white placeholder-white/30 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors font-sans resize-y"
              />
            </div>
          </div>
        )}

        <Button 
          type="submit" 
          disabled={isPending}
          className="mt-4"
        >
          {isPending ? "Guardando..." : "Guardar en Mi Biblioteca"}
        </Button>
      </form>
    </GlassPanel>
  )
}
