"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Library,
  Search,
  Gamepad2,
  Euro,
  RotateCcw,
  Star,
  Palette,
  BookOpen,
  FileText,
  ArrowUpDown,
  ChevronDown,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Input } from "@/components/ui/Input"
import { useLanguage } from "@/contexts/LanguageContext"

type PlaythroughStatus = "PLAYING" | "COMPLETED" | "ABANDONED" | "ON_HOLD"
type FilterTab = PlaythroughStatus | "WISH" | "ALL"
type SortOption =
  | "updated_desc"
  | "title_asc"
  | "title_desc"
  | "rating_desc"
  | "igdb_desc"
  | "release_desc"
  | "release_asc"
  | "price_desc"
  | "price_asc"

export interface LibraryEntryWithDetails {
  id: string
  rating?: number | null
  game: {
    id: string
    title: string
    coverUrl: string | null
    firstReleaseDate?: Date | string | null
    igdbRating?: number | null
  }
  playthroughs: {
    status: PlaythroughStatus
    platform?: string
    purchasePrice?: number | null
    salePrice?: number | null
    purchaseStore?: { name: string } | null
    saleStore?: { name: string } | null
  }[]
}

interface LibraryFilterProps {
  entries: LibraryEntryWithDetails[]
}

export function LibraryFilter({ entries }: LibraryFilterProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState("ALL")
  const [selectedStore, setSelectedStore] = useState("ALL")
  const [sortBy, setSortBy] = useState<SortOption>("updated_desc")
  const [onlyWithPrice, setOnlyWithPrice] = useState(false)

  const availablePlatforms = useMemo(() => {
    const set = new Set<string>()
    entries.forEach((e) => {
      e.playthroughs.forEach((p) => {
        if (p.platform) set.add(p.platform)
      })
    })
    return Array.from(set).sort()
  }, [entries])

  const availableStores = useMemo(() => {
    const set = new Set<string>()
    entries.forEach((e) => {
      e.playthroughs.forEach((p) => {
        if (p.purchaseStore?.name) set.add(p.purchaseStore.name)
        if (p.saleStore?.name) set.add(p.saleStore.name)
      })
    })
    return Array.from(set).sort()
  }, [entries])

  const counts = useMemo(() => {
    const total = entries.length
    const playing = entries.filter((e) => e.playthroughs.some((p) => p.status === "PLAYING")).length
    const completed = entries.filter((e) => e.playthroughs.some((p) => p.status === "COMPLETED")).length
    const onHold = entries.filter((e) => e.playthroughs.some((p) => p.status === "ON_HOLD")).length
    const abandoned = entries.filter((e) => e.playthroughs.some((p) => p.status === "ABANDONED")).length
    const wish = entries.filter((e) => e.playthroughs.length === 0).length

    return { total, playing, completed, onHold, abandoned, wish }
  }, [entries])

  const tabs: { id: FilterTab; label: string; count: number; dot?: string }[] = [
    { id: "ALL", label: t("filter_all"), count: counts.total },
    { id: "PLAYING", label: t("filter_playing"), count: counts.playing, dot: "bg-sky-400" },
    { id: "COMPLETED", label: t("filter_completed"), count: counts.completed, dot: "bg-emerald-400" },
    { id: "ON_HOLD", label: t("filter_on_hold"), count: counts.onHold, dot: "bg-amber-400" },
    { id: "WISH", label: t("filter_wish"), count: counts.wish, dot: "bg-purple-400" },
    { id: "ABANDONED", label: t("filter_abandoned"), count: counts.abandoned, dot: "bg-rose-400" },
  ]

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedPlatform !== "ALL" ||
    selectedStore !== "ALL" ||
    onlyWithPrice ||
    sortBy !== "updated_desc"

  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedPlatform("ALL")
    setSelectedStore("ALL")
    setSortBy("updated_desc")
    setOnlyWithPrice(false)
  }

  const filteredAndSortedEntries = useMemo(() => {
    const result = entries.filter((entry) => {
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim()
        if (!entry.game.title.toLowerCase().includes(query)) {
          return false
        }
      }

      if (activeTab === "WISH") {
        if (entry.playthroughs.length !== 0) return false
      } else if (activeTab !== "ALL") {
        if (!entry.playthroughs.some((p) => p.status === activeTab)) return false
      }

      if (selectedPlatform !== "ALL") {
        const hasPlatform = entry.playthroughs.some((p) => p.platform === selectedPlatform)
        if (!hasPlatform) return false
      }

      if (selectedStore !== "ALL") {
        const hasStore = entry.playthroughs.some(
          (p) => p.purchaseStore?.name === selectedStore || p.saleStore?.name === selectedStore
        )
        if (!hasStore) return false
      }

      if (onlyWithPrice) {
        const hasPrice = entry.playthroughs.some(
          (p) => p.purchasePrice != null || p.salePrice != null
        )
        if (!hasPrice) return false
      }

      return true
    })

    result.sort((a, b) => {
      switch (sortBy) {
        case "title_asc":
          return a.game.title.localeCompare(b.game.title)
        case "title_desc":
          return b.game.title.localeCompare(a.game.title)
        case "rating_desc": {
          const rA = a.rating ?? -1
          const rB = b.rating ?? -1
          return rB - rA
        }
        case "igdb_desc": {
          const rA = a.game.igdbRating ?? -1
          const rB = b.game.igdbRating ?? -1
          return rB - rA
        }
        case "release_desc": {
          const dA = a.game.firstReleaseDate ? new Date(a.game.firstReleaseDate).getTime() : -Infinity
          const dB = b.game.firstReleaseDate ? new Date(b.game.firstReleaseDate).getTime() : -Infinity
          return dB - dA
        }
        case "release_asc": {
          const dA = a.game.firstReleaseDate ? new Date(a.game.firstReleaseDate).getTime() : Infinity
          const dB = b.game.firstReleaseDate ? new Date(b.game.firstReleaseDate).getTime() : Infinity
          return dA - dB
        }
        case "price_desc": {
          const pA = Math.max(...a.playthroughs.map((p) => p.purchasePrice ?? -1), -1)
          const pB = Math.max(...b.playthroughs.map((p) => p.purchasePrice ?? -1), -1)
          return pB - pA
        }
        case "price_asc": {
          const pA = Math.min(
            ...a.playthroughs.filter((p) => p.purchasePrice != null).map((p) => p.purchasePrice!),
            Infinity
          )
          const pB = Math.min(
            ...b.playthroughs.filter((p) => p.purchasePrice != null).map((p) => p.purchasePrice!),
            Infinity
          )
          return pA - pB
        }
        case "updated_desc":
        default:
          return 0
      }
    })

    return result
  }, [entries, activeTab, searchQuery, selectedPlatform, selectedStore, onlyWithPrice, sortBy])

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header and In-Library Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary-hover">
              <Library className="w-5 h-5" aria-hidden="true" />
            </span>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
              {t("library")}
            </h1>
            <span className="text-xs font-mono text-purple-200 bg-primary/15 border border-primary/30 px-2.5 py-0.5 rounded-full tabular-nums">
              {entries.length} {entries.length === 1 ? "xogo" : "xogos"}
            </span>
          </div>
          <p className="text-sm text-zinc-400 font-sans mt-1">
            Explora a túa colección persoal, notas e progreso.
          </p>
        </div>

        {/* Search within library */}
        <div className="w-full sm:w-72">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("library_search")}
            aria-label={t("library_search")}
            icon={<Search className="w-4 h-4" aria-hidden="true" />}
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div
        role="tablist"
        aria-label="Filtrar por estado"
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-white/[0.08]"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-sans text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${
                isActive
                  ? "bg-gradient-to-b from-purple-500 to-purple-700 text-white border-purple-400/40 shadow-[0_4px_18px_-2px_rgba(168,85,247,0.5)] font-medium"
                  : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:bg-white/[0.08] hover:text-zinc-100"
              }`}
            >
              {tab.dot && <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white" : tab.dot}`} />}
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-md font-mono tabular-nums ${
                  isActive ? "bg-black/25 text-purple-100" : "bg-black/30 text-zinc-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Filter and Sorting Toolbar */}
      <GlassPanel variant="subtle" className="p-3 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {availablePlatforms.length > 0 && (
              <div className="relative">
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  aria-label="Filtrar por plataforma"
                  className="appearance-none rounded-xl border border-white/10 bg-[#0b0b12]/85 pl-3 pr-8 py-2 text-xs text-zinc-200 outline-none focus:border-primary/60 font-sans cursor-pointer hover:border-white/20 transition-colors"
                >
                  <option value="ALL">{t("filter_all_platforms") || "Todas as plataformas"}</option>
                  {availablePlatforms.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400"
                />
              </div>
            )}

            {availableStores.length > 0 && (
              <div className="relative">
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  aria-label="Filtrar por tenda"
                  className="appearance-none rounded-xl border border-white/10 bg-[#0b0b12]/85 pl-3 pr-8 py-2 text-xs text-zinc-200 outline-none focus:border-primary/60 font-sans cursor-pointer hover:border-white/20 transition-colors"
                >
                  <option value="ALL">{t("filter_all_stores") || "Todas as tendas"}</option>
                  {availableStores.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400"
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => setOnlyWithPrice(!onlyWithPrice)}
              aria-pressed={onlyWithPrice}
              className={`px-3 py-2 rounded-xl text-xs font-sans border transition-all flex items-center gap-1.5 cursor-pointer ${
                onlyWithPrice
                  ? "bg-amber-500/15 text-amber-200 border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.18)]"
                  : "bg-white/[0.03] text-zinc-400 border-white/10 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              <Euro className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t("filter_only_with_price") || "Só con prezo"}</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-zinc-400 hover:text-rose-300 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Limpar</span>
              </button>
            )}
          </div>

          {/* Sort Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-sans hidden sm:inline-flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t("sort_by") || "Ordenar"}:</span>
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Ordenar xogos"
                className="appearance-none rounded-xl border border-white/10 bg-[#0b0b12]/85 pl-3 pr-8 py-2 text-xs text-zinc-200 outline-none focus:border-primary/60 font-sans cursor-pointer hover:border-white/20 transition-colors"
              >
                <option value="updated_desc">{t("sort_updated_desc") || "Actualizados recentemente"}</option>
                <option value="title_asc">{t("sort_title") || "Título (A-Z)"}</option>
                <option value="title_desc">{t("sort_title_desc") || "Título (Z-A)"}</option>
                <option value="rating_desc">{t("sort_rating") || "A miña valoración"}</option>
                <option value="igdb_desc">Valoración IGDB</option>
                <option value="release_desc">Máis recentes (Ano)</option>
                <option value="release_asc">Máis antigos (Ano)</option>
                <option value="price_desc">{t("sort_price_desc") || "Prezo (Maior)"}</option>
                <option value="price_asc">{t("sort_price_asc") || "Prezo (Menor)"}</option>
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400"
              />
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Games Grid */}
      {filteredAndSortedEntries.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
          {filteredAndSortedEntries.map((entry) => {
            const latestPlaythrough = entry.playthroughs[0]
            const isWish = entry.playthroughs.length === 0
            const statusBadge = isWish
              ? { label: "Desexado", dot: "bg-purple-400", color: "bg-purple-950/85 text-purple-200 border-purple-400/35" }
              : latestPlaythrough?.status === "PLAYING"
              ? { label: "Xogando", dot: "bg-sky-400", color: "bg-sky-950/85 text-sky-200 border-sky-400/35" }
              : latestPlaythrough?.status === "COMPLETED"
              ? { label: "Completado", dot: "bg-emerald-400", color: "bg-emerald-950/85 text-emerald-200 border-emerald-400/35" }
              : latestPlaythrough?.status === "ON_HOLD"
              ? { label: "En Pausa", dot: "bg-amber-400", color: "bg-amber-950/85 text-amber-200 border-amber-400/35" }
              : { label: "Abandonado", dot: "bg-rose-400", color: "bg-rose-950/85 text-rose-200 border-rose-400/35" }

            return (
              <GlassPanel
                key={entry.game.id}
                interactive
                className="p-2.5 flex flex-col justify-between overflow-hidden group"
              >
                <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#0c0c14] relative mb-2.5 ring-1 ring-white/[0.06]">
                  {entry.game.coverUrl ? (
                    <>
                      <Image
                        src={entry.game.coverUrl}
                        alt={entry.game.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none"
                      />
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-950/90 via-[#1b1030] to-[#0c0c16] p-3 border border-primary/20">
                      <Gamepad2 className="w-6 h-6 text-primary-hover/60" aria-hidden="true" />
                      <span className="text-purple-100/90 text-xs text-center font-medium line-clamp-3">
                        {entry.game.title}
                      </span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div
                    className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-mono border backdrop-blur-md flex items-center gap-1.5 ${statusBadge.color}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                    <span>{statusBadge.label}</span>
                  </div>

                  {/* Release Year Badge */}
                  {entry.game.firstReleaseDate && (
                    <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[10px] font-mono text-zinc-200 border border-white/10">
                      {new Date(entry.game.firstReleaseDate).getFullYear()}
                    </div>
                  )}

                  {/* IGDB Rating Badge */}
                  {entry.game.igdbRating !== null && entry.game.igdbRating !== undefined && (
                    <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[10px] font-mono text-zinc-200 border border-white/10">
                      IGDB {entry.game.igdbRating}
                    </div>
                  )}

                  {/* Personal Rating Badge */}
                  {entry.rating && (
                    <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[11px] font-mono text-amber-300 border border-amber-400/25 flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                      <span>{entry.rating}</span>
                    </div>
                  )}

                  {/* Direct Tap Navigation on Touch Devices */}
                  <Link
                    href={`/games/${entry.game.id}`}
                    aria-label={entry.game.title}
                    className="[@media(hover:hover)]:hidden absolute inset-0 z-10"
                  />

                  {/* Hover Quick Action Overlay (Desktop / Pointer devices with hover) */}
                  <div className="hidden [@media(hover:hover)]:flex absolute inset-0 bg-[#08080f]/75 backdrop-blur-md opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] flex-col items-center justify-center gap-2 p-3">
                    <Link
                      href={`/games/${entry.game.id}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/14 hover:bg-white/22 text-white text-xs font-medium border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-[background-color,transform] duration-150 active:scale-[0.97]"
                    >
                      <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Ficha do xogo</span>
                    </Link>
                    <Link
                      href={`/games/${entry.game.id}/canvas`}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary/55 hover:bg-primary/75 text-white text-xs font-medium border border-purple-300/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] transition-[background-color,transform] duration-150 active:scale-[0.97]"
                    >
                      <Palette className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Canvas</span>
                    </Link>
                    <Link
                      href={`/games/${entry.game.id}/journal`}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] text-zinc-100 text-xs font-medium border border-white/15 transition-[background-color,transform] duration-150 active:scale-[0.97]"
                    >
                      <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Diario</span>
                    </Link>
                  </div>
                </div>

                <Link
                  href={`/games/${entry.game.id}`}
                  className="font-medium text-zinc-100 font-sans text-xs line-clamp-2 hover:text-primary-hover transition-colors leading-snug px-0.5"
                >
                  {entry.game.title}
                </Link>

                <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-white/[0.05] text-[10px] font-mono px-0.5">
                  {latestPlaythrough?.platform ? (
                    <span className="text-zinc-400 truncate max-w-[110px]">
                      {latestPlaythrough.platform}
                    </span>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                  {latestPlaythrough?.purchasePrice != null && (
                    <span
                      className="text-rose-300 font-semibold ml-auto tabular-nums"
                      title={latestPlaythrough.purchaseStore?.name}
                    >
                      {latestPlaythrough.purchasePrice.toFixed(0)}€
                    </span>
                  )}
                  {latestPlaythrough?.purchasePrice == null && latestPlaythrough?.salePrice != null && (
                    <span
                      className="text-emerald-300 font-semibold ml-auto tabular-nums"
                      title={latestPlaythrough.saleStore?.name}
                    >
                      +{latestPlaythrough.salePrice.toFixed(0)}€
                    </span>
                  )}
                </div>
              </GlassPanel>
            )
          })}
        </div>
      ) : (
        <GlassPanel className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <span className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary-hover mb-4">
            <Sparkles className="w-6 h-6" aria-hidden="true" />
          </span>
          <p className="text-zinc-200 font-display font-medium text-base mb-2">
            {hasActiveFilters ? "Non hai xogos que coincidan cos filtros." : t("library_empty")}
          </p>
          <p className="text-zinc-500 text-xs max-w-sm mb-6 leading-relaxed">
            {hasActiveFilters
              ? "Proba a cambiar ou limpar os filtros de busca, plataforma ou tenda."
              : "Busca calquera videoxogo e engádeo para comezar o teu diario e caderno de capturas."}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 border border-white/15 px-5 py-2.5 text-white font-medium hover:bg-white/15 transition-all text-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Limpar Filtros</span>
            </button>
          ) : (
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-b from-purple-500 to-purple-700 px-6 py-2.5 text-white font-medium hover:from-purple-400 hover:to-purple-600 shadow-[0_6px_20px_-4px_rgba(168,85,247,0.5)] transition-all text-sm"
            >
              <span>{t("library_explore_cta")}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          )}
        </GlassPanel>
      )}
    </div>
  )
}
