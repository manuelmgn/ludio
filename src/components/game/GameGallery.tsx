"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react"
import { GlassPanel } from "@/components/ui/GlassPanel"

export interface GalleryImageItem {
  id: string
  url: string
  alt: string
  isMine: boolean
  sourceLabel: string
}

interface GameGalleryProps {
  officialImages: GalleryImageItem[]
  userImages: GalleryImageItem[]
}

export function GameGallery({ officialImages, userImages }: GameGalleryProps) {
  const [filter, setFilter] = useState<"all" | "mine" | "official">("all")
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  const hasUserImages = userImages.length > 0
  const allImages = [...userImages, ...officialImages]

  const visibleImages =
    filter === "mine" && hasUserImages
      ? userImages
      : filter === "official"
      ? officialImages
      : allImages

  useEffect(() => {
    if (lightboxIdx === null) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null)
      if (e.key === "ArrowRight") {
        setLightboxIdx((prev) =>
          prev === null ? null : (prev + 1) % visibleImages.length
        )
      }
      if (e.key === "ArrowLeft") {
        setLightboxIdx((prev) =>
          prev === null ? null : (prev - 1 + visibleImages.length) % visibleImages.length
        )
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", handleKey)
    }
  }, [lightboxIdx, visibleImages.length])

  if (allImages.length === 0) return null

  const activeItem = lightboxIdx !== null ? visibleImages[lightboxIdx] : null

  return (
    <>
      <GlassPanel className="p-5 flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-display font-semibold text-white tracking-tight flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary-hover" aria-hidden="true" />
            <span>Capturas e Imaxes</span>
          </h2>

          {hasUserImages ? (
            <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.08] text-[11px]">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  filter === "all"
                    ? "bg-white/12 text-white font-medium"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Todas ({allImages.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("mine")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  filter === "mine"
                    ? "bg-primary/25 text-purple-100 font-medium"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                As miñas ({userImages.length})
              </button>
              {officialImages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilter("official")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    filter === "official"
                      ? "bg-white/12 text-white font-medium"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Oficiais ({officialImages.length})
                </button>
              )}
            </div>
          ) : (
            <span className="text-[11px] font-mono text-zinc-500">Preme para ampliar</span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {visibleImages.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setLightboxIdx(idx)}
              className={`group relative aspect-video rounded-xl overflow-hidden bg-[#0c0c14] border transition-all cursor-pointer text-left ${
                img.isMine
                  ? "border-primary/35 hover:border-primary/80"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                unoptimized
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {img.isMine && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-primary/35 text-[10px] font-mono text-purple-200">
                  {img.sourceLabel}
                </span>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
            </button>
          ))}
        </div>
      </GlassPanel>

      {/* Lightbox Modal */}
      {activeItem && lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center px-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))]"
          onClick={() => setLightboxIdx(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="max-w-4xl w-full flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-xs text-zinc-300 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2 py-0.5 rounded-md bg-white/10 font-mono text-[11px] text-zinc-200 shrink-0">
                  {activeItem.sourceLabel}
                </span>
                <span className="truncate">{activeItem.alt}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-zinc-500">
                  {lightboxIdx + 1} / {visibleImages.length}
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxIdx(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  aria-label="Pechar"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/15 bg-[#0c0c14] shadow-2xl">
              <Image
                src={activeItem.url}
                alt={activeItem.alt}
                fill
                unoptimized
                className="object-contain"
              />

              {visibleImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIdx(
                        (lightboxIdx - 1 + visibleImages.length) % visibleImages.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 border border-white/15 flex items-center justify-center text-white cursor-pointer"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIdx((lightboxIdx + 1) % visibleImages.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 border border-white/15 flex items-center justify-center text-white cursor-pointer"
                    aria-label="Seguinte"
                  >
                    <ChevronRight className="w-5 h-5" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
