"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button } from "@/components/ui/Button"
import { addGameToLibrary } from "@/lib/actions/library"
import type { PlaythroughStatus } from "@generated/prisma/enums"
import { useLanguage } from "@/contexts/LanguageContext"

interface StoreOption {
  id: string
  name: string
}

interface AddGameFormProps {
  gameId: string
  customPlatforms?: string[]
  stores?: StoreOption[]
}

export function AddGameForm({ gameId, customPlatforms = [], stores = [] }: AddGameFormProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showPricing, setShowPricing] = useState(false)

  const [status, setStatus] = useState<"WISHED" | PlaythroughStatus>("WISHED")
  
  const isPlaythrough = status !== "WISHED"
  const isCompleted = status === "COMPLETED"

  const standardPlatforms = [
    "PC",
    "Steam Deck",
    "Nintendo Switch 2",
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

    // Pricing fields
    const purchasePriceStr = formData.get("purchasePrice") as string
    const purchaseStoreId = formData.get("purchaseStoreId") as string
    const purchaseDate = formData.get("purchaseDate") as string
    const salePriceStr = formData.get("salePrice") as string
    const saleStoreId = formData.get("saleStoreId") as string
    const saleDate = formData.get("saleDate") as string

    if (isPlaythrough && !platform?.trim()) {
      setError("Debes indicar unha plataforma para rexistrar a partida.")
      return
    }

    if (isCompleted && !ratingStr) {
      setError("Debes deixar unha valoración para un xogo completado.")
      return
    }

    const rating = isCompleted && ratingStr ? parseInt(ratingStr, 10) : undefined
    const purchasePrice = purchasePriceStr?.trim() ? parseFloat(purchasePriceStr) : undefined
    const salePrice = salePriceStr?.trim() ? parseFloat(salePriceStr) : undefined

    startTransition(async () => {
      const result = await addGameToLibrary(gameId, {
        status,
        platform: platform?.trim() || "PC",
        startDate: startDate?.trim() || undefined,
        endDate: endDate?.trim() || undefined,
        rating,
        publicReview: publicReview?.trim() || undefined,
        purchasePrice,
        purchaseStoreId: purchaseStoreId?.trim() || undefined,
        purchaseDate: purchaseDate?.trim() || undefined,
        salePrice,
        saleStoreId: saleStoreId?.trim() || undefined,
        saleDate: saleDate?.trim() || undefined,
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

            {/* Pricing toggle */}
            <button
              type="button"
              onClick={() => setShowPricing(!showPricing)}
              className="flex items-center gap-2 text-sm font-sans text-zinc-400 hover:text-white transition-colors self-start mt-1"
            >
              <span className="text-base">{showPricing ? "▼" : "▶"}</span>
              <span>💶 {t("pricing_toggle")}</span>
            </button>

            {showPricing && (
              <div className="p-4 border border-amber-500/20 bg-amber-500/5 rounded-xl flex flex-col gap-4 animate-in fade-in duration-200">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400/80">
                  {t("pricing_section_title")}
                </span>

                {/* Purchase section */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-sans text-zinc-400 flex items-center gap-1.5">
                    <span>💸</span> {t("purchase_label")}
                  </span>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label htmlFor="purchasePrice" className="text-white/50 font-sans text-xs">
                        {t("price_label")}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="purchasePrice"
                        id="purchasePrice"
                        placeholder="0.00"
                        disabled={isPending}
                        className="rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors font-sans text-sm"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label htmlFor="purchaseStoreId" className="text-white/50 font-sans text-xs">
                        {t("store_label")}
                      </label>
                      <select
                        name="purchaseStoreId"
                        id="purchaseStoreId"
                        disabled={isPending}
                        className="rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors font-sans text-sm"
                      >
                        <option value="">{t("select_store")}</option>
                        {stores.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label htmlFor="purchaseDate" className="text-white/50 font-sans text-xs">
                        {t("date_label")}
                      </label>
                      <input
                        type="date"
                        name="purchaseDate"
                        id="purchaseDate"
                        disabled={isPending}
                        className="rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors font-sans text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Sale section */}
                <div className="flex flex-col gap-3 pt-3 border-t border-white/5">
                  <span className="text-xs font-sans text-zinc-400 flex items-center gap-1.5">
                    <span>💰</span> {t("sale_label")}
                  </span>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label htmlFor="salePrice" className="text-white/50 font-sans text-xs">
                        {t("price_label")}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="salePrice"
                        id="salePrice"
                        placeholder="0.00"
                        disabled={isPending}
                        className="rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors font-sans text-sm"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label htmlFor="saleStoreId" className="text-white/50 font-sans text-xs">
                        {t("store_label")}
                      </label>
                      <select
                        name="saleStoreId"
                        id="saleStoreId"
                        disabled={isPending}
                        className="rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors font-sans text-sm"
                      >
                        <option value="">{t("select_store")}</option>
                        {stores.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label htmlFor="saleDate" className="text-white/50 font-sans text-xs">
                        {t("date_label")}
                      </label>
                      <input
                        type="date"
                        name="saleDate"
                        id="saleDate"
                        disabled={isPending}
                        className="rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors font-sans text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
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
