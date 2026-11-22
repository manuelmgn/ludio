"use client"

import { useState, useTransition, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useLanguage } from "@/contexts/LanguageContext"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Input } from "@/components/ui/Input"
import { searchGames } from "@/lib/api/games"
import type { Game } from "@generated/prisma/browser"
import { GameCard } from "@/components/ui/GameCard"

interface SearchState {
  results: Game[]
  error: string | null
  hasSearched: boolean
}

function SearchContent() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const initialQ = searchParams?.get("q") || ""

  const [query, setQuery] = useState(initialQ)
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<SearchState>({
    results: [],
    error: null,
    hasSearched: false,
  })

  const performSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim()
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

  useEffect(() => {
    if (initialQ && initialQ.trim().length >= 2) {
      const timer = setTimeout(() => {
        performSearch(initialQ)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [initialQ])

  const handleSearch = () => {
    performSearch(query)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-4 sm:p-8 relative">
      {/* Background decoration */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-1/3 right-1/4 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-[140px] -z-10" />

      <h1 className="text-4xl font-pixel text-white mb-2 tracking-wider mt-6 flex items-center gap-3">
        <span>🔍</span>
        <span>{t("search")}</span>
      </h1>
      <p className="text-xs text-zinc-400 font-sans mb-8">
        Base de datos sincronizada con IGDB & biblioteca local
      </p>

      {/* Search Input */}
      <GlassPanel className="w-full max-w-2xl mb-8 p-3">
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("search_placeholder")}
              aria-label={t("search_placeholder")}
              disabled={isPending}
              autoFocus
              icon={<span className="text-sm">🔍</span>}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isPending || query.trim().length < 2}
            className="rounded-xl bg-primary px-6 py-2.5 text-white text-sm font-medium hover:bg-primary-hover shadow-[0_0_15px_rgba(157,0,255,0.3)] transition-all disabled:opacity-40 disabled:pointer-events-none h-[42px]"
          >
            {isPending ? t("search_loading") : t("search")}
          </button>
        </div>
      </GlassPanel>

      {/* Error */}
      {state.error !== null && (
        <GlassPanel className="w-full max-w-2xl mb-6 border-rose-500/30 bg-rose-950/20">
          <p className="text-rose-400 text-center font-sans text-sm">{state.error}</p>
        </GlassPanel>
      )}

      {/* Loading Skeleton */}
      {isPending && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-zinc-400 font-mono text-sm animate-pulse">
          <span className="text-2xl">⏳</span>
          <span>{t("search_loading")}</span>
        </div>
      )}

      {/* Results */}
      {state.hasSearched && state.results.length === 0 && state.error === null && !isPending && (
        <div className="text-center py-12">
          <p className="text-zinc-400 font-sans text-base">{t("search_empty")}</p>
          <p className="text-zinc-600 text-xs mt-1">Proba con outro termo ou título en inglés</p>
        </div>
      )}

      {!state.hasSearched && !isPending && (
        <div className="text-center py-12 text-zinc-500 font-sans text-sm max-w-md">
          <p>{t("search_hint")}</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["The Witcher 3", "Elden Ring", "Final Fantasy", "Hollow Knight", "Metroid"].map((popular) => (
              <button
                key={popular}
                onClick={() => {
                  setQuery(popular)
                  performSearch(popular)
                }}
                className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:border-primary/50 hover:text-white transition-colors text-zinc-400"
              >
                {popular}
              </button>
            ))}
          </div>
        </div>
      )}

      {state.results.length > 0 && !isPending && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-5xl">
          {state.results.map((game) => (
            <GameCard key={game.id} id={game.id} title={game.title} coverUrl={game.coverUrl} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white text-center">Cargando busca...</div>}>
      <SearchContent />
    </Suspense>
  )
}
