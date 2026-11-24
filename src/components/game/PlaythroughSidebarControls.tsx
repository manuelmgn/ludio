"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Star, Pencil, Check, X, Trash2, AlertTriangle, Loader2, Euro, Layers } from "lucide-react"
import type { PlaythroughStatus } from "@generated/prisma/enums"
import {
  updatePlaythrough,
  updatePlaythroughRating,
  deletePlaythrough,
} from "@/lib/actions/library"
import {
  STANDARD_PLATFORMS,
  STATUS_META,
  sortAlphabetically,
  sortByNameAlphabetically,
} from "@/lib/game-utils"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button } from "@/components/ui/Button"
import type { StoreOption, PlanOption } from "@/components/game/AddToLibraryModal"

/* ============================================================================
 * 1. Per-Playthrough Rating & Opinion Card
 * ========================================================================== */
interface PlaythroughRatingCardProps {
  playthroughId: string
  gameId: string
  initialRating: number | null
  initialReview: string | null
}

export function PlaythroughRatingCard({
  playthroughId,
  gameId,
  initialRating,
  initialReview,
}: PlaythroughRatingCardProps) {
  const router = useRouter()
  const [rating, setRating] = useState<number>(initialRating ?? 0)
  const [hovered, setHovered] = useState<number>(0)
  const [isEditingReview, setIsEditingReview] = useState(false)
  const [review, setReview] = useState(initialReview ?? "")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleStarClick = (star: number) => {
    const prevRating = rating
    const nextRating = rating === star ? 0 : star
    setHovered(0)
    setErrorMsg(null)
    setRating(nextRating)
    startTransition(async () => {
      const res = await updatePlaythroughRating(
        playthroughId,
        gameId,
        nextRating > 0 ? nextRating : null
      )
      if (res.success) {
        router.refresh()
      } else {
        setRating(prevRating)
        setErrorMsg(res.error || "Non se puido gardar a valoración.")
      }
    })
  }

  const handleSaveReview = () => {
    setErrorMsg(null)
    startTransition(async () => {
      const res = await updatePlaythroughRating(
        playthroughId,
        gameId,
        rating > 0 ? rating : null,
        review
      )
      if (res.success) {
        setIsEditingReview(false)
        router.refresh()
      } else {
        setErrorMsg(res.error || "Non se puido gardar a opinión.")
      }
    })
  }

  const activeStars = hovered || rating

  return (
    <GlassPanel className="p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
          Valoración desta partida
        </h3>
        {rating > 0 ? (
          <span className="text-xs font-mono text-amber-300 tabular-nums">{rating}/5</span>
        ) : (
          <span className="text-[11px] text-zinc-500">Sen valorar</span>
        )}
      </div>

      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={isPending}
            onMouseEnter={() => setHovered(star)}
            onClick={() => handleStarClick(star)}
            className="p-1.5 sm:p-0.5 transition-transform hover:scale-110 cursor-pointer"
            title={`${star} estrela(s)`}
            aria-label={`${star} estrela(s)`}
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                star <= activeStars
                  ? "fill-amber-400 text-amber-400"
                  : "text-zinc-600 hover:text-zinc-400"
              }`}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>

      {errorMsg && (
        <p className="text-xs text-rose-400">{errorMsg}</p>
      )}

      {!isEditingReview ? (
        <div className="flex flex-col gap-2">
          {initialReview ? (
            <p className="text-xs text-zinc-300 italic leading-relaxed border-l-2 border-primary/40 pl-3">
              &ldquo;{initialReview}&rdquo;
            </p>
          ) : (
            <p className="text-[11px] text-zinc-500">
              Preme nas estrelas ou engade unha opinión sobre esta partida.
            </p>
          )}
          <button
            type="button"
            onClick={() => setIsEditingReview(true)}
            className="self-start inline-flex items-center gap-1 text-[11px] font-mono text-primary-hover hover:text-white transition-colors cursor-pointer"
          >
            <Pencil className="w-3 h-3" aria-hidden="true" />
            <span>{initialReview ? "Editar opinión" : "Engadir opinión"}</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={3}
            disabled={isPending}
            placeholder="Que che pareceu o xogo nesta partida?"
            className="w-full rounded-xl border border-white/10 bg-[#0b0b12]/90 p-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-primary/60 resize-y"
          />
          <div className="flex items-center justify-end gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setReview(initialReview ?? "")
                setIsEditingReview(false)
              }}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="button" size="sm" onClick={handleSaveReview} disabled={isPending}>
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isPending ? "Gardando..." : "Gardar"}</span>
            </Button>
          </div>
        </div>
      )}
    </GlassPanel>
  )
}

/* ============================================================================
 * 2. Playthrough Details + Pricing Card (with clean inline edit mode)
 * ========================================================================== */
export interface PlaythroughDetailData {
  id: string
  status: PlaythroughStatus
  platform: string
  startDate: string | null
  endDate: string | null
  purchasePrice: number | null
  purchaseStoreId: string | null
  purchaseStoreName: string | null
  purchaseDate: string | null
  salePrice: number | null
  saleStoreId: string | null
  saleStoreName: string | null
  saleDate: string | null
  includedInPlan: boolean
  planId: string | null
  planName: string | null
}

interface PlaythroughDetailsCardProps {
  gameId: string
  playthrough: PlaythroughDetailData
  stores: StoreOption[]
  plans: PlanOption[]
  customPlatforms: string[]
}

export function PlaythroughDetailsCard({
  gameId,
  playthrough,
  stores,
  plans,
  customPlatforms,
}: PlaythroughDetailsCardProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [acquisitionMode, setAcquisitionMode] = useState<"price" | "plan">(
    playthrough.includedInPlan ? "plan" : "price"
  )
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const allPlatforms = sortAlphabetically(
    Array.from(new Set([...STANDARD_PLATFORMS, ...customPlatforms, playthrough.platform]))
  )
  const sortedStores = sortByNameAlphabetically(stores)
  const sortedPlans = sortByNameAlphabetically(plans)
  const meta = STATUS_META[playthrough.status]
  const net =
    !playthrough.includedInPlan &&
    playthrough.purchasePrice != null &&
    playthrough.salePrice != null
      ? playthrough.salePrice - playthrough.purchasePrice
      : null

  const openEditMode = () => {
    setAcquisitionMode(playthrough.includedInPlan ? "plan" : "price")
    setError(null)
    setIsEditing(true)
  }

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)

    const status = fd.get("status") as PlaythroughStatus
    const platform = (fd.get("platform") as string)?.trim() || playthrough.platform
    const startDate = (fd.get("startDate") as string)?.trim() || null
    const endDate = (fd.get("endDate") as string)?.trim() || null

    const isPlan = acquisitionMode === "plan"
    const planId = (fd.get("planId") as string)?.trim() || null

    const purchasePriceStr = (fd.get("purchasePrice") as string)?.trim()
    const purchaseStoreId = (fd.get("purchaseStoreId") as string)?.trim() || null
    const purchaseDate = (fd.get("purchaseDate") as string)?.trim() || null

    const salePriceStr = (fd.get("salePrice") as string)?.trim()
    const saleStoreId = (fd.get("saleStoreId") as string)?.trim() || null
    const saleDate = (fd.get("saleDate") as string)?.trim() || null

    startTransition(async () => {
      const res = await updatePlaythrough(playthrough.id, gameId, {
        status,
        platform,
        startDate,
        endDate,
        includedInPlan: isPlan,
        planId: isPlan ? planId : null,
        purchasePrice: !isPlan && purchasePriceStr ? parseFloat(purchasePriceStr) : null,
        purchaseStoreId: !isPlan ? purchaseStoreId : null,
        purchaseDate: !isPlan ? purchaseDate : null,
        salePrice: !isPlan && salePriceStr ? parseFloat(salePriceStr) : null,
        saleStoreId: !isPlan ? saleStoreId : null,
        saleDate: !isPlan ? saleDate : null,
      })

      if (res.success) {
        setIsEditing(false)
        router.refresh()
      } else {
        setError(res.error || "Erro ao gardar cambios.")
      }
    })
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#0b0b12]/90 px-2.5 py-1.5 text-xs text-zinc-100 outline-none focus:border-primary/60"

  if (isEditing) {
    return (
      <GlassPanel className="p-5 border-primary/35">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-xs font-mono uppercase tracking-wider text-purple-200">
            Editar partida
          </h3>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Cancelar</span>
          </button>
        </div>

        {error && (
          <div className="p-2.5 mb-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-3 text-xs">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-zinc-400">Estado</label>
            <select name="status" defaultValue={playthrough.status} className={inputClass}>
              <option value="PLAYING">Xogando</option>
              <option value="COMPLETED">Completado</option>
              <option value="ON_HOLD">En Pausa</option>
              <option value="ABANDONED">Abandonado</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-zinc-400">Plataforma</label>
            <select name="platform" defaultValue={playthrough.platform} className={inputClass}>
              {allPlatforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-zinc-400">Inicio</label>
              <input
                type="date"
                name="startDate"
                defaultValue={playthrough.startDate || ""}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-zinc-400">Fin</label>
              <input
                type="date"
                name="endDate"
                defaultValue={playthrough.endDate || ""}
                className={inputClass}
              />
            </div>
          </div>

          {/* Pricing or Subscription Plan fields */}
          <div className="pt-2.5 mt-1 border-t border-white/[0.08] flex flex-col gap-2.5">
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-black/35 border border-white/[0.08]">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setAcquisitionMode("price")}
                aria-pressed={acquisitionMode === "price"}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-sans transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  acquisitionMode === "price"
                    ? "bg-amber-500/20 text-amber-100 border border-amber-400/40 font-medium"
                    : "text-zinc-400 hover:text-zinc-200 border border-transparent"
                }`}
              >
                <Euro className="w-3 h-3" aria-hidden="true" />
                <span>Compra / Venda</span>
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => setAcquisitionMode("plan")}
                aria-pressed={acquisitionMode === "plan"}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-sans transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  acquisitionMode === "plan"
                    ? "bg-purple-500/25 text-purple-100 border border-purple-400/45 font-medium"
                    : "text-zinc-400 hover:text-zinc-200 border border-transparent"
                }`}
              >
                <Layers className="w-3 h-3" aria-hidden="true" />
                <span>Incluído nun plan</span>
              </button>
            </div>

            {acquisitionMode === "plan" ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-purple-200">
                  Plan de subscrición (opcional)
                </label>
                <select
                  name="planId"
                  defaultValue={playthrough.planId || ""}
                  className={inputClass}
                >
                  <option value="">Sen especificar (calquera plan)</option>
                  {sortedPlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Marcarase como xogado dentro dun plan de subscrición sen contabilizar prezo.
                </p>
              </div>
            ) : (
              <>
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300">
                  Compra
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="purchasePrice"
                    placeholder="Prezo (€)"
                    defaultValue={playthrough.purchasePrice ?? ""}
                    className={inputClass}
                  />
                  <select
                    name="purchaseStoreId"
                    defaultValue={playthrough.purchaseStoreId || ""}
                    className={inputClass}
                  >
                    <option value="">Tenda...</option>
                    {sortedStores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="date"
                  name="purchaseDate"
                  defaultValue={playthrough.purchaseDate || ""}
                  className={inputClass}
                />

                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 pt-1">
                  Venda
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="salePrice"
                    placeholder="Prezo (€)"
                    defaultValue={playthrough.salePrice ?? ""}
                    className={inputClass}
                  />
                  <select
                    name="saleStoreId"
                    defaultValue={playthrough.saleStoreId || ""}
                    className={inputClass}
                  >
                    <option value="">Tenda...</option>
                    {sortedStores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="date"
                  name="saleDate"
                  defaultValue={playthrough.saleDate || ""}
                  className={inputClass}
                />
              </>
            )}
          </div>

          <Button type="submit" size="sm" disabled={isPending} className="mt-1 w-full">
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                <span>Gardando...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Gardar cambios</span>
              </>
            )}
          </Button>
        </form>
      </GlassPanel>
    )
  }

  return (
    <>
      {/* Details Read View */}
      <GlassPanel className="p-5 flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            Información da partida
          </h3>
          <button
            type="button"
            onClick={openEditMode}
            className="inline-flex items-center gap-1 text-xs font-mono text-primary-hover hover:text-white transition-colors cursor-pointer"
          >
            <Pencil className="w-3 h-3" aria-hidden="true" />
            <span>Editar</span>
          </button>
        </div>

        <dl className="flex flex-col gap-2.5 text-xs">
          <div className="flex justify-between pb-2 border-b border-white/[0.06]">
            <dt className="text-zinc-500">Estado</dt>
            <dd className="text-zinc-100 font-medium inline-flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              <span>{meta.label}</span>
            </dd>
          </div>
          <div className="flex justify-between pb-2 border-b border-white/[0.06]">
            <dt className="text-zinc-500">Plataforma</dt>
            <dd className="text-zinc-200">{playthrough.platform}</dd>
          </div>
          <div className="flex justify-between pb-2 border-b border-white/[0.06]">
            <dt className="text-zinc-500">Inicio</dt>
            <dd className="font-mono text-zinc-200">{playthrough.startDate || "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">Fin</dt>
            <dd className="font-mono text-zinc-200">
              {playthrough.endDate || (playthrough.status === "PLAYING" ? "En curso" : "—")}
            </dd>
          </div>
        </dl>
      </GlassPanel>

      {/* Purchase & Sale or Subscription Plan Breakdown */}
      <GlassPanel className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3
            className={`text-xs font-mono uppercase tracking-wider ${
              playthrough.includedInPlan ? "text-purple-300" : "text-amber-300/90"
            }`}
          >
            {playthrough.includedInPlan ? "Plan de subscrición" : "Compra e venda"}
          </h3>
          {!playthrough.includedInPlan &&
            playthrough.purchasePrice == null &&
            playthrough.salePrice == null && (
              <button
                type="button"
                onClick={openEditMode}
                className="text-[11px] font-mono text-zinc-400 hover:text-white cursor-pointer"
              >
                + Engadir
              </button>
            )}
        </div>

        {playthrough.includedInPlan ? (
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-400/30 text-purple-100 font-medium">
              <Layers className="w-3.5 h-3.5 text-purple-300" aria-hidden="true" />
              <span>{playthrough.planName || "Incluído nun plan"}</span>
            </span>
            <span className="text-[11px] font-mono text-zinc-500">Sen prezo</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-zinc-400">Compra</div>
                {(playthrough.purchaseStoreName || playthrough.purchaseDate) && (
                  <div className="text-[11px] text-zinc-500">
                    {[playthrough.purchaseStoreName, playthrough.purchaseDate]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                )}
              </div>
              <span className="font-mono text-zinc-100 tabular-nums">
                {playthrough.purchasePrice != null ? `${playthrough.purchasePrice.toFixed(2)}€` : "—"}
              </span>
            </div>

            <div className="flex items-start justify-between pt-2 border-t border-white/[0.06]">
              <div>
                <div className="text-zinc-400">Venda</div>
                {(playthrough.saleStoreName || playthrough.saleDate) && (
                  <div className="text-[11px] text-zinc-500">
                    {[playthrough.saleStoreName, playthrough.saleDate].filter(Boolean).join(" · ")}
                  </div>
                )}
              </div>
              <span
                className={`font-mono tabular-nums ${
                  playthrough.salePrice != null ? "text-emerald-300" : "text-zinc-500"
                }`}
              >
                {playthrough.salePrice != null
                  ? `${playthrough.salePrice.toFixed(2)}€`
                  : "Non vendida"}
              </span>
            </div>

            {net !== null && (
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                <span className="text-zinc-300 font-medium">Custo neto</span>
                <span className="font-mono font-semibold text-white tabular-nums">
                  {net > 0 ? `+${net.toFixed(2)}€` : `${net.toFixed(2)}€`}
                </span>
              </div>
            )}
          </div>
        )}
      </GlassPanel>
    </>
  )
}

/* ============================================================================
 * 3. Delete Playthrough Button (redirects back to Game Sheet)
 * ========================================================================== */
export function DeletePlaythroughAction({
  playthroughId,
  gameId,
}: {
  playthroughId: string
  gameId: string
}) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deletePlaythrough(playthroughId, gameId)
      if (res.success) {
        router.push(`/games/${gameId}`)
        router.refresh()
      }
    })
  }

  if (confirming) {
    return (
      <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/35 flex flex-col gap-2">
        <p className="text-xs text-rose-200 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" aria-hidden="true" />
          <span>Eliminar esta partida e o seu diario?</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium cursor-pointer"
          >
            {isPending ? "Eliminando..." : "Si, eliminar"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={isPending}
            className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-200 text-xs cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="w-full text-left px-3 py-2 rounded-xl text-xs text-zinc-500 hover:text-rose-300 hover:bg-rose-500/10 transition-colors inline-flex items-center gap-2 cursor-pointer"
    >
      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
      <span>Eliminar esta partida</span>
    </button>
  )
}
