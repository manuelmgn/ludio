"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Input } from "@/components/ui/Input"
import { useLanguage } from "@/contexts/LanguageContext"

type PlaythroughStatus = "PLAYING" | "COMPLETED" | "ABANDONED" | "ON_HOLD"
type FilterTab = PlaythroughStatus | "WISH" | "ALL"
type SortOption = "updated_desc" | "title_asc" | "title_desc" | "rating_desc" | "price_desc" | "price_asc"

export interface LibraryEntryWithDetails {
  id: string
  rating?: number | null
  game: {
    id: string
    title: string
    coverUrl: string | null
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

  // Extract unique platforms
  const availablePlatforms = useMemo(() => {
    const set = new Set<string>()
    entries.forEach((e) => {
      e.playthroughs.forEach((p) => {
        if (p.platform) set.add(p.platform)
      })
    })
    return Array.from(set).sort()
  }, [entries])

  // Extract unique stores
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

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "ALL", label: t("filter_all"), count: counts.total },
    { id: "PLAYING", label: t("filter_playing"), count: counts.playing },
    { id: "COMPLETED", label: t("filter_completed"), count: counts.completed },
    { id: "ON_HOLD", label: t("filter_on_hold"), count: counts.onHold },
    { id: "WISH", label: t("filter_wish"), count: counts.wish },
    { id: "ABANDONED", label: t("filter_abandoned"), count: counts.abandoned },
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
    // 1. Filtering
    const result = entries.filter((entry) => {
      // Search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim()
        if (!entry.game.title.toLowerCase().includes(query)) {
          return false
        }
      }

      // Status tab
      if (activeTab === "WISH") {
        if (entry.playthroughs.length !== 0) return false
      } else if (activeTab !== "ALL") {
        if (!entry.playthroughs.some((p) => p.status === activeTab)) return false
      }

      // Platform filter
      if (selectedPlatform !== "ALL") {
        const hasPlatform = entry.playthroughs.some((p) => p.platform === selectedPlatform)
        if (!hasPlatform) return false
      }

      // Store filter
      if (selectedStore !== "ALL") {
        const hasStore = entry.playthroughs.some(
          (p) => p.purchaseStore?.name === selectedStore || p.saleStore?.name === selectedStore
        )
        if (!hasStore) return false
      }

      // Only with price
      if (onlyWithPrice) {
        const hasPrice = entry.playthroughs.some(
          (p) => p.purchasePrice != null || p.salePrice != null
        )
        if (!hasPrice) return false
      }

      return true
    })

    // 2. Sorting
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
        case "price_desc": {
          const pA = Math.max(...a.playthroughs.map((p) => p.purchasePrice ?? -1), -1)
          const pB = Math.max(...b.playthroughs.map((p) => p.purchasePrice ?? -1), -1)
          return pB - pA
        }
        case "price_asc": {
          const pA = Math.min(...a.playthroughs.filter((p) => p.purchasePrice != null).map((p) => p.purchasePrice!), Infinity)
          const pB = Math.min(...b.playthroughs.filter((p) => p.purchasePrice != null).map((p) => p.purchasePrice!), Infinity)
          return pA - pB
        }
        case "updated_desc":
        default:
          return 0 // preserved from database order
      }
    })

    return result
  }, [entries, activeTab, searchQuery, selectedPlatform, selectedStore, onlyWithPrice, sortBy])

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header and In-Library Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-pixel text-white tracking-wider flex items-center gap-3">
            <span>📚</span>
            <span>{t("library")}</span>
            <span className="text-sm font-mono text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
              {entries.length} {entries.length === 1 ? "xogo" : "xogos"}
            </span>
          </h1>
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
            icon={<span className="text-xs">🔍</span>}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-white/10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl font-sans text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? "bg-primary text-white border border-primary/50 shadow-[0_0_15px_rgba(157,0,255,0.3)] font-medium"
                  : "bg-white/5 text-zinc-400 border border-white/5 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-xs px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? "bg-white/20 text-white" : "bg-black/30 text-zinc-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Filter and Sorting Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-black/40 border border-white/10 p-3 rounded-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Platform Filter */}
          {availablePlatforms.length > 0 && (
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-primary/50 font-sans cursor-pointer hover:border-white/20 transition-colors"
            >
              <option value="ALL">🎮 {t("filter_all_platforms") || "Todas as plataformas"}</option>
              {availablePlatforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          )}

          {/* Store Filter */}
          {availableStores.length > 0 && (
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-primary/50 font-sans cursor-pointer hover:border-white/20 transition-colors"
            >
              <option value="ALL">🏪 {t("filter_all_stores") || "Todas as tendas"}</option>
              {availableStores.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}

          {/* Only with price toggle */}
          <button
            type="button"
            onClick={() => setOnlyWithPrice(!onlyWithPrice)}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans border transition-all flex items-center gap-1.5 ${
              onlyWithPrice
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                : "bg-white/5 text-zinc-400 border-white/10 hover:text-white hover:bg-white/10"
            }`}
          >
            <span>💶</span>
            <span>{t("filter_only_with_price") || "Só con prezo"}</span>
          </button>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-zinc-400 hover:text-rose-400 transition-colors px-2 py-1 flex items-center gap-1"
            >
              <span>✕</span>
              <span>Limpar</span>
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-sans hidden sm:inline">
            {t("sort_by") || "Ordenar"}:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-primary/50 font-sans cursor-pointer hover:border-white/20 transition-colors"
          >
            <option value="updated_desc">{t("sort_updated_desc") || "🕒 Actualizados recentemente"}</option>
            <option value="title_asc">{t("sort_title") || "🔤 Título (A-Z)"}</option>
            <option value="title_desc">{t("sort_title_desc") || "🔤 Título (Z-A)"}</option>
            <option value="rating_desc">{t("sort_rating") || "⭐ Mellor valorados"}</option>
            <option value="price_desc">{t("sort_price_desc") || "💶 Prezo (Maior)"}</option>
            <option value="price_asc">{t("sort_price_asc") || "💶 Prezo (Menor)"}</option>
          </select>
        </div>
      </div>

      {/* Games Grid */}
      {filteredAndSortedEntries.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
          {filteredAndSortedEntries.map((entry) => {
            const latestPlaythrough = entry.playthroughs[0]
            const isWish = entry.playthroughs.length === 0
            const statusBadge = isWish
              ? { label: "Desexado", color: "bg-purple-950/80 text-purple-300 border-purple-500/40" }
              : latestPlaythrough?.status === "PLAYING"
              ? { label: "Xogando", color: "bg-blue-950/80 text-blue-300 border-blue-500/40" }
              : latestPlaythrough?.status === "COMPLETED"
              ? { label: "Completado", color: "bg-emerald-950/80 text-emerald-300 border-emerald-500/40" }
              : latestPlaythrough?.status === "ON_HOLD"
              ? { label: "En Pausa", color: "bg-amber-950/80 text-amber-300 border-amber-500/40" }
              : { label: "Abandonado", color: "bg-rose-950/80 text-rose-300 border-rose-500/40" }

            return (
              <GlassPanel
                key={entry.game.id}
                className="p-3 flex flex-col justify-between overflow-hidden group hover:border-primary/40 transition-all duration-300"
              >
                <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-zinc-900/60 relative mb-3">
                  {entry.game.coverUrl ? (
                    <Image
                      src={entry.game.coverUrl}
                      alt={entry.game.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#3c006b] p-3 border border-primary/30">
                      <span className="text-purple-100 text-xs text-center font-medium line-clamp-3">
                        {entry.game.title}
                      </span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div
                    className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono border backdrop-blur-md ${statusBadge.color}`}
                  >
                    {statusBadge.label}
                  </div>

                  {/* Rating Stars Overlay */}
                  {entry.rating && (
                    <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[11px] font-mono text-amber-400 border border-white/10">
                      ⭐ {entry.rating}
                    </div>
                  )}

                  {/* Hover Quick Action Buttons */}
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                    <Link
                      href={`/games/${entry.game.id}`}
                      className="w-full text-center py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition-colors"
                    >
                      Ficha do xogo
                    </Link>
                    <Link
                      href={`/games/${entry.game.id}/canvas`}
                      className="w-full text-center py-1.5 px-3 rounded-lg bg-primary/40 hover:bg-primary/60 text-white text-xs font-medium border border-primary/50 transition-colors"
                    >
                      🎨 Canvas
                    </Link>
                    <Link
                      href={`/games/${entry.game.id}/journal`}
                      className="w-full text-center py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 text-xs font-medium border border-white/10 transition-colors"
                    >
                      📖 Diario
                    </Link>
                  </div>
                </div>

                <Link
                  href={`/games/${entry.game.id}`}
                  className="font-medium text-white font-sans text-xs line-clamp-2 hover:text-primary transition-colors leading-snug"
                >
                  {entry.game.title}
                </Link>

                <div className="flex items-center justify-between mt-1 text-[10px] font-mono">
                  {latestPlaythrough?.platform ? (
                    <span className="text-zinc-500 truncate max-w-[90px]">
                      {latestPlaythrough.platform}
                    </span>
                  ) : (
                    <span />
                  )}
                  {latestPlaythrough?.purchasePrice != null && (
                    <span className="text-rose-400 font-semibold ml-auto" title={latestPlaythrough.purchaseStore?.name}>
                      {latestPlaythrough.purchasePrice.toFixed(0)}€
                    </span>
                  )}
                  {latestPlaythrough?.purchasePrice == null && latestPlaythrough?.salePrice != null && (
                    <span className="text-emerald-400 font-semibold ml-auto" title={latestPlaythrough.saleStore?.name}>
                      +{latestPlaythrough.salePrice.toFixed(0)}€
                    </span>
                  )}
                </div>
              </GlassPanel>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md text-center">
          <div className="text-4xl mb-3">👾</div>
          <p className="text-white/70 font-sans text-base mb-2">
            {hasActiveFilters ? "Non hai xogos que coincidan cos filtros." : t("library_empty")}
          </p>
          <p className="text-zinc-500 text-xs max-w-sm mb-6">
            {hasActiveFilters
              ? "Proba a cambiar ou limpar os filtros de busca, plataforma ou tenda."
              : "Busca calquera videoxogo e engádeo para comezar o teu diario e caderno de capturas."}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={handleResetFilters}
              className="rounded-xl bg-white/10 border border-white/20 px-5 py-2 text-white font-medium hover:bg-white/20 transition-all text-xs"
            >
              Limpar Filtros
            </button>
          ) : (
            <Link
              href="/search"
              className="rounded-xl bg-primary px-6 py-2.5 text-white font-medium hover:bg-primary-hover shadow-[0_0_15px_rgba(157,0,255,0.4)] transition-all text-sm"
            >
              {t("library_explore_cta")} →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
