"use client"

import { useState, useTransition } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { searchGames } from "@/lib/api/games"
import Image from "next/image"
import Link from "next/link"
import type { Game } from "../../../generated/prisma/client"
import { GameCard } from "@/components/ui/GameCard"

interface SearchState {
  results: Game[]
  error: string | null
  hasSearched: boolean
}

export default function SearchPage() {
  const { t } = useLanguage()
  const [query, setQuery] = useState("")
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<SearchState>({
    results: [],
    error: null,
    hasSearched: false,
  })

  const handleSearch = () => {
    const trimmed = query.trim()
    if (trimmed.length < 2) return

    setState((prev) => ({ ...prev, error: null }))

    startTransition(async () => {
      const result = await searchGames(trimmed)

      if (result.success) {
        setState({
          results: result.data,
          error: null,
          hasSearched: true,
        })
      } else {
        setState({
          results: [],
          error: result.error,
          hasSearched: true,
        })
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-8 relative">
      {/* Background decoration */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-1/3 right-1/4 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-[140px] -z-10" />

      <h1 className="text-4xl font-pixel text-white mb-8 tracking-wider mt-8">
        {t("search")}
      </h1>

      {/* Search Input */}
      <GlassPanel className="w-full max-w-2xl mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("search_placeholder")}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors font-sans"
            aria-label={t("search_placeholder")}
            disabled={isPending}
          />
          <button
            onClick={handleSearch}
            disabled={isPending || query.trim().length < 2}
            className="rounded-lg bg-primary px-6 py-3 text-white font-medium hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            {isPending ? t("search_loading") : t("search")}
          </button>
        </div>
      </GlassPanel>

      {/* Error */}
      {state.error !== null && (
        <GlassPanel className="w-full max-w-2xl mb-6 border-red-500/30">
          <p className="text-red-400 text-center font-sans">{state.error}</p>
        </GlassPanel>
      )}

      {/* Results */}
      {state.hasSearched && state.results.length === 0 && state.error === null && !isPending && (
        <p className="text-white/50 font-sans text-lg">{t("search_empty")}</p>
      )}

      {!state.hasSearched && (
        <p className="text-white/30 font-sans text-lg mt-12">{t("search_hint")}</p>
      )}

      {state.results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
          {state.results.map((game) => (
            <GameCard key={game.id} id={game.id} title={game.title} coverUrl={game.coverUrl} />
          ))}
        </div>
      )}
    </div>
  )
}
