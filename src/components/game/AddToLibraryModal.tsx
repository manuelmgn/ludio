"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Heart,
  X,
  Star,
  ChevronDown,
  ChevronRight,
  Euro,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import type { PlaythroughStatus } from "@generated/prisma/enums"
import { addGameToLibrary, removeGameFromLibrary } from "@/lib/actions/library"
import { STANDARD_PLATFORMS, STATUS_META } from "@/lib/game-utils"
import { Button } from "@/components/ui/Button"

export interface StoreOption {
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
}: AddToLibraryModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<PlaythroughStatus>("PLAYING")
  const [selectedRating, setSelectedRating] = useState<number>(0)
  const [showPricing, setShowPricing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allPlatforms = Array.from(new Set([...STANDARD_PLATFORMS, ...customPlatforms]))

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, isPending, onClose])

  if (!open) return null

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

    const purchasePrice = purchasePriceStr ? parseFloat(purchasePriceStr) : undefined
    const salePrice = salePriceStr ? parseFloat(salePriceStr) : undefined

    startTransition(async () => {
      const res = await addGameToLibrary(gameId, {
        status,
        platform,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        rating: selectedRating > 0 ? selectedRating : undefined,
        publicReview: publicReview || undefined,
        purchasePrice,
        purchaseStoreId: purchaseStoreId || undefined,
        purchaseDate: purchaseDate || undefined,
        salePrice,
        saleStoreId: saleStoreId || undefined,
        saleDate: saleDate || undefined,
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
    "w-full rounded-xl border border-white/10 bg-[#0b0b12]/90 px-3 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all font-sans"

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => !isPending && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-library-modal-title"
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[#11111a] border border-white/15 shadow-2xl text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#11111a]/95 backdrop-blur z-10">
          <div>
            <h3 id="add-library-modal-title" className="text-base font-display font-bold text-white">
              {mode === "new-playthrough" ? "Rexistrar nova partida" : "Engadir á biblioteca"}
            </h3>
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
            <label htmlFor="modal-platform" className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Plataforma
            </label>
            <select
              id="modal-platform"
              name="platform"
              defaultValue={allPlatforms[0]}
              disabled={isPending}
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
              <label htmlFor="modal-startDate" className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Data de inicio (opcional)
              </label>
              <input
                id="modal-startDate"
                type="date"
                name="startDate"
                disabled={isPending}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="modal-endDate" className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Data de fin (opcional)
              </label>
              <input
                id="modal-endDate"
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
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRating(selectedRating === star ? 0 : star)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110"
                  aria-label={`${star} estrelas`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= selectedRating
                        ? "fill-amber-400 text-amber-400"
                        : "text-zinc-600 hover:text-zinc-400"
                    }`}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
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

          {/* Optional Pricing Toggle */}
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
              <Euro className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>Prezo de compra / venda (opcional)</span>
            </button>

            {showPricing && (
              <div className="p-3.5 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 flex flex-col gap-3">
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
                      {stores.map((s) => (
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
                      {stores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <input type="date" name="saleDate" disabled={isPending} className={inputClass} />
                  </div>
                </div>
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
      </div>
    </div>
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
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 text-white text-sm font-medium shadow-[0_10px_28px_-8px_rgba(168,85,247,0.55)] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Engadir á biblioteca</span>
          </button>

          <button
            type="button"
            onClick={handleQuickWish}
            disabled={isPendingWish}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-purple-500/15 border border-white/12 hover:border-purple-400/40 text-zinc-200 hover:text-purple-100 text-sm font-medium transition-all disabled:opacity-60 cursor-pointer"
          >
            {isPendingWish ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Heart className="w-4 h-4" aria-hidden="true" />
            )}
            <span>{isPendingWish ? "Gardando..." : "Desexados"}</span>
          </button>
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
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isWishedOnly ? "Comezar partida" : "Nova partida"}</span>
          </button>

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
      />
    </>
  )
}
