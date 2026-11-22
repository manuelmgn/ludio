"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Input } from "@/components/ui/Input"
import { useLanguage } from "@/contexts/LanguageContext"

type PlaythroughStatus = "PLAYING" | "COMPLETED" | "ABANDONED" | "ON_HOLD"
type FilterTab = PlaythroughStatus | "WISH" | "ALL"

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
  }[]
}

interface LibraryFilterProps {
  entries: LibraryEntryWithDetails[]
}

export function LibraryFilter({ entries }: LibraryFilterProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL")
  const [searchQuery, setSearchQuery] = useState("")

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

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // 1. Filter by search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim()
        if (!entry.game.title.toLowerCase().includes(query)) {
          return false
        }
      }

      // 2. Filter by status tab
      if (activeTab === "ALL") return true
      if (activeTab === "WISH") {
        return entry.playthroughs.length === 0
      }
      return entry.playthroughs.some((p) => p.status === activeTab)
    })
  }, [entries, activeTab, searchQuery])

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

      {/* Games Grid */}
      {filteredEntries.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
          {filteredEntries.map((entry) => {
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

                {latestPlaythrough?.platform && (
                  <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                    {latestPlaythrough.platform}
                  </span>
                )}
              </GlassPanel>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md text-center">
          <div className="text-4xl mb-3">👾</div>
          <p className="text-white/70 font-sans text-base mb-2">
            {t("library_empty")}
          </p>
          <p className="text-zinc-500 text-xs max-w-sm mb-6">
            Busca calquera videoxogo e engádeo para comezar o teu diario e caderno de capturas.
          </p>
          <Link
            href="/search"
            className="rounded-xl bg-primary px-6 py-2.5 text-white font-medium hover:bg-primary-hover shadow-[0_0_15px_rgba(157,0,255,0.4)] transition-all text-sm"
          >
            {t("library_explore_cta")} →
          </Link>
        </div>
      )}
    </div>
  )
}
