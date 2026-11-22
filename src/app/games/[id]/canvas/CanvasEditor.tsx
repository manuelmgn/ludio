"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { saveCanvasText, saveCanvasImageRecord, deleteCanvasImage } from "@/lib/actions/canvas"
import { uploadCanvasImage } from "@/lib/actions/storage"
import { PrivacyLevel } from "@generated/prisma/enums"
import { useLanguage } from "@/contexts/LanguageContext"

interface CanvasImage {
  id: string
  url: string
  privacy: PrivacyLevel
}

interface CanvasEditorProps {
  libraryEntryId: string
  gameId: string
  gameTitle: string
  initialContent: string
  images: CanvasImage[]
}

export function CanvasEditor({
  libraryEntryId,
  gameId,
  gameTitle,
  initialContent,
  images: initialImages,
}: CanvasEditorProps) {
  const { t } = useLanguage()
  const [content, setContent] = useState(initialContent)
  const [file, setFile] = useState<File | null>(null)
  const [privacy, setPrivacy] = useState<PrivacyLevel>(PrivacyLevel.PRIVATE)
  const [images, setImages] = useState<CanvasImage[]>(initialImages)
  const [selectedImage, setSelectedImage] = useState<CanvasImage | null>(null)

  const [isPendingText, startTransitionText] = useTransition()
  const [isPendingImage, startTransitionImage] = useTransition()
  const [isDeletingImageId, setIsDeletingImageId] = useState<string | null>(null)

  const [textMessage, setTextMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [imgMessage, setImgMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSaveText = () => {
    setTextMessage(null)
    startTransitionText(async () => {
      const result = await saveCanvasText(libraryEntryId, content)
      if (result.success) {
        setTextMessage({ type: "success", text: t("save") + " ✓" })
        setTimeout(() => setTextMessage(null), 3000)
      } else {
        setTextMessage({ type: "error", text: result.error || "Erro ao gardar." })
      }
    })
  }

  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setImgMessage(null)
    startTransitionImage(async () => {
      const formData = new FormData()
      formData.append("file", file)

      const uploadResult = await uploadCanvasImage(formData)
      if (!uploadResult.success || !uploadResult.url) {
        setImgMessage({ type: "error", text: uploadResult.error || "Erro ao subir o arquivo." })
        return
      }

      const dbResult = await saveCanvasImageRecord(libraryEntryId, uploadResult.url, privacy)
      if (dbResult.success && dbResult.data) {
        setImgMessage({ type: "success", text: "Imaxe subida con éxito ✓" })
        setFile(null)
        // Reset file input
        const fileInput = document.getElementById("canvas-file-input") as HTMLInputElement | null
        if (fileInput) fileInput.value = ""
        // Append to state
        setImages((prev) => [dbResult.data as CanvasImage, ...prev])
        setTimeout(() => setImgMessage(null), 3000)
      } else {
        setImgMessage({ type: "error", text: dbResult.error || "Erro ao rexistrar a imaxe." })
      }
    })
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Tes a certeza de que queres eliminar esta captura?")) return

    setIsDeletingImageId(imageId)
    const result = await deleteCanvasImage(imageId, libraryEntryId)
    setIsDeletingImageId(null)

    if (result.success) {
      setImages((prev) => prev.filter((img) => img.id !== imageId))
      if (selectedImage?.id === imageId) {
        setSelectedImage(null)
      }
    } else {
      alert(result.error || "Non se puido eliminar a imaxe")
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl">
      {/* Top navigation bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Link
          href={`/games/${gameId}`}
          className="text-sm font-sans text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
        >
          <span>←</span>
          <span>{t("back_to_game")}: <strong className="text-zinc-200">{gameTitle}</strong></span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/games/${gameId}/journal`}
            className="text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-primary border border-primary/30 transition-colors"
          >
            📖 {t("open_journal")}
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* Panel Izquierdo: Notas */}
        <GlassPanel className="flex-1 flex flex-col min-h-[420px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium text-white font-sans flex items-center gap-2">
              <span>📝</span>
              <span>{t("canvas_notes_title")}</span>
            </h2>
            <span className="text-xs text-zinc-500 font-mono">Markdown & Texto</span>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("canvas_notes_placeholder")}
            className="flex-1 min-h-[280px] w-full rounded-xl border border-white/10 bg-black/40 p-4 text-white placeholder-zinc-500 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all font-sans leading-relaxed resize-y"
            disabled={isPendingText}
          />

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
            <div>
              {textMessage && (
                <p className={`text-sm ${textMessage.type === "success" ? "text-emerald-400" : "text-rose-400"}`}>
                  {textMessage.text}
                </p>
              )}
            </div>
            <button
              onClick={handleSaveText}
              disabled={isPendingText}
              className="rounded-xl bg-primary px-6 py-2.5 text-white font-medium hover:bg-primary-hover shadow-[0_0_15px_rgba(157,0,255,0.3)] transition-all disabled:opacity-40 disabled:pointer-events-none text-sm"
            >
              {isPendingText ? t("saving") : t("save")}
            </button>
          </div>
        </GlassPanel>

        {/* Panel Derecho: Subida de Imágenes */}
        <GlassPanel className="w-full lg:w-80 flex flex-col h-fit">
          <h2 className="text-xl font-medium text-white mb-4 font-sans flex items-center gap-2">
            <span>📷</span>
            <span>{t("canvas_attach_title")}</span>
          </h2>

          <form onSubmit={handleUploadImage} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-zinc-400 font-sans uppercase tracking-wider">
                Captura ou Imaxe
              </label>
              <input
                id="canvas-file-input"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="text-xs text-zinc-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary/20 file:text-purple-300 hover:file:bg-primary/30 transition-colors cursor-pointer bg-black/40 rounded-lg p-2 border border-white/10"
                disabled={isPendingImage}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-zinc-400 font-sans uppercase tracking-wider">
                Visibilidade
              </label>
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as PrivacyLevel)}
                className="rounded-lg border border-white/10 bg-black/50 p-2.5 text-white outline-none focus:border-primary/50 font-sans text-xs"
                disabled={isPendingImage}
              >
                <option value={PrivacyLevel.PRIVATE}>🔒 {t("privacy_private")}</option>
                <option value={PrivacyLevel.FOLLOWERS}>👥 {t("privacy_followers")}</option>
                <option value={PrivacyLevel.PUBLIC}>🌐 {t("privacy_public")}</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isPendingImage || !file}
              className="mt-2 w-full rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-white font-medium hover:bg-white/20 transition-all disabled:opacity-40 disabled:pointer-events-none text-sm"
            >
              {isPendingImage ? t("uploading_btn") : t("upload_btn")}
            </button>

            {imgMessage && (
              <p className={`text-xs text-center ${imgMessage.type === "success" ? "text-emerald-400" : "text-rose-400"}`}>
                {imgMessage.text}
              </p>
            )}
          </form>
        </GlassPanel>
      </div>

      {/* Galería de Imágenes */}
      {images.length > 0 && (
        <div className="w-full mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-pixel text-white tracking-wider flex items-center gap-2">
              <span>🖼️</span>
              <span>{t("canvas_gallery_title")}</span>
              <span className="text-xs font-mono text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                {images.length}
              </span>
            </h2>
            <span className="text-xs text-zinc-500">Preme sobre unha imaxe para ampliala</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <GlassPanel
                key={img.id}
                className="p-2 relative aspect-square overflow-hidden group cursor-pointer border-white/10 hover:border-primary/40 transition-all"
              >
                <div
                  className="w-full h-full relative"
                  onClick={() => setSelectedImage(img)}
                >
                  <Image
                    src={img.url}
                    alt="Canvas image"
                    fill
                    className="object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                </div>

                {/* Privacy Badge */}
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300 border border-white/20 uppercase pointer-events-none">
                  {img.privacy === "PRIVATE" ? "Privado" : img.privacy === "FOLLOWERS" ? "Seguidores" : "Público"}
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteImage(img.id)
                  }}
                  disabled={isDeletingImageId === img.id}
                  className="absolute top-3 right-3 bg-red-950/80 hover:bg-red-700 text-white rounded-lg p-1.5 border border-red-500/30 opacity-0 group-hover:opacity-100 transition-opacity"
                  title={t("delete")}
                >
                  {isDeletingImageId === img.id ? (
                    <span className="text-[10px] px-1">...</span>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </GlassPanel>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full h-[80vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm font-mono flex items-center gap-1"
            >
              ✕ Pechar
            </button>
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/20">
              <Image
                src={selectedImage.url}
                alt="Captura ampliada"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
