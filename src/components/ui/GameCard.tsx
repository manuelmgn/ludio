"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { GlassPanel } from "@/components/ui/GlassPanel"

export interface GameCardProps {
  id: string
  title: string
  coverUrl: string | null
  firstReleaseDate?: Date | string | null
  releaseYear?: number | null
  rating?: number | null
}

export function GameCard({
  id,
  title,
  coverUrl,
  firstReleaseDate,
  releaseYear,
  rating,
}: GameCardProps) {
  const [imgError, setImgError] = useState(false)

  const year = releaseYear ?? (firstReleaseDate ? new Date(firstReleaseDate).getFullYear() : null)

  return (
    <Link href={`/games/${id}`} className="block w-full group">
      <GlassPanel className="flex flex-col items-center gap-2 hover:border-primary/40 transition-all p-3 overflow-hidden h-full">
        <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-zinc-900/50 relative">
          {coverUrl && !imgError ? (
            <Image
              src={coverUrl}
              alt={title}
              fill
              unoptimized
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#4a0080] p-4 border border-primary/30">
              <span className="text-purple-100 text-center font-medium line-clamp-3 text-xs">
                {title}
              </span>
            </div>
          )}

          {/* Release Year Badge */}
          {year && (
            <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300 border border-white/10">
              {year}
            </div>
          )}

          {/* Rating Badge */}
          {rating && (
            <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-400 border border-white/10">
              ⭐ {Math.round(rating)}
            </div>
          )}
        </div>

        <div className="w-full flex flex-col mt-auto pt-1">
          <h3 className="font-medium text-white font-sans text-xs text-center leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>
      </GlassPanel>
    </Link>
  )
}
