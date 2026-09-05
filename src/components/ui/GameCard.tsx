"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { GlassPanel } from "@/components/ui/GlassPanel"

interface GameCardProps {
  id: string
  title: string
  coverUrl: string | null
}

export function GameCard({ id, title, coverUrl }: GameCardProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <Link href={`/games/${id}`} className="block w-full group">
      <GlassPanel className="flex flex-col items-center gap-3 hover:border-primary/30 transition-colors p-4 overflow-hidden h-full">
        <div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-zinc-900/50 mb-2 relative">
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
              <span className="text-purple-100 text-center font-medium line-clamp-3">
                {title}
              </span>
            </div>
          )}
        </div>
        <h3 className="font-medium text-white font-sans text-sm text-center leading-tight line-clamp-2 mt-auto">
          {title}
        </h3>
      </GlassPanel>
    </Link>
  )
}
