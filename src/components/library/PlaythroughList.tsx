"use client"

import { useState, useTransition } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { updatePlaythrough, deletePlaythrough } from "@/lib/actions/library"
import type { PlaythroughStatus } from "@generated/prisma/enums"

interface StoreOption {
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
}

interface PlaythroughListProps {
  gameId: string
  playthroughs: SerializedPlaythrough[]
  stores: StoreOption[]
  customPlatforms: string[]
}

export function PlaythroughList({
  gameId,
  playthroughs,
  stores,
  customPlatforms,
}: PlaythroughListProps) {
  const { t } = useLanguage()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [actionError, setActionError] = useState<string | null>(null)

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

  const statusLabels: Record<string, { label: string; color: string }> = {
    PLAYING: { label: t("filter_playing") || "Xogando", color: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
    COMPLETED: { label: t("filter_completed") || "Completado", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
    ON_HOLD: { label: t("filter_on_hold") || "En Pausa", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
    ABANDONED: { label: t("filter_abandoned") || "Abandonado", color: "bg-rose-500/20 text-rose-300 border-rose-500/40" },
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

  return (
    <div className="flex flex-col gap-3">
      {actionError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200 text-xs">
          {actionError}
        </div>
      )}

      {playthroughs.map((pt) => {
        const badge = statusLabels[pt.status] || {
          label: pt.status,
          color: "bg-zinc-800 text-zinc-300 border-zinc-700",
        }
        const isEditing = editingId === pt.id

        // Calculate profit / cost if both exist
        const hasBoth = pt.purchasePrice != null && pt.salePrice != null
        const diff = hasBoth ? (pt.salePrice! - pt.purchasePrice!) : null

        if (isEditing) {
          return (
            <div
              key={pt.id}
              className="p-4 rounded-xl bg-black/60 border border-primary/40 flex flex-col gap-4 animate-in fade-in"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-pixel text-primary uppercase tracking-wider">
                  ✏️ {t("edit_playthrough") || "Editar Partida"}
                </span>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  ✕ {t("cancel") || "Cancelar"}
                </button>
              </div>

              <form onSubmit={(e) => handleUpdate(e, pt.id)} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-white/70 font-sans text-xs">
                      {t("status_label")}
                    </label>
                    <select
                      name="status"
                      defaultValue={pt.status}
                      disabled={isPending}
                      className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-primary/50 text-xs font-sans"
                    >
                      <option value="PLAYING">🕹️ {t("filter_playing")}</option>
                      <option value="COMPLETED">🏆 {t("filter_completed")}</option>
                      <option value="ON_HOLD">⏸️ {t("filter_on_hold")}</option>
                      <option value="ABANDONED">🛑 {t("filter_abandoned")}</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-white/70 font-sans text-xs">
                      {t("platform_label")}
                    </label>
                    <select
                      name="platform"
                      defaultValue={pt.platform}
                      disabled={isPending}
                      className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-primary/50 text-xs font-sans"
                    >
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
                    <label className="text-white/70 font-sans text-xs">
                      {t("start_date")}
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      defaultValue={pt.startDate || ""}
                      disabled={isPending}
                      className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-primary/50 text-xs font-sans"
                    >
                    </input>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-white/70 font-sans text-xs">
                      {t("end_date")}
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      defaultValue={pt.endDate || ""}
                      disabled={isPending}
                      className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-primary/50 text-xs font-sans"
                    />
                  </div>
                </div>

                {/* Pricing Fields in Edit Mode */}
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex flex-col gap-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                    💶 {t("pricing_section_title")}
                  </span>

                  {/* Purchase */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-sans text-zinc-400">
                      💸 {t("purchase_label")}
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="purchasePrice"
                        placeholder={t("price_label")}
                        defaultValue={pt.purchasePrice != null ? pt.purchasePrice : ""}
                        disabled={isPending}
                        className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-white outline-none focus:border-primary/50 text-xs font-sans"
                      />
                      <select
                        name="purchaseStoreId"
                        defaultValue={pt.purchaseStoreId || ""}
                        disabled={isPending}
                        className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-white outline-none focus:border-primary/50 text-xs font-sans"
                      >
                        <option value="">{t("select_store")}</option>
                        {stores.map((s) => (
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
                        className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-white outline-none focus:border-primary/50 text-xs font-sans"
                      />
                    </div>
                  </div>

                  {/* Sale */}
                  <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
                    <span className="text-[11px] font-sans text-zinc-400">
                      💰 {t("sale_label")}
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="salePrice"
                        placeholder={t("price_label")}
                        defaultValue={pt.salePrice != null ? pt.salePrice : ""}
                        disabled={isPending}
                        className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-white outline-none focus:border-primary/50 text-xs font-sans"
                      />
                      <select
                        name="saleStoreId"
                        defaultValue={pt.saleStoreId || ""}
                        disabled={isPending}
                        className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-white outline-none focus:border-primary/50 text-xs font-sans"
                      >
                        <option value="">{t("select_store")}</option>
                        {stores.map((s) => (
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
                        className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-white outline-none focus:border-primary/50 text-xs font-sans"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    disabled={isPending}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 font-sans transition-colors"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-xs text-white font-medium font-sans shadow-[0_0_10px_rgba(157,0,255,0.3)] transition-all disabled:opacity-50"
                  >
                    {isPending ? t("saving") : t("save")}
                  </button>
                </div>
              </form>
            </div>
          )
        }

        return (
          <div
            key={pt.id}
            className="flex flex-col p-3.5 rounded-xl bg-black/40 border border-white/5 gap-2 group hover:border-white/10 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}>
                  {badge.label}
                </span>
                <span className="text-sm font-sans text-zinc-200">
                  {pt.platform}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs font-mono text-zinc-400">
                  {pt.startDate || pt.endDate ? (
                    <span>
                      {pt.startDate || "?"} → {pt.endDate || "Presente"}
                    </span>
                  ) : (
                    <span>Rexistrada</span>
                  )}
                </div>

                {/* Edit & Delete actions */}
                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingId(pt.id)}
                    className="p-1 rounded text-zinc-400 hover:text-primary transition-colors text-xs"
                    title={t("edit_playthrough") || "Editar partida"}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(pt.id)}
                    disabled={isPending}
                    className="p-1 rounded text-zinc-500 hover:text-rose-400 transition-colors text-xs"
                    title={t("delete") || "Eliminar"}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            {/* Pricing info */}
            {(pt.purchasePrice != null || pt.salePrice != null) && (
              <div className="flex flex-wrap items-center justify-between gap-3 mt-1 pt-2 border-t border-white/5">
                <div className="flex flex-wrap items-center gap-3">
                  {pt.purchasePrice != null && (
                    <div className="flex items-center gap-1.5 text-xs font-mono bg-rose-950/30 border border-rose-500/20 px-2 py-0.5 rounded-lg">
                      <span className="text-rose-400">💸 {t("purchase_label")}:</span>
                      <strong className="text-zinc-100">{pt.purchasePrice.toFixed(2)}€</strong>
                      {pt.purchaseStore && (
                        <span className="text-rose-300/80 font-sans">({pt.purchaseStore.name})</span>
                      )}
                      {pt.purchaseDate && (
                        <span className="text-zinc-500 text-[11px]">{pt.purchaseDate}</span>
                      )}
                    </div>
                  )}

                  {pt.salePrice != null && (
                    <div className="flex items-center gap-1.5 text-xs font-mono bg-emerald-950/30 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                      <span className="text-emerald-400">💰 {t("sale_label")}:</span>
                      <strong className="text-zinc-100">{pt.salePrice.toFixed(2)}€</strong>
                      {pt.saleStore && (
                        <span className="text-emerald-300/80 font-sans">({pt.saleStore.name})</span>
                      )}
                      {pt.saleDate && (
                        <span className="text-zinc-500 text-[11px]">{pt.saleDate}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Difference/Balance pill if both bought and sold */}
                {diff != null && (
                  <div
                    className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                      diff >= 0
                        ? "bg-emerald-950/50 text-emerald-300 border-emerald-500/30"
                        : "bg-zinc-900 text-zinc-400 border-white/10"
                    }`}
                  >
                    <span>
                      {diff >= 0 ? `+${diff.toFixed(2)}€ ganancia` : `${diff.toFixed(2)}€ custo neto`}
                    </span>
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
