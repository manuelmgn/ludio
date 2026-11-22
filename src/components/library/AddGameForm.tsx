"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button } from "@/components/ui/Button"
import { addGameToLibrary } from "@/lib/actions/library"
import type { PlaythroughStatus } from "@generated/prisma/enums"
import { useLanguage } from "@/contexts/LanguageContext"

interface AddGameFormProps {
  gameId: string
  customPlatforms?: string[]
}

export function AddGameForm({ gameId, customPlatforms = [] }: AddGameFormProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [status, setStatus] = useState<"WISHED" | PlaythroughStatus>("WISHED")
  
  const isPlaythrough = status !== "WISHED"
  const isCompleted = status === "COMPLETED"

  const standardPlatforms = [
    "PC",
    "Steam Deck",
    "Nintendo Switch",
    "PlayStation 5",
    "PlayStation 4",
    "Xbox Series X/S",
    "Xbox One",
    "Nintendo 3DS",
    "PlayStation 3",
    "PlayStation 2",
    "Retro / Emulador",
  ]

  const allPlatforms = Array.from(new Set([...standardPlatforms, ...customPlatforms]))

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const platform = formData.get("platform") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string
    const ratingStr = formData.get("rating") as string
    const publicReview = formData.get("publicReview") as string

    if (isPlaythrough && !platform?.trim()) {
      setError("Debes indicar unha plataforma para rexistrar a partida.")
      return
    }

    if (isCompleted && !ratingStr) {
      setError("Debes deixar unha valoración para un xogo completado.")
      return
    }

    const rating = isCompleted && ratingStr ? parseInt(ratingStr, 10) : undefined

    startTransition(async () => {
      const result = await addGameToLibrary(gameId, {
        status,
        platform: platform?.trim() || "PC",
        startDate: startDate?.trim() || undefined,
        endDate: endDate?.trim() || undefined,
        rating,
        publicReview: publicReview?.trim() || undefined,
      })

      if (result.success) {
        router.push("/library")
      } else {
        setError(result.error || "Erro descoñecido ao engadir.")
      }
    })
  }

  return (
    <GlassPanel className="w-full flex flex-col gap-6">
      <h2 className="text-xl font-pixel text-white flex items-center gap-2">
        <span>🎮</span>
        <span>{t("add_to_library")}</span>
      </h2>
      
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="status" className="text-white/70 font-sans text-sm">
            {t("status_label")}
          </label>
          <select 
            name="status" 
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "WISHED" | PlaythroughStatus)}
            disabled={isPending}
            className="rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors font-sans"
          >
            <option value="WISHED">⭐ {t("filter_wish")}</option>
            <option value="PLAYING">🕹️ {t("filter_playing")}</option>
            <option value="COMPLETED">🏆 {t("filter_completed")}</option>
            <option value="ON_HOLD">⏸️ {t("filter_on_hold")}</option>
            <option value="ABANDONED">🛑 {t("filter_abandoned")}</option>
          </select>
        </div>

        {isPlaythrough && (
          <>
            <div className="flex flex-col gap-2">
              <label htmlFor="platform" className="text-white/70 font-sans text-sm">
                {t("platform_label")}
              </label>
              <select 
                name="platform" 
                id="platform"
                disabled={isPending}
                className="rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors font-sans"
              >
                <option value="">{t("select_platform") || "Selecciona Plataforma..."}</option>
                {allPlatforms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex flex-col gap-2">
                <label htmlFor="startDate" className="text-white/70 font-sans text-sm">
                  {t("start_date") || "Data de inicio (opcional)"}
                </label>
                <input 
                  type="date" 
                  name="startDate" 
                  id="startDate"
                  disabled={isPending}
                  className="rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors font-sans"
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label htmlFor="endDate" className="text-white/70 font-sans text-sm">
                  {t("end_date") || "Data de fin (opcional)"}
                </label>
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
          <div className="mt-2 p-4 border border-primary/30 bg-primary/5 rounded-xl flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="rating" className="text-white/70 font-sans text-sm">
                {t("rating_label")} <span className="text-primary">*</span>
              </label>
              <select 
                name="rating" 
                id="rating"
                disabled={isPending}
                required
                className="rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors font-sans"
              >
                <option value="">{t("select_rating") || "Selecciona estrelas..."}</option>
                <option value="5">⭐⭐⭐⭐⭐ (5) - Obra Mestra</option>
                <option value="4">⭐⭐⭐⭐ (4) - Moi Bo</option>
                <option value="3">⭐⭐⭐ (3) - Bo</option>
                <option value="2">⭐⭐ (2) - Regular</option>
                <option value="1">⭐ (1) - Frouxo</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="publicReview" className="text-white/70 font-sans text-sm">
                {t("review_label") || "Crítica / Reseña rápida (opcional)"}
              </label>
              <textarea 
                name="publicReview" 
                id="publicReview"
                rows={3}
                disabled={isPending}
                placeholder={t("review_placeholder") || "Que che pareceu a experiencia? Que destacarías?..."}
                className="rounded-lg border border-white/10 bg-black/40 p-3 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors font-sans resize-none text-sm placeholder-zinc-500"
              />
            </div>
          </div>
        )}

        <Button type="submit" disabled={isPending} className="mt-2 w-full">
          {isPending ? t("saving") : t("add_to_library")}
        </Button>
      </form>
    </GlassPanel>
  )
}
