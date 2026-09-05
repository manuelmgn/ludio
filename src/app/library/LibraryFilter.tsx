"use client"

import { useState } from "react"
import { GameCard } from "@/components/ui/GameCard"

type PlaythroughStatus = "PLAYING" | "COMPLETED" | "ABANDONED" | "ON_HOLD"
type FilterTab = PlaythroughStatus | "WISH" | "ALL"

export interface LibraryEntryWithDetails {
  id: string
  game: {
    id: string
    title: string
    coverUrl: string | null
  }
  playthroughs: { status: PlaythroughStatus }[]
}

interface LibraryFilterProps {
  entries: LibraryEntryWithDetails[]
}

export function LibraryFilter({ entries }: LibraryFilterProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL")

  const tabs: { id: FilterTab, label: string }[] = [
    { id: "ALL", label: "Todos" },
    { id: "PLAYING", label: "Jugando" },
    { id: "COMPLETED", label: "Completados" },
    { id: "ABANDONED", label: "Abandonados" },
    { id: "WISH", label: "Deseados" },
  ]

  const filteredEntries = entries.filter((entry) => {
    if (activeTab === "ALL") return true
    if (activeTab === "WISH") {
      return entry.playthroughs.length === 0
    }
    // If it has at least one playthrough with the active tab status
    return entry.playthroughs.some((p) => p.status === activeTab)
  })

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Tabs */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2 rounded-full font-sans whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-white border border-primary/50 shadow-[0_0_15px_rgba(157,0,255,0.3)]"
                : "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 backdrop-blur-md"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredEntries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {filteredEntries.map((entry) => (
            <GameCard
              key={entry.game.id}
              id={entry.game.id}
              title={entry.game.title}
              coverUrl={entry.game.coverUrl}
            />
          ))}
        </div>
      ) : (
        <p className="text-white/50 text-center py-12 font-sans bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
          No hay juegos en esta categoría.
        </p>
      )}
    </div>
  )
}
