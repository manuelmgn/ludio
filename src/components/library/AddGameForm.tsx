"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Gamepad2,
  Euro,
  ChevronDown,
  ChevronRight,
  Star,
  TrendingDown,
  TrendingUp,
  Plus,
} from "lucide-react"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button } from "@/components/ui/Button"
import { Select } from "@/components/ui/Select"
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
  const [selectedRating, setSelectedRating] = useState<number>(0)

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

  const statusOptions: { id: "WISHED" | PlaythroughStatus; label: string; dot: string }[] = [
    { id: "WISHED", label: t("filter_wish") || "Desexado", dot: "bg-purple-400" },
    { id: "PLAYING", label: t("filter_playing") || "Xogando", dot: "bg-sky-400" },
    { id: "COMPLETED", label: t("filter_completed") || "Completado", dot: "bg-emerald-400" },
    { id: "ON_HOLD", label: t("filter_on_hold") || "En Pausa", dot: "bg-amber-400" },
    { id: "ABANDONED", label: t("filter_abandoned") || "Abandonado", dot: "bg-rose-400" },
  ]

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const platform = formData.get("platform") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string
    const publicReview = formData.get("publicReview") as string

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

    if (isCompleted && selectedRating === 0) {
      setError("Debes deixar unha valoración para un xogo completado.")
      return
    }

    const rating = isCompleted && selectedRating > 0 ? selectedRating : undefined
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

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#0b0b12]/85 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all font-sans"

  return (
    <GlassPanel className="w-full flex flex-col gap-5">
      <h2 className="text-lg font-display font-semibold text-white flex items-center gap-2.5">
        <Gamepad2 className="w-5 h-5 text-primary-hover" aria-hidden="true" />
        <span>{t("add_to_library")}</span>
      </h2>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-200 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Visual Status Selector */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            {t("status_label")}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {statusOptions.map((opt) => {
              const active = status === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isPending}
                  onClick={() => setStatus(opt.id)}
                  aria-pressed={active}
                  className={`px-3 py-2 rounded-xl text-xs font-sans border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    active
                      ? "bg-primary/20 text-white border-primary/60 shadow-[0_0_16px_rgba(168,85,247,0.25)] font-medium"
                      : "bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:bg-white/[0.07] hover:text-zinc-200"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />
                  <span className="truncate">{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {isPlaythrough && (
          <>
            <Select
              name="platform"
              id="platform"
              label={t("platform_label")}
              disabled={isPending}
            >
              <option value="">{t("select_platform") || "Selecciona Plataforma..."}</option>
              {allPlatforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="startDate"
                  className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider"
                >
                  {t("start_date") || "Data de inicio (opcional)"}
                </label>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  disabled={isPending}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="endDate"
                  className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider"
                >
                  {t("end_date") || "Data de fin (opcional)"}
                </label>
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  disabled={isPending}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Pricing toggle */}
            <button
              type="button"
              onClick={() => setShowPricing(!showPricing)}
              aria-expanded={showPricing}
              className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-amber-300 transition-colors self-start py-1 cursor-pointer"
            >
              {showPricing ? (
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
              ) : (
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              )}
              <Euro className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>{t("pricing_toggle")}</span>
            </button>

            {showPricing && (
              <div className="p-4 border border-amber-500/20 bg-amber-500/[0.04] rounded-2xl flex flex-col gap-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300">
                  {t("pricing_section_title")}
                </span>

                {/* Purchase */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-xs font-sans text-zinc-300 flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
                    <span>{t("purchase_label")}</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="purchasePrice" className="text-zinc-500 font-sans text-[11px]">
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
                        className={inputClass}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="purchaseStoreId" className="text-zinc-500 font-sans text-[11px]">
                        {t("store_label")}
                      </label>
                      <select
                        name="purchaseStoreId"
                        id="purchaseStoreId"
                        disabled={isPending}
                        className={inputClass}
                      >
                        <option value="">{t("select_store")}</option>
                        {stores.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="purchaseDate" className="text-zinc-500 font-sans text-[11px]">
                        {t("date_label")}
                      </label>
                      <input
                        type="date"
                        name="purchaseDate"
                        id="purchaseDate"
                        disabled={isPending}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Sale */}
                <div className="flex flex-col gap-2.5 pt-3 border-t border-white/[0.06]">
                  <span className="text-xs font-sans text-zinc-300 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                    <span>{t("sale_label")}</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="salePrice" className="text-zinc-500 font-sans text-[11px]">
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
                        className={inputClass}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="saleStoreId" className="text-zinc-500 font-sans text-[11px]">
                        {t("store_label")}
                      </label>
                      <select
                        name="saleStoreId"
                        id="saleStoreId"
                        disabled={isPending}
                        className={inputClass}
                      >
                        <option value="">{t("select_store")}</option>
                        {stores.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="saleDate" className="text-zinc-500 font-sans text-[11px]">
                        {t("date_label")}
                      </label>
                      <input
                        type="date"
                        name="saleDate"
                        id="saleDate"
                        disabled={isPending}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {isCompleted && (
          <div className="p-4 border border-primary/30 bg-primary/[0.06] rounded-2xl flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-mono text-purple-200 uppercase tracking-wider">
                {t("rating_label")} <span className="text-primary-hover">*</span>
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedRating(star)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                      selectedRating === star
                        ? "bg-amber-500/20 border-amber-400/50 text-amber-200"
                        : "bg-black/30 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        star <= selectedRating ? "fill-amber-400 text-amber-400" : "text-zinc-500"
                      }`}
                      aria-hidden="true"
                    />
                    <span>{star}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="publicReview"
                className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider"
              >
                {t("review_label") || "Crítica / Reseña rápida (opcional)"}
              </label>
              <textarea
                name="publicReview"
                id="publicReview"
                rows={3}
                disabled={isPending}
                placeholder={
                  t("review_placeholder") || "Que che pareceu a experiencia? Que destacarías?..."
                }
                className="rounded-xl border border-white/10 bg-[#0b0b12]/80 p-3 text-zinc-100 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all font-sans resize-y text-sm placeholder-zinc-500 leading-relaxed"
              />
            </div>
          </div>
        )}

        <Button type="submit" disabled={isPending} className="mt-1 w-full">
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>{isPending ? t("saving") : t("add_to_library")}</span>
        </Button>
      </form>
    </GlassPanel>
  )
}
