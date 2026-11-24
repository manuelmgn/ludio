"use client"

import { useState, useTransition, useEffect, useRef, useId } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Heart,
  X,
  Star,
  ChevronDown,
  ChevronRight,
  Euro,
  Layers,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import type { PlaythroughStatus } from "@generated/prisma/enums"
import { addGameToLibrary, removeGameFromLibrary } from "@/lib/actions/library"
import {
  STANDARD_PLATFORMS,
  STATUS_META,
  sortAlphabetically,
  sortByNameAlphabetically,
} from "@/lib/game-utils"
import { Button } from "@/components/ui/Button"
import { StarRatingInput } from "@/components/ui/StarRatingInput"

export interface StoreOption {
  id: string
  name: string
}

export interface PlanOption {
  id: string
  name: string
}

interface AddToLibraryModalProps {
  open: boolean
  onClose: () => void
  gameId: string
  gameTitle: string
  releaseYear: number | null
  mode: "add" | "new-playthrough"
  customPlatforms: string[]
  stores: StoreOption[]
  plans: PlanOption[]
}

export function AddToLibraryModal({
  open,
  onClose,
  gameId,
  gameTitle,
  releaseYear,
  mode,
  customPlatforms,
  stores,
  plans,
}: AddToLibraryModalProps) {
  const router = useRouter()
  const idPrefix = useId()
  const titleId = `${idPrefix}-title`
  const platformId = `${idPrefix}-platform`
  const startDateId = `${idPrefix}-startDate`
  const endDateId = `${idPrefix}-endDate`
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<PlaythroughStatus>("PLAYING")
  const [selectedRating, setSelectedRating] = useState<number>(0)
  const [showPricing, setShowPricing] = useState(false)
  const [acquisitionMode, setAcquisitionMode] = useState<"price" | "plan">("price")
  const [error, setError] = useState<string | null>(null)

  const allPlatforms = sortAlphabetically(
    Array.from(new Set([...STANDARD_PLATFORMS, ...customPlatforms]))
  )
  const sortedStores = sortByNameAlphabetically(stores)
  const sortedPlans = sortByNameAlphabetically(plans)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      if (!dialog.open) {
        dialog.showModal()
      }
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open])

  // Fallback light-dismiss for browsers without <dialog closedby> support (e.g. Safari)
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || typeof HTMLDialogElement === "undefined") return
    if ("closedBy" in HTMLDialogElement.prototype) return

    const isOutside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect()
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom
    }

    let pressedOutside = false
    const onPointerDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e)
    }
    const onPointerUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e) && !isPending) {
        dialog.close()
      }
      pressedOutside = false
    }

    dialog.addEventListener("pointerdown", onPointerDown)
    dialog.addEventListener("pointerup", onPointerUp)
    return () => {
      dialog.removeEventListener("pointerdown", onPointerDown)
      dialog.removeEventListener("pointerup", onPointerUp)
    }
  }, [isPending])

  const statusOptions: { id: PlaythroughStatus; label: string; dot: string }[] = [
    { id: "PLAYING", label: STATUS_META.PLAYING.label, dot: STATUS_META.PLAYING.dot },
    { id: "COMPLETED", label: STATUS_META.COMPLETED.label, dot: STATUS_META.COMPLETED.dot },
    { id: "ON_HOLD", label: STATUS_META.ON_HOLD.label, dot: STATUS_META.ON_HOLD.dot },
    { id: "ABANDONED", label: STATUS_META.ABANDONED.label, dot: STATUS_META.ABANDONED.dot },
  ]

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const platform = (formData.get("platform") as string)?.trim()
    const startDate = (formData.get("startDate") as string)?.trim()
    const endDate = (formData.get("endDate") as string)?.trim()
    const publicReview = (formData.get("publicReview") as string)?.trim()

    const isPlan = showPricing && acquisitionMode === "plan"
    const planId = (formData.get("planId") as string)?.trim()

    const purchasePriceStr = (formData.get("purchasePrice") as string)?.trim()
    const purchaseStoreId = (formData.get("purchaseStoreId") as string)?.trim()
    const purchaseDate = (formData.get("purchaseDate") as string)?.trim()
    const salePriceStr = (formData.get("salePrice") as string)?.trim()
    const saleStoreId = (formData.get("saleStoreId") as string)?.trim()
    const saleDate = (formData.get("saleDate") as string)?.trim()

    if (!platform) {
      setError("Debes indicar unha plataforma para rexistrar a partida.")
      return
    }

    const purchasePrice = !isPlan && purchasePriceStr ? parseFloat(purchasePriceStr) : undefined
    const salePrice = !isPlan && salePriceStr ? parseFloat(salePriceStr) : undefined

    startTransition(async () => {
      const res = await addGameToLibrary(gameId, {
        status,
        platform,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        rating: selectedRating > 0 ? selectedRating : undefined,
        publicReview: publicReview || undefined,
        purchasePrice,
        purchaseStoreId: !isPlan ? purchaseStoreId || undefined : undefined,
        purchaseDate: !isPlan ? purchaseDate || undefined : undefined,
        salePrice,
        saleStoreId: !isPlan ? saleStoreId || undefined : undefined,
        saleDate: !isPlan ? saleDate || undefined : undefined,
        includedInPlan: isPlan,
        planId: isPlan ? planId || undefined : undefined,
      })

      if (res.success) {
        onClose()
        router.refresh()
      } else {
        setError(res.error || "Erro ao gardar a partida.")
      }
    })
  }

  const inputClass =
    "w-full min-h-[44px] sm:min-h-0 rounded-xl border border-white/10 bg-[#0b0b12]/90 px-3 py-2 text-base sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all font-sans"

  const handleDialogCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    if (isPending) {
      e.preventDefault()
    }
  }

  const handleDialogClose = () => {
    const dialog = dialogRef.current
    if (dialog) {
      dialog.returnValue = ""
    }
    setStatus("PLAYING")
    setSelectedRating(0)
    setShowPricing(false)
    setAcquisitionMode("price")
    setError(null)
    if (open) {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: isPending ? "none" : "any" } as Record<string, string>)}
      aria-labelledby={titleId}
      onCancel={handleDialogCancel}
      onClose={handleDialogClose}
      className="m-auto p-0 w-[calc(100%-2rem)] max-w-lg max-h-[min(88dvh,calc(100dvh-max(2rem,env(safe-area-inset-top,0px)+env(safe-area-inset-bottom,0px))))] overflow-y-auto overscroll-contain rounded-2xl bg-[#11111a] border border-white/15 shadow-2xl text-zinc-100 backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      {open && (
        <>
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#11111a]/95 backdrop-blur z-10">
          <div>
            <h1 id={titleId} className="text-base font-display font-bold text-white">
              {mode === "new-playthrough" ? "Rexistrar nova partida" : "Engadir á biblioteca"}
            </h1>
            <p className="text-xs text-zinc-400">
              {gameTitle}
              {releaseYear ? ` (${releaseYear})` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Pechar"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-200 text-xs">
              {error}
            </div>
          )}

          {/* Status */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Estado da partida
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {statusOptions.map((opt) => {
                const active = status === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isPending}
                    onClick={() => setStatus(opt.id)}
                    aria-pressed={active}
                    className={`px-2.5 py-2 rounded-xl text-xs border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      active
                        ? "bg-primary/20 text-white border-primary/60 font-medium"
                        : "bg-white/[0.03] text-zinc-400 border-white/10 hover:text-zinc-200 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />
                    <span>{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Platform */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor={platformId} className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Plataforma
            </label>
            <select
              id={platformId}
              name="platform"
              defaultValue={allPlatforms[0]}
              disabled={isPending}
              autoFocus
              className={inputClass}
            >
              {allPlatforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={startDateId} className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Data de inicio (opcional)
              </label>
              <input
                id={startDateId}
                type="date"
                name="startDate"
                disabled={isPending}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={endDateId} className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Data de fin (opcional)
              </label>
              <input
                id={endDateId}
                type="date"
                name="endDate"
                disabled={isPending}
                className={inputClass}
              />
            </div>
          </div>

          {/* Optional Rating & Opinion */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Valoración desta partida (opcional)
              </span>
              {selectedRating > 0 && (
                <span className="text-xs font-mono text-amber-300">{selectedRating}/5</span>
              )}
            </div>
            <StarRatingInput
              value={selectedRating}
              onChange={setSelectedRating}
              disabled={isPending}
              size="sm"
            />
            {status === "COMPLETED" && (
              <textarea
                name="publicReview"
                rows={2}
                disabled={isPending}
                placeholder="Opinión ou crítica rápida desta partida (opcional)..."
                className={inputClass}
              />
            )}
          </div>

          {/* Optional Pricing or Subscription Plan Toggle */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setShowPricing(!showPricing)}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-amber-300 transition-colors self-start cursor-pointer"
            >
              {showPricing ? (
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              {acquisitionMode === "plan" ? (
                <Layers className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
              ) : (
                <Euro className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              )}
              <span>Prezo ou plan de subscrición (opcional)</span>
            </button>

            {showPricing && (
              <div
                className={`p-3.5 rounded-xl border flex flex-col gap-3 ${
                  acquisitionMode === "plan"
                    ? "bg-purple-500/[0.05] border-purple-400/25"
                    : "bg-amber-500/[0.04] border-amber-500/20"
                }`}
              >
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-black/35 border border-white/[0.08]">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setAcquisitionMode("price")}
                    aria-pressed={acquisitionMode === "price"}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-sans transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      acquisitionMode === "price"
                        ? "bg-amber-500/20 text-amber-100 border border-amber-400/40 font-medium"
                        : "text-zinc-400 hover:text-zinc-200 border border-transparent"
                    }`}
                  >
                    <Euro className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Compra / Venda</span>
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setAcquisitionMode("plan")}
                    aria-pressed={acquisitionMode === "plan"}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-sans transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      acquisitionMode === "plan"
                        ? "bg-purple-500/25 text-purple-100 border border-purple-400/45 font-medium"
                        : "text-zinc-400 hover:text-zinc-200 border border-transparent"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Incluído nun plan</span>
                  </button>
                </div>

                {acquisitionMode === "plan" ? (
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono text-purple-200 uppercase tracking-wider block">
                      Plan de subscrición (opcional)
                    </label>
                    <select name="planId" disabled={isPending} className={inputClass}>
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
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Compra</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          name="purchasePrice"
                          placeholder="Prezo (€)"
                          disabled={isPending}
                          className={inputClass}
                        />
                        <select name="purchaseStoreId" disabled={isPending} className={inputClass}>
                          <option value="">Tenda...</option>
                          {sortedStores.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                        <input type="date" name="purchaseDate" disabled={isPending} className={inputClass} />
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2.5 border-t border-white/[0.06]">
                      <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Venda</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          name="salePrice"
                          placeholder="Prezo (€)"
                          disabled={isPending}
                          className={inputClass}
                        />
                        <select name="saleStoreId" disabled={isPending} className={inputClass}>
                          <option value="">Tenda...</option>
                          {sortedStores.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                        <input type="date" name="saleDate" disabled={isPending} className={inputClass} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  <span>Gardando...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{mode === "new-playthrough" ? "Gardar partida" : "Engadir á biblioteca"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
        </>
      )}
    </dialog>
  )
}

interface GameHeroActionsProps {
  gameId: string
  gameTitle: string
  releaseYear: number | null
  inLibrary: boolean
  isWishedOnly: boolean
  latestPlaythroughStatus?: PlaythroughStatus | null
  latestPlaythroughPlatform?: string | null
  overallRating?: number | null
  customPlatforms: string[]
  stores: StoreOption[]
  plans: PlanOption[]
}

export function GameHeroActions({
  gameId,
  gameTitle,
  releaseYear,
  inLibrary,
  isWishedOnly,
  latestPlaythroughStatus,
  latestPlaythroughPlatform,
  overallRating,
  customPlatforms,
  stores,
  plans,
}: GameHeroActionsProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [isPendingWish, startWishTransition] = useTransition()
  const [isPendingRemove, startRemoveTransition] = useTransition()

  const handleQuickWish = () => {
    startWishTransition(async () => {
      const res = await addGameToLibrary(gameId, {
        status: "WISHED",
        platform: "PC",
      })
      if (res.success) {
        router.refresh()
      }
    })
  }

  const handleRemove = () => {
    startRemoveTransition(async () => {
      const res = await removeGameFromLibrary(gameId)
      if (res.success) {
        setConfirmRemove(false)
        router.refresh()
      }
    })
  }

  if (!inLibrary) {
    return (
      <>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button type="button" variant="primary" size="md" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Engadir á biblioteca</span>
          </Button>

          <Button
            type="button"
            variant="glass"
            size="md"
            onClick={handleQuickWish}
            disabled={isPendingWish}
          >
            {isPendingWish ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Heart className="w-4 h-4" aria-hidden="true" />
            )}
            <span>{isPendingWish ? "Gardando..." : "Desexados"}</span>
          </Button>
        </div>

        <AddToLibraryModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          gameId={gameId}
          gameTitle={gameTitle}
          releaseYear={releaseYear}
          mode="add"
          customPlatforms={customPlatforms}
          stores={stores}
          plans={plans}
        />
      </>
    )
  }

  const statusMeta = latestPlaythroughStatus ? STATUS_META[latestPlaythroughStatus] : null

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {isWishedOnly ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-400/35 text-purple-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Na túa lista de Desexados</span>
            </span>
          ) : (
            <>
              {statusMeta && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/12 text-zinc-100 font-medium">
                  <span className={`w-2 h-2 rounded-full ${statusMeta.dot}`} />
                  <span>
                    {statusMeta.label}
                    {latestPlaythroughPlatform ? ` · ${latestPlaythroughPlatform}` : ""}
                  </span>
                </span>
              )}
              {overallRating && (
                <>
                  <span className="text-zinc-600">·</span>
                  <span className="inline-flex items-center gap-1 font-mono text-amber-300">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                    <span>{overallRating}/5</span>
                  </span>
                </>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button type="button" variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isWishedOnly ? "Comezar partida" : "Nova partida"}</span>
          </Button>

          {!confirmRemove ? (
            <button
              type="button"
              onClick={() => setConfirmRemove(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/30 text-zinc-400 hover:text-rose-300 text-xs transition-all cursor-pointer"
              title="Eliminar da biblioteca"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Eliminar</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
              <span className="text-rose-200">Seguro?</span>
              <button
                type="button"
                onClick={handleRemove}
                disabled={isPendingRemove}
                className="px-2 py-0.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-medium cursor-pointer"
              >
                {isPendingRemove ? "..." : "Si"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmRemove(false)}
                disabled={isPendingRemove}
                className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/15 text-zinc-200 cursor-pointer"
              >
                Non
              </button>
            </div>
          )}
        </div>
      </div>

      <AddToLibraryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        gameId={gameId}
        gameTitle={gameTitle}
        releaseYear={releaseYear}
        mode="new-playthrough"
        customPlatforms={customPlatforms}
        stores={stores}
        plans={plans}
      />
    </>
  )
}
