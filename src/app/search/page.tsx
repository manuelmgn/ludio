"use client"

import { useState, useTransition, useEffect, useMemo, Suspense, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/LanguageContext"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Input } from "@/components/ui/Input"
import { searchGames, type SearchGameItem } from "@/lib/api/games"
import { GameCard } from "@/components/ui/GameCard"

type SortOption = "relevance" | "release_desc" | "release_asc" | "rating_desc" | "title_asc"

const ITEMS_PER_PAGE = 24

interface SearchState {
  results: SearchGameItem[]
  error: string | null
  hasSearched: boolean
}

function SearchContent() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQ = searchParams?.get("q") || ""
  const initialSort = (searchParams?.get("sort") as SortOption) || "relevance"

  const [query, setQuery] = useState(initialQ)
  const [sortBy, setSortBy] = useState<SortOption>(initialSort)
  const [currentPage, setCurrentPage] = useState(1)
  const [isPending, startTransition] = useTransition()
  const resultsRef = useRef<HTMLDivElement>(null)

  const [state, setState] = useState<SearchState>({
    results: [],
    error: null,
    hasSearched: false,
  })
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ludio_recent_searches")
      if (saved) {
        setRecentSearches(JSON.parse(saved))
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  const saveRecentSearch = (term: string) => {
    try {
      const trimmed = term.trim()
      if (!trimmed) return
      setRecentSearches((prev) => {
        const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())
        const next = [trimmed, ...filtered].slice(0, 6)
        localStorage.setItem("ludio_recent_searches", JSON.stringify(next))
        return next
      })
    } catch {
      // Ignore
    }
  }

  const clearRecentSearches = () => {
    try {
      localStorage.removeItem("ludio_recent_searches")
      setRecentSearches([])
    } catch {
      // Ignore
    }
  }

  const performSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim()
    if (trimmed.length < 2) return

    saveRecentSearch(trimmed)
    setState((prev) => ({ ...prev, error: null }))

    startTransition(async () => {
      const result = await searchGames(trimmed)

      if (result.success) {
        setState({
          results: result.data,
          error: null,
          hasSearched: true,
        })
        setCurrentPage(1)
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
    if (query.trim().length >= 2) {
      const params = new URLSearchParams()
      params.set("q", query.trim())
      if (sortBy !== "relevance") params.set("sort", sortBy)
      router.replace(`/search?${params.toString()}`)
      performSearch(query)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // Sorted games
  const sortedGames = useMemo(() => {
    const items = [...state.results]
    switch (sortBy) {
      case "release_desc":
        return items.sort((a, b) => {
          const timeA = a.firstReleaseDate ? new Date(a.firstReleaseDate).getTime() : -Infinity
          const timeB = b.firstReleaseDate ? new Date(b.firstReleaseDate).getTime() : -Infinity
          return timeB - timeA
        })
      case "release_asc":
        return items.sort((a, b) => {
          const timeA = a.firstReleaseDate ? new Date(a.firstReleaseDate).getTime() : Infinity
          const timeB = b.firstReleaseDate ? new Date(b.firstReleaseDate).getTime() : Infinity
          return timeA - timeB
        })
      case "rating_desc":
        return items.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case "title_asc":
        return items.sort((a, b) => a.title.localeCompare(b.title))
      case "relevance":
      default:
        return items.sort((a, b) => b.relevanceScore - a.relevanceScore)
    }
  }, [state.results, sortBy])

  // Pagination calculation
  const totalPages = Math.ceil(sortedGames.length / ITEMS_PER_PAGE)
  const paginatedGames = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedGames.slice(start, start + ITEMS_PER_PAGE)
  }, [sortedGames, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
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
        Base de datos global con máis de 250.000 videoxogos & biblioteca local
      </p>

      {/* Search Input Bar */}
      <GlassPanel className="w-full max-w-2xl mb-6 p-3">
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

      {/* Sorting & Filter Bar */}
      {state.hasSearched && state.results.length > 0 && !isPending && (
        <div ref={resultsRef} className="w-full max-w-5xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">
              {state.results.length} {t("results_count")}
            </span>
            {totalPages > 1 && (
              <span className="text-[11px] font-mono text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-full">
                Páxina {currentPage} {t("page_of")} {totalPages}
              </span>
            )}
          </div>

          {/* Sort Selector Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-zinc-500 font-sans mr-1">{t("sort_by")}:</span>
            
            <button
              onClick={() => {
                setSortBy("relevance")
                setCurrentPage(1)
              }}
              className={`px-3 py-1 rounded-lg text-xs font-sans transition-all ${
                sortBy === "relevance"
                  ? "bg-primary text-white border border-primary/50 shadow-[0_0_10px_rgba(157,0,255,0.3)] font-medium"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {t("sort_relevance")}
            </button>

            <button
              onClick={() => {
                setSortBy("release_desc")
                setCurrentPage(1)
              }}
              className={`px-3 py-1 rounded-lg text-xs font-sans transition-all ${
                sortBy === "release_desc"
                  ? "bg-primary text-white border border-primary/50 shadow-[0_0_10px_rgba(157,0,255,0.3)] font-medium"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {t("sort_release_desc")}
            </button>

            <button
              onClick={() => {
                setSortBy("release_asc")
                setCurrentPage(1)
              }}
              className={`px-3 py-1 rounded-lg text-xs font-sans transition-all ${
                sortBy === "release_asc"
                  ? "bg-primary text-white border border-primary/50 shadow-[0_0_10px_rgba(157,0,255,0.3)] font-medium"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {t("sort_release_asc")}
            </button>

            <button
              onClick={() => {
                setSortBy("rating_desc")
                setCurrentPage(1)
              }}
              className={`px-3 py-1 rounded-lg text-xs font-sans transition-all ${
                sortBy === "rating_desc"
                  ? "bg-primary text-white border border-primary/50 shadow-[0_0_10px_rgba(157,0,255,0.3)] font-medium"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {t("sort_rating")}
            </button>

            <button
              onClick={() => {
                setSortBy("title_asc")
                setCurrentPage(1)
              }}
              className={`px-3 py-1 rounded-lg text-xs font-sans transition-all ${
                sortBy === "title_asc"
                  ? "bg-primary text-white border border-primary/50 shadow-[0_0_10px_rgba(157,0,255,0.3)] font-medium"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {t("sort_title")}
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {state.error !== null && (
        <GlassPanel className="w-full max-w-2xl mb-6 border-rose-500/30 bg-rose-950/20">
          <p className="text-rose-400 text-center font-sans text-sm">{state.error}</p>
        </GlassPanel>
      )}

      {/* Loading Skeleton */}
      {isPending && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-400 font-mono text-sm animate-pulse">
          <span className="text-3xl animate-spin">🌀</span>
          <span>{t("search_loading")}</span>
          <span className="text-xs text-zinc-500">Analizando títulos, variantes e datas de lanzamento...</span>
        </div>
      )}

      {/* Empty Results */}
      {state.hasSearched && state.results.length === 0 && state.error === null && !isPending && (
        <div className="text-center py-16">
          <p className="text-zinc-300 font-sans text-base">{t("search_empty")}</p>
          <p className="text-zinc-500 text-xs mt-1">Proba con outro termo ou o título orixinal do xogo</p>
        </div>
      )}

      {/* Search Hints & Popular Suggestions */}
      {!state.hasSearched && !isPending && (
        <div className="text-center py-12 text-zinc-500 font-sans text-sm max-w-lg flex flex-col items-center gap-6">
          {recentSearches.length > 0 && (
            <div className="w-full flex flex-col items-center gap-2">
              <div className="flex items-center justify-between w-full px-2 text-xs font-mono text-zinc-400">
                <span>🕒 Buscas recentes</span>
                <button
                  onClick={clearRecentSearches}
                  className="text-zinc-500 hover:text-rose-400 transition-colors"
                >
                  Limpar
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-2 w-full">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term)
                      const params = new URLSearchParams()
                      params.set("q", term)
                      router.replace(`/search?${params.toString()}`)
                      performSearch(term)
                    }}
                    className="text-xs px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-purple-200 hover:bg-primary/20 transition-all font-sans"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">{t("search_hint")}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Pokémon", "The Legend of Zelda", "Final Fantasy", "Metroid", "Elden Ring", "Chrono Trigger"].map(
                (popular) => (
                  <button
                    key={popular}
                    onClick={() => {
                      setQuery(popular)
                      const params = new URLSearchParams()
                      params.set("q", popular)
                      router.replace(`/search?${params.toString()}`)
                      performSearch(popular)
                    }}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-primary/50 hover:text-white transition-colors text-zinc-400"
                  >
                    {popular}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Game Cards Grid */}
      {paginatedGames.length > 0 && !isPending && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full max-w-5xl mb-8">
            {paginatedGames.map((game) => (
              <GameCard
                key={game.id}
                id={game.id}
                title={game.title}
                coverUrl={game.coverUrl}
                releaseYear={game.releaseYear}
                rating={game.rating}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4 mb-12 flex-wrap">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-sans border border-white/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                {t("page_prev")}
              </button>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first, last, and window around current page
                    if (page === 1 || page === totalPages) return true
                    if (Math.abs(page - currentPage) <= 2) return true
                    return false
                  })
                  .reduce<(number | string)[]>((acc, page, idx, arr) => {
                    if (idx > 0 && typeof arr[idx - 1] === "number" && (page as number) - (arr[idx - 1] as number) > 1) {
                      acc.push("...")
                    }
                    acc.push(page)
                    return acc
                  }, [])
                  .map((item, idx) => {
                    if (typeof item === "string") {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 text-zinc-600 font-mono text-xs">
                          ...
                        </span>
                      )
                    }

                    const pageNum = item as number
                    const isActive = pageNum === currentPage

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-xl font-mono text-xs flex items-center justify-center transition-all ${
                          isActive
                            ? "bg-primary text-white font-bold border border-primary/50 shadow-[0_0_10px_rgba(157,0,255,0.4)]"
                            : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
              </div>

              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-sans border border-white/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                {t("page_next")}
              </button>
            </div>
          )}
        </>
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
