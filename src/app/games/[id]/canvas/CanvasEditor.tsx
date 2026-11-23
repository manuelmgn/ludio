"use client"

import { useState, useTransition, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Bold,
  Italic,
  Heading3,
  List,
  CheckSquare,
  Code,
  Save,
  Upload,
  Image as ImageIcon,
  Trash2,
  X,
  Lock,
  Users,
  Globe,
  Maximize2,
} from "lucide-react"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button } from "@/components/ui/Button"
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
  const router = useRouter()
  const { t } = useLanguage()
  const [content, setContent] = useState(initialContent)
  const [lastSavedContent, setLastSavedContent] = useState(initialContent)
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isSavingTextRef = useRef(false)

  const [file, setFile] = useState<File | null>(null)
  const [privacy, setPrivacy] = useState<PrivacyLevel>(PrivacyLevel.PRIVATE)
  const [images, setImages] = useState<CanvasImage[]>(initialImages)
  const [selectedImage, setSelectedImage] = useState<CanvasImage | null>(null)

  const [isPendingText, startTransitionText] = useTransition()
  const [isPendingImage, startTransitionImage] = useTransition()
  const [isDeletingImageId, setIsDeletingImageId] = useState<string | null>(null)

  const [textMessage, setTextMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [imgMessage, setImgMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const hasUnsavedChanges = content !== lastSavedContent

  const handleSaveText = useCallback(() => {
    if (isSavingTextRef.current) return
    isSavingTextRef.current = true
    const contentToSave = content
    setTextMessage(null)
    startTransitionText(async () => {
      try {
        const result = await saveCanvasText(libraryEntryId, contentToSave)
        if (result.success) {
          setLastSavedContent(contentToSave)
          setTextMessage({ type: "success", text: t("save") + " ✓" })
          router.refresh()
          setTimeout(() => setTextMessage(null), 3000)
        } else {
          setTextMessage({ type: "error", text: result.error || "Erro ao gardar." })
        }
      } finally {
        isSavingTextRef.current = false
      }
    })
  }, [content, libraryEntryId, router, t])

  useEffect(() => {
    if (!selectedImage) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [selectedImage])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        handleSaveText()
      }
      if (e.key === "Escape") {
        setSelectedImage(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleSaveText])

  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.substring(start, end)
    const replacement = `${prefix}${selected || "texto"}${suffix}`

    const newContent = content.substring(0, start) + replacement + content.substring(end)
    setContent(newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected ? selected.length : 5)
      )
    }, 0)
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

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
        const fileInput = document.getElementById("canvas-file-input") as HTMLInputElement | null
        if (fileInput) fileInput.value = ""
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
    <div className="flex flex-col gap-6 w-full">
      {/* Top navigation bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-white/[0.08]">
        <Link
          href={`/games/${gameId}`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-sans text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>
            {t("back_to_game")}: <strong className="text-zinc-200">{gameTitle}</strong>
          </span>
        </Link>
        <Link
          href={`/games/${gameId}/journal`}
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-purple-200 border border-primary/30 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-primary-hover" aria-hidden="true" />
          <span>{t("open_journal")}</span>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* Left Panel: Canvas Notes */}
        <GlassPanel className="flex-1 flex flex-col min-h-[460px]">
          <div className="flex items-center justify-between mb-3 border-b border-white/[0.08] pb-3.5 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-base sm:text-lg font-display font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-hover" aria-hidden="true" />
                <span>{t("canvas_notes_title")}</span>
              </h2>

              <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className={`px-3 py-1 text-xs rounded-lg font-sans transition-colors cursor-pointer ${
                    activeTab === "edit"
                      ? "bg-primary text-white font-medium shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {t("canvas_edit") || "Editar"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`px-3 py-1 text-xs rounded-lg font-sans transition-colors cursor-pointer ${
                    activeTab === "preview"
                      ? "bg-primary text-white font-medium shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {t("canvas_preview") || "Vista previa"}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-mono">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${
                  hasUnsavedChanges
                    ? "text-amber-300 bg-amber-950/40 border-amber-500/30"
                    : "text-emerald-300 bg-emerald-950/40 border-emerald-500/30"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>
                  {hasUnsavedChanges ? t("canvas_unsaved") || "Non gardado" : t("canvas_saved") || "Gardado"}
                </span>
              </span>
              <span className="text-zinc-500 tabular-nums">
                {wordCount} {t("canvas_words") || "palabras"}
              </span>
            </div>
          </div>

          {/* Markdown Formatting Toolbar */}
          {activeTab === "edit" && (
            <div className="flex flex-wrap items-center gap-1 mb-3 bg-[#0b0b12]/70 border border-white/[0.07] p-1.5 rounded-xl">
              <button
                type="button"
                onClick={() => insertFormatting("**", "**")}
                className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Negrita (**)"
                aria-label="Negrita"
              >
                <Bold className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("*", "*")}
                className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Cursiva (*)"
                aria-label="Cursiva"
              >
                <Italic className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("### ")}
                className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Título (###)"
                aria-label="Título"
              >
                <Heading3 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <span className="w-px h-4 bg-white/10 mx-1" aria-hidden="true" />
              <button
                type="button"
                onClick={() => insertFormatting("- ")}
                className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Lista (- )"
                aria-label="Lista"
              >
                <List className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("- [ ] ")}
                className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Checklist (- [ ] )"
                aria-label="Checklist"
              >
                <CheckSquare className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("`", "`")}
                className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Código (`)"
                aria-label="Código"
              >
                <Code className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <span className="ml-auto text-[11px] font-mono text-zinc-500 hidden sm:inline pr-2">
                ⌘S para gardar
              </span>
            </div>
          )}

          {activeTab === "edit" ? (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("canvas_notes_placeholder")}
              className="flex-1 min-h-[320px] w-full rounded-xl border border-white/10 bg-[#0b0b12]/80 p-4 text-zinc-100 placeholder-zinc-500 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all leading-relaxed resize-y font-mono text-sm"
              disabled={isPendingText}
            />
          ) : (
            <div className="flex-1 min-h-[320px] w-full rounded-xl border border-white/[0.08] bg-[#0b0b12]/50 p-5 text-zinc-200 font-sans leading-relaxed overflow-y-auto whitespace-pre-wrap text-sm">
              {content ? (
                content
              ) : (
                <span className="text-zinc-500 italic">
                  Sen contido aínda. Escribe notas no modo editor.
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-white/[0.08]">
            <div>
              {textMessage && (
                <p
                  className={`text-xs font-mono ${
                    textMessage.type === "success" ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {textMessage.text}
                </p>
              )}
            </div>
            <Button
              type="button"
              onClick={handleSaveText}
              disabled={isPendingText || !hasUnsavedChanges}
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              <span>{isPendingText ? t("saving") : t("save")}</span>
            </Button>
          </div>
        </GlassPanel>

        {/* Right Panel: Image Upload */}
        <GlassPanel className="w-full lg:w-80 shrink-0 flex flex-col h-fit">
          <h2 className="text-base sm:text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4 text-primary-hover" aria-hidden="true" />
            <span>{t("canvas_attach_title")}</span>
          </h2>

          <form onSubmit={handleUploadImage} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="canvas-file-input"
                className="text-[11px] text-zinc-400 font-mono uppercase tracking-wider"
              >
                Captura ou Imaxe
              </label>
              <input
                id="canvas-file-input"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="text-xs text-zinc-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary/20 file:text-purple-200 hover:file:bg-primary/30 transition-colors cursor-pointer bg-[#0b0b12]/80 rounded-xl p-2.5 border border-dashed border-white/15 hover:border-primary/40"
                disabled={isPendingImage}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="canvas-privacy"
                className="text-[11px] text-zinc-400 font-mono uppercase tracking-wider"
              >
                Visibilidade
              </label>
              <select
                id="canvas-privacy"
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as PrivacyLevel)}
                className="rounded-xl border border-white/10 bg-[#0b0b12]/85 p-2.5 text-zinc-100 outline-none focus:border-primary/60 font-sans text-xs cursor-pointer"
                disabled={isPendingImage}
              >
                <option value={PrivacyLevel.PRIVATE}>{t("privacy_private")}</option>
                <option value={PrivacyLevel.FOLLOWERS}>{t("privacy_followers")}</option>
                <option value={PrivacyLevel.PUBLIC}>{t("privacy_public")}</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="glass"
              disabled={isPendingImage || !file}
              className="mt-1 w-full"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              <span>{isPendingImage ? t("uploading_btn") : t("upload_btn")}</span>
            </Button>

            {imgMessage && (
              <p
                className={`text-xs font-mono text-center ${
                  imgMessage.type === "success" ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {imgMessage.text}
              </p>
            )}
          </form>
        </GlassPanel>
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <section className="w-full mt-2">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-display font-semibold text-white tracking-tight flex items-center gap-2.5">
              <ImageIcon className="w-5 h-5 text-primary-hover" aria-hidden="true" />
              <span>{t("canvas_gallery_title")}</span>
              <span className="text-xs font-mono text-zinc-400 bg-white/[0.05] px-2.5 py-0.5 rounded-full border border-white/10 tabular-nums">
                {images.length}
              </span>
            </h2>
            <span className="text-xs text-zinc-500">Preme sobre unha imaxe para ampliala</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((img) => {
              const PrivacyIcon =
                img.privacy === "PRIVATE" ? Lock : img.privacy === "FOLLOWERS" ? Users : Globe
              return (
                <GlassPanel
                  key={img.id}
                  interactive
                  className="p-2 relative aspect-square overflow-hidden group cursor-pointer"
                >
                  <button
                    type="button"
                    className="w-full h-full relative block rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => setSelectedImage(img)}
                    aria-label="Ampliar captura"
                  >
                    <Image
                      src={img.url}
                      alt="Canvas image"
                      fill
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      unoptimized
                    />
                    <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Maximize2
                        className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow"
                        aria-hidden="true"
                      />
                    </span>
                  </button>

                  {/* Privacy Badge */}
                  <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono text-zinc-200 border border-white/15 uppercase pointer-events-none inline-flex items-center gap-1">
                    <PrivacyIcon className="w-2.5 h-2.5 text-zinc-400" aria-hidden="true" />
                    <span>
                      {img.privacy === "PRIVATE"
                        ? "Privado"
                        : img.privacy === "FOLLOWERS"
                        ? "Seguidores"
                        : "Público"}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteImage(img.id)
                    }}
                    disabled={isDeletingImageId === img.id}
                    className="absolute top-3 right-3 bg-rose-950/85 hover:bg-rose-600 text-white rounded-lg p-2 sm:p-1.5 border border-rose-500/35 opacity-0 [@media(hover:none)]:opacity-100 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer"
                    title={t("delete")}
                    aria-label={t("delete")}
                  >
                    {isDeletingImageId === img.id ? (
                      <span className="text-[10px] px-1">...</span>
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                  </button>
                </GlassPanel>
              )
            })}
          </div>
        </section>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Captura ampliada"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center px-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))]"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[88dvh] w-full h-[80dvh] flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono border border-white/15 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Pechar (Esc)</span>
              </button>
            </div>
            <div className="relative flex-1 w-full rounded-2xl overflow-hidden border border-white/15 bg-[#0a0a12] shadow-2xl">
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
