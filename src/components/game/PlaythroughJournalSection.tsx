"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Paperclip,
  Send,
  Trash2,
  X,
  AlertCircle,
  Loader2,
  BookOpen,
} from "lucide-react"
import type { PrivacyLevel } from "@generated/prisma/enums"
import {
  addPlaythroughJournalEntry,
  deletePlaythroughJournalEntry,
} from "@/lib/actions/journal"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button } from "@/components/ui/Button"

export interface SerializedJournalEntry {
  id: string
  content: string
  imageUrl: string | null
  privacyLevel: PrivacyLevel
  createdAt: string
}

interface PlaythroughJournalSectionProps {
  playthroughId: string
  gameId: string
  entries: SerializedJournalEntry[]
}

export function PlaythroughJournalSection({
  playthroughId,
  gameId,
  entries,
}: PlaythroughJournalSectionProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await addPlaythroughJournalEntry(playthroughId, gameId, formData)
      if (res.success) {
        formRef.current?.reset()
        setSelectedFileName(null)
        router.refresh()
      } else {
        setError(res.error || "Erro ao gardar a entrada.")
      }
    })
  }

  const handleDelete = (entryId: string) => {
    if (!confirm("Eliminar esta entrada do diario?")) return
    setDeletingId(entryId)
    startTransition(async () => {
      const res = await deletePlaythroughJournalEntry(entryId, playthroughId, gameId)
      setDeletingId(null)
      if (res.success) {
        router.refresh()
      }
    })
  }

  const privacyLabel = (level: PrivacyLevel) => {
    if (level === "PUBLIC") return "Público"
    if (level === "FOLLOWERS") return "Seguidores"
    return "Privado"
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Quick Composer */}
      <GlassPanel className="p-5 flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-display font-semibold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary-hover" aria-hidden="true" />
            <span>Diario desta partida</span>
          </h2>
          <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
            {entries.length} {entries.length === 1 ? "entrada" : "entradas"}
          </span>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            name="content"
            rows={3}
            disabled={isPending}
            placeholder="Que pasou hoxe nesta partida? Escribe as túas notas, xefes derrotados ou impresións..."
            className="w-full rounded-xl border border-white/10 bg-[#0b0b12]/90 p-3.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 resize-y leading-relaxed font-sans"
          />

          <input
            ref={fileInputRef}
            type="file"
            name="image"
            accept="image/*"
            disabled={isPending}
            onChange={(e) => setSelectedFileName(e.target.files?.[0]?.name || null)}
            className="hidden"
          />

          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-zinc-300 transition-colors cursor-pointer"
              >
                <Paperclip className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                <span>{selectedFileName ? selectedFileName : "Adxuntar captura"}</span>
              </button>

              {selectedFileName && (
                <>
                  <select
                    name="privacyLevel"
                    defaultValue="PRIVATE"
                    disabled={isPending}
                    className="rounded-xl border border-white/10 bg-[#0b0b12]/90 px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-primary/60"
                  >
                    <option value="PRIVATE">Privado</option>
                    <option value="FOLLOWERS">Seguidores</option>
                    <option value="PUBLIC">Público</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      if (fileInputRef.current) fileInputRef.current.value = ""
                      setSelectedFileName(null)
                    }}
                    className="p-1 text-zinc-500 hover:text-zinc-200 cursor-pointer"
                    aria-label="Quitar imaxe"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>

            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  <span>Gardando...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Gardar entrada</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </GlassPanel>

      {/* Entries Timeline */}
      {entries.length > 0 ? (
        <div className="flex flex-col gap-4">
          {entries.map((entry, idx) => {
            const sessionNumber = entries.length - idx
            const formattedDate = new Date(entry.createdAt).toLocaleDateString("gl-ES", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })

            return (
              <GlassPanel key={entry.id} className="p-5 flex flex-col gap-3 group">
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-200 font-medium">Sesión #{sessionNumber}</span>
                    <span className="text-zinc-600">·</span>
                    <span>{formattedDate}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    disabled={deletingId === entry.id}
                    className="opacity-60 group-hover:opacity-100 p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                    title="Eliminar entrada"
                    aria-label="Eliminar entrada"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>

                {entry.content && (
                  <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>
                )}

                {entry.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setLightboxUrl(entry.imageUrl)}
                    className="relative w-full sm:w-80 aspect-video rounded-xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all bg-[#0c0c14] cursor-pointer text-left"
                  >
                    <Image
                      src={entry.imageUrl}
                      alt={`Captura da sesión #${sessionNumber}`}
                      fill
                      unoptimized
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono text-zinc-200 border border-white/15">
                      {privacyLabel(entry.privacyLevel)}
                    </span>
                  </button>
                )}
              </GlassPanel>
            )
          })}
        </div>
      ) : (
        <GlassPanel className="p-8 text-center">
          <p className="text-sm text-zinc-400">
            Aínda non hai entradas no diario desta partida. Escribe a primeira nota arriba!
          </p>
        </GlassPanel>
      )}

      {/* Simple Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-4xl w-full flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setLightboxUrl(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                aria-label="Pechar"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/15 bg-[#0c0c14]">
              <Image src={lightboxUrl} alt="Captura ampliada" fill unoptimized className="object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
