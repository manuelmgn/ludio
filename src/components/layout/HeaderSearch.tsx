"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Search,
  X,
  Loader2,
  Library,
  Compass,
  Gamepad2,
  Star,
  ArrowRight,
} from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import {
  searchUnified,
  type SearchGameItem,
  type UnifiedLibraryHit,
} from "@/lib/api/games"
import { StatusBadge } from "@/components/ui/StatusBadge"

const DEBOUNCE_MS = 260

export function HeaderSearch() {
  const router = useRouter()
  const { t } = useLanguage()

  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [libraryHits, setLibraryHits] = useState<UnifiedLibraryHit[]>([])
  const [catalogHits, setCatalogHits] = useState<SearchGameItem[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const requestIdRef = useRef(0)

  const collapse = useCallback(() => {
    setExpanded(false)
    setQuery("")
    setLibraryHits([])
    setCatalogHits([])
    setHasSearched(false)
    setIsLoading(false)
    requestIdRef.current += 1
  }, [])

  const openSearch = useCallback(() => {
    setExpanded(true)
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }, [])

  const handleQueryChange = (nextVal: string) => {
    setQuery(nextVal)
    const trimmed = nextVal.trim()
    if (trimmed.length < 2) {
      requestIdRef.current += 1
      setIsLoading(false)
      setHasSearched(false)
      setLibraryHits([])
      setCatalogHits([])
    } else {
      setIsLoading(true)
    }
  }

  // Global keyboard shortcut (Cmd/Ctrl+K) and Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        if (expanded) {
          inputRef.current?.focus()
          inputRef.current?.select()
        } else {
          openSearch()
        }
      } else if (e.key === "Escape" && expanded) {
        e.preventDefault()
        collapse()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [expanded, openSearch, collapse])

  // Close when clicking outside
  useEffect(() => {
    if (!expanded) return

    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        collapse()
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [expanded, collapse])

  // Debounced unified search (library + new IGDB games)
  useEffect(() => {
    if (!expanded) return

    const trimmed = query.trim()
    if (trimmed.length < 2) return

    const reqId = ++requestIdRef.current

    const timer = setTimeout(async () => {
      const res = await searchUnified(trimmed)
      if (reqId !== requestIdRef.current) return

      if (res.success) {
        setLibraryHits(res.library)
        setCatalogHits(res.catalog)
      } else {
        setLibraryHits([])
        setCatalogHits([])
      }
      setHasSearched(true)
      setIsLoading(false)
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [query, expanded])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed.length >= 2) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`)
      collapse()
    } else {
      router.push("/search")
      collapse()
    }
  }

  const trimmedQuery = query.trim()
  const showDropdown = expanded && trimmedQuery.length >= 2
  const totalHits = libraryHits.length + catalogHits.length

  return (
    <div ref={containerRef} className="relative flex items-center justify-end">
      <form
        onSubmit={handleSubmit}
        role="search"
        className={`flex items-center h-9 rounded-xl border transition-[width,background-color,border-color,box-shadow,padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${
          expanded
            ? "w-[13.5rem] sm:w-[16.5rem] lg:w-[18.5rem] px-2.5 gap-2 bg-[#0b0b14]/90 border-primary/55 ring-2 ring-primary/20 shadow-[0_8px_28px_-6px_rgba(168,85,247,0.35)]"
            : "w-9 justify-center bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.1] hover:border-white/20"
        }`}
      >
        <button
          type={expanded && trimmedQuery.length >= 2 ? "submit" : "button"}
          onClick={() => {
            if (!expanded) {
              openSearch()
            } else {
              inputRef.current?.focus()
            }
          }}
          aria-label={t("search")}
          aria-expanded={expanded}
          title={`${t("search")} (⌘K)`}
          className="flex items-center justify-center w-6 h-6 text-zinc-300 hover:text-white transition-colors shrink-0 cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary-hover" aria-hidden="true" />
          ) : (
            <Search className="w-4 h-4" aria-hidden="true" />
          )}
        </button>

        {expanded && (
          <>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Biblioteca ou xogos novos..."
              aria-label="Buscar na biblioteca ou xogos novos"
              className="flex-1 min-w-0 bg-transparent text-xs text-zinc-100 placeholder-zinc-500 outline-none font-sans"
            />
            <button
              type="button"
              onClick={() => {
                if (query) {
                  handleQueryChange("")
                  inputRef.current?.focus()
                } else {
                  collapse()
                }
              }}
              aria-label={query ? "Limpar busca" : "Pechar busca"}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </>
        )}
      </form>

      {/* Unified Live Results Panel (Library + New Catalog Games) */}
      {showDropdown && (
        <div
          role="region"
          aria-label="Resultados de busca rápida"
          className="absolute right-0 top-[calc(100%+0.6rem)] w-[min(calc(100vw-1.5rem),25rem)] max-h-[min(72dvh,32rem)] overflow-y-auto overscroll-contain rounded-2xl liquid-glass-pill p-2.5 flex flex-col gap-3 z-50"
        >
          {isLoading && !hasSearched && (
            <div className="py-6 flex items-center justify-center gap-2 text-xs font-mono text-zinc-400">
              <Loader2 className="w-4 h-4 animate-spin text-primary-hover" aria-hidden="true" />
              <span>Buscando na biblioteca e IGDB...</span>
            </div>
          )}

          {hasSearched && totalHits === 0 && !isLoading && (
            <div className="py-6 px-3 text-center flex flex-col items-center gap-1.5">
              <Search className="w-5 h-5 text-zinc-500" aria-hidden="true" />
              <p className="text-xs font-medium text-zinc-200">
                Sen resultados para &ldquo;{trimmedQuery}&rdquo;
              </p>
              <p className="text-[11px] text-zinc-500">
                Proba con outro termo ou preme Enter para a busca completa.
              </p>
            </div>
          )}

          {/* Section 1: User's Library */}
          {libraryHits.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="px-2 py-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-purple-200/90">
                <span className="inline-flex items-center gap-1.5">
                  <Library className="w-3 h-3 text-primary-hover" aria-hidden="true" />
                  <span>Na túa biblioteca</span>
                </span>
                <span className="text-zinc-500 tabular-nums">{libraryHits.length}</span>
              </div>
              {libraryHits.map((item) => (
                <Link
                  key={`lib-${item.id}`}
                  href={`/games/${item.id}`}
                  transitionTypes={["nav-forward"]}
                  onClick={collapse}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.08] transition-colors group"
                >
                  <div className="w-9 h-12 rounded-lg overflow-hidden bg-[#0c0c14] relative shrink-0 ring-1 ring-white/10">
                    {item.coverUrl ? (
                      <Image
                        src={item.coverUrl}
                        alt={item.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-purple-950/60">
                        <Gamepad2 className="w-4 h-4 text-primary-hover/60" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-100 group-hover:text-primary-hover transition-colors truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <StatusBadge status={item.status} />
                      {item.platform && (
                        <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[110px]">
                          {item.platform}
                        </span>
                      )}
                      {item.rating && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-amber-300">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                          <span>{item.rating}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Section 2: New Games from Global Catalog (IGDB) */}
          {catalogHits.length > 0 && (
            <div
              className={`flex flex-col gap-1 ${
                libraryHits.length > 0 ? "pt-2 border-t border-white/[0.08]" : ""
              }`}
            >
              <div className="px-2 py-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                <span className="inline-flex items-center gap-1.5">
                  <Compass className="w-3 h-3 text-cyan-400" aria-hidden="true" />
                  <span>Xogos novos</span>
                </span>
                <span className="text-zinc-500 tabular-nums">{catalogHits.length}</span>
              </div>
              {catalogHits.map((game) => (
                <Link
                  key={`cat-${game.id}`}
                  href={`/games/${game.id}`}
                  transitionTypes={["nav-forward"]}
                  onClick={collapse}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.08] transition-colors group"
                >
                  <div className="w-9 h-12 rounded-lg overflow-hidden bg-[#0c0c14] relative shrink-0 ring-1 ring-white/10">
                    {game.coverUrl ? (
                      <Image
                        src={game.coverUrl}
                        alt={game.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-purple-950/60">
                        <Gamepad2 className="w-4 h-4 text-primary-hover/60" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-100 group-hover:text-primary-hover transition-colors truncate">
                      {game.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-zinc-400">
                      {game.releaseYear && <span>{game.releaseYear}</span>}
                      {game.rating !== null && (
                        <span className="inline-flex items-center gap-0.5 text-amber-300">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                          <span>{Math.round(game.rating)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Footer link to full Search page */}
          <Link
            href={`/search?q=${encodeURIComponent(trimmedQuery)}`}
            onClick={collapse}
            className="mt-0.5 pt-2.5 pb-1 px-2 border-t border-white/[0.08] flex items-center justify-between text-xs font-sans text-primary-hover hover:text-white transition-colors"
          >
            <span className="truncate">
              Ver todos os resultados para &ldquo;{trimmedQuery}&rdquo;
            </span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0 ml-2" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  )
}
