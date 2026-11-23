"use client"

import { useState, useEffect, useMemo, Suspense, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Search,
  Clock,
  Flame,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  Compass,
  Loader2,
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { searchGames, type SearchGameItem } from "@/lib/api/games"
import { GAME_TYPE_ORDER, GAME_TYPE_STYLES, type GameType } from "@/lib/game-types"
import { GameCard } from "@/components/ui/GameCard"

type SortOption = "relevance" | "release_desc" | "release_asc" | "rating_desc" | "title_asc"
type TypeFilterOption = "all" | GameType

function isValidTypeFilter(value: string | null): value is TypeFilterOption {
  return value === "all" || (value !== null && GAME_TYPE_ORDER.includes(value as GameType))
}

const ITEMS_PER_PAGE = 24
const CLIENT_CACHE_TTL_MS = 5 * 60 * 1000
const SESSION_CACHE_KEY = "ludio_search_cache_v1"
const DEBOUNCE_MS = 350

interface CachedSearchEntry {
  data: SearchGameItem[]
  expiresAt: number
}

const clientSearchCache = new Map<string, CachedSearchEntry>()

function normalizeClientKey(term: string): string {
  return term
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
}

function getClientCachedResults(term: string): SearchGameItem[] | null {
  const key = normalizeClientKey(term)
  const mem = clientSearchCache.get(key)
  if (mem) {
    if (mem.expiresAt > Date.now()) return mem.data
    clientSearchCache.delete(key)
  }
  try {
    const raw = sessionStorage.getItem(SESSION_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, CachedSearchEntry>
    const entry = parsed[key]
    if (entry && entry.expiresAt > Date.now()) {
      clientSearchCache.set(key, entry)
      return entry.data
    }
  } catch {
    // Ignore storage errors
  }
  return null
}

function setClientCachedResults(term: string, data: SearchGameItem[]) {
  const key = normalizeClientKey(term)
  const entry: CachedSearchEntry = { data, expiresAt: Date.now() + CLIENT_CACHE_TTL_MS }
  clientSearchCache.set(key, entry)
  if (clientSearchCache.size > 30) {
    const oldest = clientSearchCache.keys().next().value
    if (oldest !== undefined) clientSearchCache.delete(oldest)
  }
  try {
    const raw = sessionStorage.getItem(SESSION_CACHE_KEY)
    const parsed: Record<string, CachedSearchEntry> = raw ? JSON.parse(raw) : {}
    parsed[key] = entry
    const keys = Object.keys(parsed)
    if (keys.length > 10) {
      delete parsed[keys[0]]
    }
    sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(parsed))
  } catch {
    // Ignore storage quota errors
  }
}

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
  const rawInitialType = searchParams?.get("type") ?? null
  const initialType: TypeFilterOption = isValidTypeFilter(rawInitialType) ? rawInitialType : "all"

  const [query, setQuery] = useState(initialQ)
  const [sortBy, setSortBy] = useState<SortOption>(initialSort)
  const [typeFilter, setTypeFilter] = useState<TypeFilterOption>(initialType)
  const [currentPage, setCurrentPage] = useState(1)
  const [isSearching, setIsSearching] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)
  const requestIdRef = useRef(0)
  const lastExecutedKeyRef = useRef("")
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [state, setState] = useState<SearchState>({
    results: [],
    error: null,
    hasSearched: false,
  })
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem("ludio_recent_searches")
        if (saved) {
          setRecentSearches(JSON.parse(saved))
        }
      } catch {
        // Ignore localStorage errors
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const saveRecentSearch = useCallback((term: string) => {
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
  }, [])

  const clearRecentSearches = () => {
    try {
      localStorage.removeItem("ludio_recent_searches")
      setRecentSearches([])
    } catch {
      // Ignore
    }
  }

  const performSearch = useCallback(
    async (searchTerm: string, options?: { saveRecent?: boolean; force?: boolean }) => {
      const trimmed = searchTerm.trim()
      if (trimmed.length < 2) return

      const normalizedKey = normalizeClientKey(trimmed)
      if (!options?.force && normalizedKey === lastExecutedKeyRef.current) {
        return
      }

      if (options?.saveRecent) {
        saveRecentSearch(trimmed)
      }

      // Instant client cache hit (e.g. navigating back from a game detail page)
      const cached = getClientCachedResults(trimmed)
      if (cached) {
        lastExecutedKeyRef.current = normalizedKey
        requestIdRef.current += 1
        setIsSearching(false)
        setState({
          results: cached,
          error: null,
          hasSearched: true,
        })
        setCurrentPage(1)
        return
      }

      const currentRequestId = ++requestIdRef.current
      lastExecutedKeyRef.current = normalizedKey
      setIsSearching(true)
      setState((prev) => ({ ...prev, error: null }))

      try {
        const result = await searchGames(trimmed)
        if (currentRequestId !== requestIdRef.current) return

        if (result.success) {
          setClientCachedResults(trimmed, result.data)
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
      } catch {
        if (currentRequestId !== requestIdRef.current) return
        setState({
          results: [],
          error: "Erro ao buscar xogos. Téntao de novo.",
          hasSearched: true,
        })
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsSearching(false)
        }
      }
    },
    [saveRecentSearch]
  )

  // Sync with URL query param (e.g., navigation from Navbar / Home / Back button)
  useEffect(() => {
    if (initialQ && initialQ.trim().length >= 2) {
      const timer = setTimeout(() => {
        setQuery(initialQ)
        void performSearch(initialQ, { saveRecent: true })
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [initialQ, performSearch])

  // Live debounced search as user types
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    const trimmed = query.trim()
    if (trimmed.length < 2) {
      return
    }

    const normalizedKey = normalizeClientKey(trimmed)
    if (normalizedKey === lastExecutedKeyRef.current) return

    debounceTimerRef.current = setTimeout(() => {
      setTypeFilter("all")
      const params = new URLSearchParams()
      params.set("q", trimmed)
      if (sortBy !== "relevance") params.set("sort", sortBy)
      router.replace(`/search?${params.toString()}`, { scroll: false })
      void performSearch(trimmed, { saveRecent: false })
    }, DEBOUNCE_MS)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query, sortBy, router, performSearch])

  const handleQueryChange = (nextValue: string) => {
    setQuery(nextValue)
    if (nextValue.trim().length === 0 && state.hasSearched) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      lastExecutedKeyRef.current = ""
      requestIdRef.current += 1
      setIsSearching(false)
      setState({ results: [], error: null, hasSearched: false })
      setTypeFilter("all")
    }
  }

  const triggerExplicitSearch = (term: string) => {
    const trimmed = term.trim()
    if (trimmed.length < 2) return
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    setQuery(trimmed)
    setTypeFilter("all")
    const params = new URLSearchParams()
    params.set("q", trimmed)
    if (sortBy !== "relevance") params.set("sort", sortBy)
    router.replace(`/search?${params.toString()}`, { scroll: false })
    void performSearch(trimmed, { saveRecent: true, force: true })
  }

  const handleSearch = () => {
    triggerExplicitSearch(query)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSearch()
    }
  }

  const typeCounts = useMemo(() => {
    const counts = new Map<GameType, number>()
    for (const item of state.results) {
      if (item.gameType) {
        counts.set(item.gameType, (counts.get(item.gameType) || 0) + 1)
      }
    }
    return GAME_TYPE_ORDER.filter((type) => (counts.get(type) || 0) > 0).map((type) => ({
      type,
      count: counts.get(type) || 0,
    }))
  }, [state.results])

  const releaseTimestamps = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of state.results) {
      if (item.firstReleaseDate) {
        map.set(item.id, Date.parse(item.firstReleaseDate))
      }
    }
    return map
  }, [state.results])

  const sortedGames = useMemo(() => {
    const items =
      typeFilter === "all"
        ? [...state.results]
        : state.results.filter((g) => g.gameType === typeFilter)
    switch (sortBy) {
      case "release_desc":
        return items.sort(
          (a, b) =>
            (releaseTimestamps.get(b.id) ?? -Infinity) -
            (releaseTimestamps.get(a.id) ?? -Infinity)
        )
      case "release_asc":
        return items.sort(
          (a, b) =>
            (releaseTimestamps.get(a.id) ?? Infinity) -
            (releaseTimestamps.get(b.id) ?? Infinity)
        )
      case "rating_desc":
        return items.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case "title_asc":
        return items.sort((a, b) => a.title.localeCompare(b.title))
      case "relevance":
      default:
        return items.sort((a, b) => b.relevanceScore - a.relevanceScore)
    }
  }, [state.results, sortBy, typeFilter, releaseTimestamps])

  const totalPages = Math.ceil(sortedGames.length / ITEMS_PER_PAGE)
  const paginatedGames = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedGames.slice(start, start + ITEMS_PER_PAGE)
  }, [sortedGames, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const sortButtons: { id: SortOption; label: string }[] = [
    { id: "relevance", label: t("sort_relevance") },
    { id: "release_desc", label: t("sort_release_desc") },
    { id: "release_asc", label: t("sort_release_asc") },
    { id: "rating_desc", label: t("sort_rating") },
    { id: "title_asc", label: t("sort_title") },
  ]

  return (
    <div className="flex flex-1 flex-col items-center px-4 sm:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-purple-200 text-[11px] font-mono uppercase tracking-widest mb-4">
          <Compass className="w-3.5 h-3.5 text-primary-hover" aria-hidden="true" />
          <span>IGDB + Biblioteca Local</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight mb-2">
          {t("search")}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-sans">
          Base de datos global con máis de 250.000 videoxogos & biblioteca local
        </p>
      </div>

      {/* Search Input Bar (Liquid Glass) */}
      <div className="w-full max-w-2xl mb-8 p-2 rounded-2xl liquid-glass-pill focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/25 transition-[border-color,box-shadow] duration-200">
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <Input
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("search_placeholder")}
              aria-label={t("search_placeholder")}
              autoFocus
              icon={
                isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary-hover" aria-hidden="true" />
                ) : (
                  <Search className="w-4 h-4" aria-hidden="true" />
                )
              }
              className="pr-9 bg-transparent border-transparent shadow-none focus:ring-0 focus:border-transparent focus:bg-transparent"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  lastExecutedKeyRef.current = ""
                  requestIdRef.current += 1
                  setIsSearching(false)
                  setState({ results: [], error: null, hasSearched: false })
                  setTypeFilter("all")
                  router.replace("/search", { scroll: false })
                }}
                aria-label="Limpar busca"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
          <Button
            type="button"
            onClick={handleSearch}
            disabled={query.trim().length < 2}
            className="h-[42px] px-6 shrink-0"
          >
            {isSearching ? t("search_loading") : t("search")}
          </Button>
        </div>
      </div>

      {/* Sorting & Filter Bar */}
      {state.hasSearched && state.results.length > 0 && (
        <div
          ref={resultsRef}
          className="w-full max-w-6xl flex flex-col gap-3 mb-6 pb-4 border-b border-white/[0.08]"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono text-zinc-300 tabular-nums">
                {typeFilter === "all"
                  ? `${state.results.length} ${t("results_count")}`
                  : `${sortedGames.length} ${t("page_of")} ${state.results.length} ${t("results_count")}`}
              </span>
              {totalPages > 1 && (
                <span className="text-[11px] font-mono text-purple-200 bg-primary/15 border border-primary/30 px-2.5 py-0.5 rounded-full tabular-nums">
                  Páxina {currentPage} {t("page_of")} {totalPages}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-zinc-500 font-sans mr-1">{t("sort_by")}:</span>
              {sortButtons.map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => {
                    setSortBy(btn.id)
                    setCurrentPage(1)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all cursor-pointer border ${
                    sortBy === btn.id
                      ? "bg-primary text-white border-purple-400/40 shadow-[0_2px_12px_rgba(168,85,247,0.4)] font-medium"
                      : "bg-white/[0.04] text-zinc-400 border-white/[0.06] hover:text-white hover:bg-white/[0.09]"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Game Type Filter Pills */}
          {typeCounts.length > 1 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-xs text-zinc-500 font-sans mr-1">
                {t("filter_type_label")}:
              </span>
              <button
                type="button"
                onClick={() => {
                  setTypeFilter("all")
                  setCurrentPage(1)
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-sans transition-all cursor-pointer border ${
                  typeFilter === "all"
                    ? "bg-white/15 text-white border-white/25 font-medium"
                    : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <span>{t("filter_type_all")}</span>
                <span className="text-[10px] font-mono opacity-75 tabular-nums">
                  {state.results.length}
                </span>
              </button>

              {typeCounts.map(({ type, count }) => {
                const style = GAME_TYPE_STYLES[type]
                const isActive = typeFilter === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setTypeFilter(isActive ? "all" : type)
                      setCurrentPage(1)
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-sans transition-all cursor-pointer border ${
                      isActive
                        ? `${style.activePillClass} font-medium`
                        : "bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    <span>{t(style.i18nKey)}</span>
                    <span className="text-[10px] font-mono opacity-75 tabular-nums">{count}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {state.error !== null && (
        <GlassPanel className="w-full max-w-2xl mb-6 border-rose-500/30 bg-rose-950/20 flex items-center gap-3 p-4">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
          <p className="text-rose-200 font-sans text-sm">{state.error}</p>
        </GlassPanel>
      )}

      {/* Loading Shimmer Grid (only when no existing results are shown) */}
      {isSearching && state.results.length === 0 && (
        <div className="w-full max-w-6xl flex flex-col gap-5">
          <p className="text-center text-xs font-mono text-zinc-400">
            {t("search_loading")} — Analizando títulos, variantes e datas de lanzamento...
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <GlassPanel key={i} variant="card" className="p-2.5 flex flex-col gap-2.5">
                <div className="w-full aspect-[3/4] rounded-xl skeleton-shimmer" />
                <div className="h-3.5 w-4/5 rounded skeleton-shimmer" />
              </GlassPanel>
            ))}
          </div>
        </div>
      )}

      {/* Empty Results */}
      {state.hasSearched && state.results.length === 0 && state.error === null && !isSearching && (
        <GlassPanel className="max-w-md w-full text-center py-12 px-6 flex flex-col items-center gap-2">
          <Search className="w-8 h-8 text-zinc-500 mb-2" aria-hidden="true" />
          <p className="text-zinc-200 font-display font-medium text-base">{t("search_empty")}</p>
          <p className="text-zinc-500 text-xs">
            Proba con outro termo ou o título orixinal do xogo
          </p>
        </GlassPanel>
      )}

      {/* Search Hints & Popular Suggestions */}
      {!state.hasSearched && !isSearching && (
        <div className="w-full max-w-xl py-8 flex flex-col items-center gap-8 text-center">
          {recentSearches.length > 0 && (
            <div className="w-full flex flex-col items-center gap-3">
              <div className="flex items-center justify-between w-full px-1 text-xs font-mono text-zinc-400">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary-hover" aria-hidden="true" />
                  <span>Buscas recentes</span>
                </span>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Limpar
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-2 w-full">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => triggerExplicitSearch(term)}
                    className="text-xs px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-purple-200 hover:bg-primary/20 hover:border-primary/50 transition-all font-sans cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="w-full flex flex-col items-center gap-3">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-zinc-500">
              <Flame className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>{t("search_hint")}</span>
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Pokémon",
                "The Legend of Zelda",
                "Final Fantasy",
                "Metroid",
                "Elden Ring",
                "Chrono Trigger",
              ].map((popular) => (
                <button
                  key={popular}
                  type="button"
                  onClick={() => triggerExplicitSearch(popular)}
                  className="text-xs px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-primary/50 hover:bg-white/[0.08] hover:text-white transition-all text-zinc-300 cursor-pointer"
                >
                  {popular}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty Filtered Results */}
      {state.hasSearched &&
        state.results.length > 0 &&
        sortedGames.length === 0 &&
        state.error === null &&
        !isSearching && (
          <GlassPanel className="max-w-md w-full text-center py-10 px-6 flex flex-col items-center gap-3">
            <p className="text-zinc-200 font-display font-medium text-sm">
              {t("filter_type_empty")}
            </p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setTypeFilter("all")
                setCurrentPage(1)
              }}
              className="text-xs px-4 py-2"
            >
              {t("filter_type_reset")}
            </Button>
          </GlassPanel>
        )}

      {/* Game Cards Grid */}
      {paginatedGames.length > 0 && (
        <>
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full max-w-6xl mb-10 transition-opacity duration-200 ${
              isSearching ? "opacity-55 pointer-events-none" : "opacity-100"
            }`}
          >
            {paginatedGames.map((game, idx) => (
              <GameCard
                key={game.id}
                id={game.id}
                title={game.title}
                coverUrl={game.coverUrl}
                releaseYear={game.releaseYear}
                rating={game.rating}
                gameType={game.gameType}
                deferRender={idx >= 12}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <nav
              aria-label="Paxinación de resultados"
              className="flex items-center justify-center gap-2 mt-2 mb-12 flex-wrap"
            >
              <button
                type="button"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 text-xs font-sans border border-white/10 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t("page_prev")}</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (page === 1 || page === totalPages) return true
                    if (Math.abs(page - currentPage) <= 2) return true
                    return false
                  })
                  .reduce<(number | string)[]>((acc, page, idx, arr) => {
                    if (
                      idx > 0 &&
                      typeof arr[idx - 1] === "number" &&
                      (page as number) - (arr[idx - 1] as number) > 1
                    ) {
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
                        type="button"
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-xl font-mono text-xs flex items-center justify-center transition-all cursor-pointer tabular-nums ${
                          isActive
                            ? "bg-primary text-white font-semibold border border-purple-400/50 shadow-[0_2px_14px_rgba(168,85,247,0.45)]"
                            : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.09] border border-white/[0.06]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
              </div>

              <button
                type="button"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 text-xs font-sans border border-white/10 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <span>{t("page_next")}</span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-zinc-400 text-center font-mono text-xs">
          Cargando busca...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
