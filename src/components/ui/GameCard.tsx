"use client"

import { memo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Gamepad2, Star } from "lucide-react"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { useLanguage } from "@/contexts/LanguageContext"
import { GAME_TYPE_STYLES, type GameType } from "@/lib/game-types"

export interface GameCardProps {
  id: string
  title: string
  coverUrl: string | null
  firstReleaseDate?: Date | string | null
  releaseYear?: number | null
  rating?: number | null
  gameType?: GameType | null
  deferRender?: boolean
}

export const GameCard = memo(function GameCard({
  id,
  title,
  coverUrl,
  firstReleaseDate,
  releaseYear,
  rating,
  gameType,
  deferRender = false,
}: GameCardProps) {
  const { t } = useLanguage()
  const [imgError, setImgError] = useState(false)

  const year = releaseYear ?? (firstReleaseDate ? new Date(firstReleaseDate).getFullYear() : null)
  const typeStyle = gameType ? GAME_TYPE_STYLES[gameType] : null

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

          {/* Release Year Badge */}
          {year && (
            <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium text-zinc-100 border border-white/15">
              {year}
            </div>
          )}

          {/* Rating Badge */}
          {rating !== null && rating !== undefined && (
            <div className="absolute top-2 right-2 bg-black/80 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-medium text-amber-300 border border-amber-400/25 flex items-center gap-1">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span>{Math.round(rating)}</span>
            </div>
          )}

          {/* Game Type Badge */}
          {typeStyle && gameType !== "main" && (
            <div
              className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border ${typeStyle.badgeClass}`}
            >
              {t(typeStyle.i18nKey) || gameType}
            </div>
          )}
        </div>

        <div className="w-full flex flex-col mt-auto px-0.5 pb-0.5">
          <h3 className="font-medium text-zinc-100 font-sans text-xs leading-snug line-clamp-2 group-hover:text-primary-hover transition-colors">
            {title}
          </h3>
        </div>
      </GlassPanel>
    </Link>
  )
})
