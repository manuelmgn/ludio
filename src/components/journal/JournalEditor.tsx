"use client"

import { useState, useTransition, useRef } from "react"
import { PenLine, Save, CheckCircle2, AlertCircle } from "lucide-react"
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
    <GlassPanel className="w-full mb-7">
      <h3 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
        <PenLine className="w-4 h-4 text-primary-hover" aria-hidden="true" />
        <span>{t("journal_add_title")}</span>
      </h3>

      {error && (
        <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-200 text-xs font-sans flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-sans flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          <span>{t("journal_saved_success")}</span>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          name="content"
          placeholder={t("journal_notes_placeholder")}
          disabled={isPending}
          rows={4}
          className="rounded-xl border border-white/10 bg-[#0b0b12]/80 p-4 text-zinc-100 placeholder-zinc-500 outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all font-sans resize-y text-sm leading-relaxed"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
              {t("journal_screenshot_label")}
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              disabled={isPending}
              className="text-xs text-zinc-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary/20 file:text-purple-200 hover:file:bg-primary/30 transition-colors cursor-pointer bg-[#0b0b12]/80 rounded-xl p-2 border border-dashed border-white/15"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
              {t("journal_privacy_label")}
            </label>
            <select
              name="privacyLevel"
              disabled={isPending}
              className="rounded-xl border border-white/10 bg-[#0b0b12]/85 p-2.5 text-zinc-100 outline-none focus:border-primary/60 font-sans text-xs cursor-pointer h-[42px]"
            >
              <option value="PRIVATE">{t("privacy_private")}</option>
              <option value="FOLLOWERS">{t("privacy_followers")}</option>
              <option value="PUBLIC">{t("privacy_public")}</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-1">
          <Button type="submit" disabled={isPending}>
            <Save className="w-4 h-4" aria-hidden="true" />
            <span>{isPending ? t("journal_saving_btn") : t("journal_save_btn")}</span>
          </Button>
        </div>
      </form>
    </GlassPanel>
  )
}
