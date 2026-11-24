"use client"

import { memo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { BookOpen, FileText, Gamepad2, Palette, Star } from "lucide-react"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { useLanguage } from "@/contexts/LanguageContext"
import { GAME_TYPE_STYLES, type GameType } from "@/lib/game-types"
import type { LibraryStatusKey } from "@/lib/game-utils"

export interface GameCardProps {
  id: string
  title: string
  coverUrl: string | null
  firstReleaseDate?: Date | string | null
  releaseYear?: number | null
  rating?: number | null
  personalRating?: number | null
  status?: LibraryStatusKey | null
  gameType?: GameType | null
  showHoverActions?: boolean
  footer?: React.ReactNode
  deferRender?: boolean
}

export const GameCard = memo(function GameCard({
  id,
  title,
  coverUrl,
  firstReleaseDate,
  releaseYear,
  rating,
  personalRating,
  status,
  gameType,
  showHoverActions = false,
  footer,
  deferRender = false,
}: GameCardProps) {
  const { t } = useLanguage()
  const [imgError, setImgError] = useState(false)

  const year =
    releaseYear ?? (firstReleaseDate ? new Date(firstReleaseDate).getFullYear() : null)
  const typeStyle = gameType ? GAME_TYPE_STYLES[gameType] : null
  const hasFooterOrHover = Boolean(footer) || showHoverActions

  const coverContent = (
    <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#0c0c14] relative ring-1 ring-white/[0.08]">
      {coverUrl && !imgError ? (
        <>
          <Image
            src={coverUrl}
            alt={title}
            fill
            unoptimized
            loading={deferRender ? "lazy" : undefined}
            className="object-cover transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            onError={() => setImgError(true)}
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"
          />
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2.5 bg-gradient-to-br from-purple-950/90 via-[#1b1030] to-[#0c0c16] p-4 border border-primary/20">
          <Gamepad2 className="w-7 h-7 text-primary-hover/60" aria-hidden="true" />
          <span className="text-purple-100/90 text-center font-medium line-clamp-3 text-xs leading-snug">
            {title}
          </span>
        </div>
      )}

      {/* Top-Left: Status badge (library cards) OR Release Year (catalog cards) */}
      {status ? (
        <div className="absolute top-2 left-2">
          <StatusBadge status={status} />
        </div>
      ) : year ? (
        <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium text-zinc-100 border border-white/15">
          {year}
        </div>
      ) : null}

      {/* Top-Right: Release Year (when status is shown) OR IGDB Rating (catalog cards) */}
      {status ? (
        year && (
          <div className="absolute top-2 right-2 bg-black/80 px-1.5 py-0.5 rounded-md text-[10px] font-mono text-zinc-200 border border-white/10">
            {year}
          </div>
        )
      ) : rating !== null && rating !== undefined ? (
        <div className="absolute top-2 right-2 bg-black/80 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-medium text-amber-300 border border-amber-400/25 flex items-center gap-1">
          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" aria-hidden="true" />
          <span>{Math.round(rating)}</span>
        </div>
      ) : null}

      {/* Bottom-Left: Game Type badge OR IGDB rating (on library cards) */}
      {typeStyle && gameType !== "main" ? (
        <div
          className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border ${typeStyle.badgeClass}`}
        >
          {t(typeStyle.i18nKey) || gameType}
        </div>
      ) : status && rating !== null && rating !== undefined ? (
        <div className="absolute bottom-2 left-2 bg-black/80 px-1.5 py-0.5 rounded-md text-[10px] font-mono text-zinc-200 border border-white/10">
          IGDB {Math.round(rating)}
        </div>
      ) : null}

      {/* Bottom-Right: Personal Rating (on library cards) */}
      {personalRating ? (
        <div className="absolute bottom-2 right-2 bg-black/85 px-1.5 py-0.5 rounded-md text-[11px] font-mono text-amber-300 border border-amber-400/25 flex items-center gap-1">
          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" aria-hidden="true" />
          <span>{personalRating}</span>
        </div>
      ) : null}

      {/* Optional Hover Quick Actions (Desktop) + Direct Tap (Touch) */}
      {showHoverActions && (
        <>
          <Link
            href={`/games/${id}`}
            transitionTypes={["nav-forward"]}
            aria-label={title}
            className="[@media(hover:hover)]:hidden absolute inset-0 z-10"
          />
          <div className="hidden [@media(hover:hover)]:flex absolute inset-0 bg-[#08080f]/75 backdrop-blur-md opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] flex-col items-center justify-center gap-2 p-3">
            <Link
              href={`/games/${id}`}
              transitionTypes={["nav-forward"]}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/14 hover:bg-white/22 text-white text-xs font-medium border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-[background-color,transform] duration-150 active:scale-[0.97]"
            >
              <FileText className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Ficha do xogo</span>
            </Link>
            <Link
              href={`/games/${id}/canvas`}
              transitionTypes={["nav-forward"]}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary/55 hover:bg-primary/75 text-white text-xs font-medium border border-purple-300/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] transition-[background-color,transform] duration-150 active:scale-[0.97]"
            >
              <Palette className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Canvas</span>
            </Link>
            <Link
              href={`/games/${id}/journal`}
              transitionTypes={["nav-forward"]}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] text-zinc-100 text-xs font-medium border border-white/15 transition-[background-color,transform] duration-150 active:scale-[0.97]"
            >
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Diario</span>
            </Link>
          </div>
        </>
      )}
    </div>
  )

  if (!hasFooterOrHover) {
    return (
      <Link
        href={`/games/${id}`}
        transitionTypes={["nav-forward"]}
        className={`block w-full group ${deferRender ? "card-defer-render" : ""}`}
      >
        <GlassPanel
          variant="card"
          interactive
          className="flex flex-col gap-2.5 p-2.5 overflow-hidden h-full"
        >
          {coverContent}
          <div className="w-full flex flex-col mt-auto px-0.5 pb-0.5">
            <h3 className="font-medium text-zinc-100 font-sans text-xs leading-snug line-clamp-2 group-hover:text-primary-hover transition-colors">
              {title}
            </h3>
          </div>
        </GlassPanel>
      </Link>
    )
  }

  return (
    <GlassPanel
      variant="card"
      interactive
      className={`p-2.5 flex flex-col justify-between gap-2.5 overflow-hidden group h-full ${
        deferRender ? "card-defer-render" : ""
      }`}
    >
      <div className="flex flex-col gap-2.5">
        {showHoverActions ? (
          coverContent
        ) : (
          <Link href={`/games/${id}`} transitionTypes={["nav-forward"]} className="block">
            {coverContent}
          </Link>
        )}

        <Link
          href={`/games/${id}`}
          transitionTypes={["nav-forward"]}
          className="font-medium text-zinc-100 font-sans text-xs line-clamp-2 hover:text-primary-hover transition-colors leading-snug px-0.5"
        >
          {title}
        </Link>
      </div>

      {footer && (
        <div className="mt-auto pt-2 border-t border-white/[0.06] px-0.5">{footer}</div>
      )}
    </GlassPanel>
  )
})
