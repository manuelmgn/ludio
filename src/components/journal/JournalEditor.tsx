"use client"

import { useState, useTransition, useRef } from "react"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button } from "@/components/ui/Button"
import { addJournalEntry } from "@/lib/actions/journal"
import { useLanguage } from "@/contexts/LanguageContext"

interface JournalEditorProps {
  libraryEntryId: string
}

export function JournalEditor({ libraryEntryId }: JournalEditorProps) {
  const { t } = useLanguage()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await addJournalEntry(libraryEntryId, formData)
      
      if (result.success) {
        formRef.current?.reset()
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.error || "Erro ao gardar")
      }
    })
  }

  return (
    <GlassPanel className="w-full mb-8">
      <h3 className="text-xl font-pixel text-white mb-4 flex items-center gap-2">
        <span>📖</span>
        <span>{t("journal_add_title")}</span>
      </h3>
      
      {error && (
        <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-200 text-xs font-sans">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-sans">
          {t("journal_saved_success")}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <textarea
            name="content"
            placeholder={t("journal_notes_placeholder")}
            disabled={isPending}
            rows={4}
            className="rounded-xl border border-white/10 bg-black/40 p-4 text-white placeholder-zinc-500 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all font-sans resize-y text-sm leading-relaxed"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-zinc-400 font-sans text-xs uppercase tracking-wider">
              {t("journal_screenshot_label")}
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              disabled={isPending}
              className="text-xs text-zinc-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary/20 file:text-purple-300 hover:file:bg-primary/30 transition-colors cursor-pointer bg-black/40 rounded-lg p-2 border border-white/10"
            />
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <label className="text-zinc-400 font-sans text-xs uppercase tracking-wider">
              {t("journal_privacy_label")}
            </label>
            <select
              name="privacyLevel"
              disabled={isPending}
              className="rounded-lg border border-white/10 bg-black/50 p-2.5 text-white outline-none focus:border-primary/50 font-sans text-xs cursor-pointer"
            >
              <option value="PRIVATE">🔒 {t("privacy_private")}</option>
              <option value="FOLLOWERS">👥 {t("privacy_followers")}</option>
              <option value="PUBLIC">🌐 {t("privacy_public")}</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? t("journal_saving_btn") : t("journal_save_btn")}
          </Button>
        </div>
      </form>
    </GlassPanel>
  )
}
