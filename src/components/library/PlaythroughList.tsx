"use client"

import { useState, useTransition } from "react"
import {
  Pencil,
  Trash2,
  X,
  Check,
  TrendingDown,
  TrendingUp,
  Euro,
  Calendar,
  Gamepad2,
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { updatePlaythrough, deletePlaythrough } from "@/lib/actions/library"
import { Button } from "@/components/ui/Button"
import {
  STANDARD_PLATFORMS,
  sortAlphabetically,
  sortByNameAlphabetically,
} from "@/lib/game-utils"
import type { PlaythroughStatus } from "@generated/prisma/enums"

interface StoreOption {
  id: string
  name: string
}

interface PlanOption {
  id: string
  name: string
}

export interface SerializedPlaythrough {
  id: string
  status: PlaythroughStatus
  platform: string
  startDate: string | null
  endDate: string | null
  purchasePrice: number | null
  purchaseStoreId: string | null
  purchaseStore?: { id: string; name: string } | null
  purchaseDate: string | null
  salePrice: number | null
  saleStoreId: string | null
  saleStore?: { id: string; name: string } | null
  saleDate: string | null
  includedInPlan?: boolean
  planId?: string | null
  plan?: { id: string; name: string } | null
}

interface PlaythroughListProps {
  gameId: string
  playthroughs: SerializedPlaythrough[]
  stores: StoreOption[]
  plans?: PlanOption[]
  customPlatforms: string[]
}

export function PlaythroughList({
  gameId,
  playthroughs,
  stores,
  plans = [],
  customPlatforms,
}: PlaythroughListProps) {
  const { t } = useLanguage()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [actionError, setActionError] = useState<string | null>(null)

  const allPlatforms = sortAlphabetically(
    Array.from(new Set([...STANDARD_PLATFORMS, ...customPlatforms]))
  )
  const sortedStores = sortByNameAlphabetically(stores)
  void plans

  const statusLabels: Record<string, { label: string; dot: string; color: string }> = {
    PLAYING: {
      label: t("filter_playing") || "Xogando",
      dot: "bg-sky-400",
      color: "bg-sky-950/75 text-sky-200 border-sky-400/35",
    },
    COMPLETED: {
      label: t("filter_completed") || "Completado",
      dot: "bg-emerald-400",
      color: "bg-emerald-950/75 text-emerald-200 border-emerald-400/35",
    },
    ON_HOLD: {
      label: t("filter_on_hold") || "En Pausa",
      dot: "bg-amber-400",
      color: "bg-amber-950/75 text-amber-200 border-amber-400/35",
    },
    ABANDONED: {
      label: t("filter_abandoned") || "Abandonado",
      dot: "bg-rose-400",
      color: "bg-rose-950/75 text-rose-200 border-rose-400/35",
    },
  }

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>, ptId: string) => {
    e.preventDefault()
    setActionError(null)

    const formData = new FormData(e.currentTarget)
    const status = formData.get("status") as PlaythroughStatus
    const platform = formData.get("platform") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string

    const purchasePriceStr = formData.get("purchasePrice") as string
    const purchaseStoreId = formData.get("purchaseStoreId") as string
    const purchaseDate = formData.get("purchaseDate") as string

    const salePriceStr = formData.get("salePrice") as string
    const saleStoreId = formData.get("saleStoreId") as string
    const saleDate = formData.get("saleDate") as string

    const purchasePrice = purchasePriceStr?.trim() ? parseFloat(purchasePriceStr) : null
    const salePrice = salePriceStr?.trim() ? parseFloat(salePriceStr) : null

    startTransition(async () => {
      const res = await updatePlaythrough(ptId, gameId, {
        status,
        platform: platform || "PC",
        startDate: startDate?.trim() || null,
        endDate: endDate?.trim() || null,
        purchasePrice,
        purchaseStoreId: purchaseStoreId || null,
        purchaseDate: purchaseDate?.trim() || null,
        salePrice,
        saleStoreId: saleStoreId || null,
        saleDate: saleDate?.trim() || null,
      })

      if (res.success) {
        setEditingId(null)
      } else {
        setActionError(res.error || "Erro ao gardar cambios.")
      }
    })
  }

  const handleDelete = (ptId: string) => {
    if (!confirm(t("delete_playthrough_confirm") || "Seguro que queres eliminar esta partida?")) {
      return
    }

    startTransition(async () => {
      const res = await deletePlaythrough(ptId, gameId)
      if (!res.success) {
        alert(res.error || "Erro ao eliminar.")
      }
    })
  }

  const fieldClass =
    "rounded-xl border border-white/10 bg-[#0b0b12]/85 px-3 py-2 text-zinc-100 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 text-xs font-sans transition-all"

  return (
    <div className="flex flex-col gap-3">
      {actionError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-200 text-xs">
          {actionError}
        </div>
      )}

      {playthroughs.map((pt) => {
        const badge = statusLabels[pt.status] || {
          label: pt.status,
          dot: "bg-zinc-400",
          color: "bg-zinc-800 text-zinc-300 border-zinc-700",
        }
        const isEditing = editingId === pt.id

        const hasBoth = pt.purchasePrice != null && pt.salePrice != null
        const diff = hasBoth ? pt.salePrice! - pt.purchasePrice! : null

        if (isEditing) {
          return (
            <div
              key={pt.id}
              className="p-4 rounded-2xl bg-[#0e0e18]/90 border border-primary/40 flex flex-col gap-4 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-purple-200 uppercase tracking-wider">
                  <Pencil className="w-3.5 h-3.5 text-primary-hover" aria-hidden="true" />
                  <span>{t("edit_playthrough") || "Editar Partida"}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t("cancel") || "Cancelar"}</span>
                </button>
              </div>

              <form onSubmit={(e) => handleUpdate(e, pt.id)} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
                      {t("status_label")}
                    </label>
                    <select name="status" defaultValue={pt.status} disabled={isPending} className={fieldClass}>
                      <option value="PLAYING">{t("filter_playing")}</option>
                      <option value="COMPLETED">{t("filter_completed")}</option>
                      <option value="ON_HOLD">{t("filter_on_hold")}</option>
                      <option value="ABANDONED">{t("filter_abandoned")}</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
                      {t("platform_label")}
                    </label>
                    <select name="platform" defaultValue={pt.platform} disabled={isPending} className={fieldClass}>
                      {allPlatforms.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
                      {t("start_date")}
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      defaultValue={pt.startDate || ""}
                      disabled={isPending}
                      className={fieldClass}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
                      {t("end_date")}
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      defaultValue={pt.endDate || ""}
                      disabled={isPending}
                      className={fieldClass}
                    />
                  </div>
                </div>

                {/* Pricing Fields in Edit Mode */}
                <div className="p-3.5 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 flex flex-col gap-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-amber-300">
                    <Euro className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t("pricing_section_title")}</span>
                  </span>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-sans text-zinc-400 inline-flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-rose-400" aria-hidden="true" />
                      <span>{t("purchase_label")}</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="purchasePrice"
                        placeholder={t("price_label")}
                        defaultValue={pt.purchasePrice != null ? pt.purchasePrice : ""}
                        disabled={isPending}
                        className={fieldClass}
                      />
                      <select
                        name="purchaseStoreId"
                        defaultValue={pt.purchaseStoreId || ""}
                        disabled={isPending}
                        className={fieldClass}
                      >
                        <option value="">{t("select_store")}</option>
                        {sortedStores.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="date"
                        name="purchaseDate"
                        defaultValue={pt.purchaseDate || ""}
                        disabled={isPending}
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-2.5 border-t border-white/[0.06]">
                    <span className="text-[11px] font-sans text-zinc-400 inline-flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-400" aria-hidden="true" />
                      <span>{t("sale_label")}</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="salePrice"
                        placeholder={t("price_label")}
                        defaultValue={pt.salePrice != null ? pt.salePrice : ""}
                        disabled={isPending}
                        className={fieldClass}
                      />
                      <select
                        name="saleStoreId"
                        defaultValue={pt.saleStoreId || ""}
                        disabled={isPending}
                        className={fieldClass}
                      >
                        <option value="">{t("select_store")}</option>
                        {sortedStores.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="date"
                        name="saleDate"
                        defaultValue={pt.saleDate || ""}
                        disabled={isPending}
                        className={fieldClass}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(null)}
                    disabled={isPending}
                  >
                    {t("cancel")}
                  </Button>
                  <Button type="submit" size="sm" disabled={isPending}>
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{isPending ? t("saving") : t("save")}</span>
                  </Button>
                </div>
              </form>
            </div>
          )
        }

        return (
          <div
            key={pt.id}
            className="flex flex-col p-4 rounded-2xl bg-[#0c0c15]/75 border border-white/[0.07] gap-2.5 group hover:border-white/15 transition-all"
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                  <span>{badge.label}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-sans text-zinc-200 bg-white/[0.04] border border-white/[0.08] px-2.5 py-0.5 rounded-full">
                  <Gamepad2 className="w-3 h-3 text-zinc-400" aria-hidden="true" />
                  <span>{pt.platform}</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                  <Calendar className="w-3 h-3 text-zinc-500" aria-hidden="true" />
                  {pt.startDate || pt.endDate ? (
                    <span>
                      {pt.startDate || "?"} → {pt.endDate || "Presente"}
                    </span>
                  ) : (
                    <span>Rexistrada</span>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => setEditingId(pt.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-primary-hover hover:bg-primary/10 transition-colors cursor-pointer"
                    title={t("edit_playthrough") || "Editar partida"}
                    aria-label={t("edit_playthrough") || "Editar partida"}
                  >
                    <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(pt.id)}
                    disabled={isPending}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title={t("delete") || "Eliminar"}
                    aria-label={t("delete") || "Eliminar"}
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {(pt.purchasePrice != null || pt.salePrice != null) && (
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-white/[0.06]">
                <div className="flex flex-wrap items-center gap-2">
                  {pt.purchasePrice != null && (
                    <div className="flex items-center gap-1.5 text-xs font-mono bg-rose-950/30 border border-rose-500/20 px-2.5 py-1 rounded-lg">
                      <TrendingDown className="w-3 h-3 text-rose-400" aria-hidden="true" />
                      <span className="text-rose-300/90">{t("purchase_label")}:</span>
                      <strong className="text-zinc-100 tabular-nums">
                        {pt.purchasePrice.toFixed(2)}€
                      </strong>
                      {pt.purchaseStore && (
                        <span className="text-rose-200/75 font-sans">({pt.purchaseStore.name})</span>
                      )}
                      {pt.purchaseDate && (
                        <span className="text-zinc-500 text-[11px]">{pt.purchaseDate}</span>
                      )}
                    </div>
                  )}

                  {pt.salePrice != null && (
                    <div className="flex items-center gap-1.5 text-xs font-mono bg-emerald-950/30 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                      <TrendingUp className="w-3 h-3 text-emerald-400" aria-hidden="true" />
                      <span className="text-emerald-300/90">{t("sale_label")}:</span>
                      <strong className="text-zinc-100 tabular-nums">
                        {pt.salePrice.toFixed(2)}€
                      </strong>
                      {pt.saleStore && (
                        <span className="text-emerald-200/75 font-sans">({pt.saleStore.name})</span>
                      )}
                      {pt.saleDate && (
                        <span className="text-zinc-500 text-[11px]">{pt.saleDate}</span>
                      )}
                    </div>
                  )}
                </div>

                {diff != null && (
                  <div
                    className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border tabular-nums ${
                      diff >= 0
                        ? "bg-emerald-950/50 text-emerald-300 border-emerald-500/30"
                        : "bg-zinc-900/80 text-zinc-400 border-white/10"
                    }`}
                  >
                    {diff >= 0
                      ? `+${diff.toFixed(2)}€ ganancia`
                      : `${diff.toFixed(2)}€ custo neto`}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
