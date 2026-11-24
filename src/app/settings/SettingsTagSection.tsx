"use client"

import React from "react"
import { Plus, X } from "lucide-react"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

export interface TagItem {
  id: string
  name: string
}

interface SettingsTagSectionProps {
  icon: React.ReactNode
  title: string
  description: string
  inputValue: string
  onInputChange: (val: string) => void
  placeholder: string
  addButtonLabel: string
  savingLabel: string
  isPending: boolean
  onSubmit: (e: React.FormEvent) => void
  feedback: { type: "success" | "error"; text: string } | null
  defaultItems?: TagItem[]
  defaultItemsLabel?: string
  defaultChipClassName?: string
  emptyDefaultText?: string
  customItems: TagItem[]
  customItemsLabel: string
  emptyCustomText?: string
  deletingId: string | null
  deleteLabel: string
  onDelete: (id: string) => void
}

export function SettingsTagSection({
  icon,
  title,
  description,
  inputValue,
  onInputChange,
  placeholder,
  addButtonLabel,
  savingLabel,
  isPending,
  onSubmit,
  feedback,
  defaultItems,
  defaultItemsLabel,
  defaultChipClassName = "bg-white/[0.06] border-white/15",
  emptyDefaultText,
  customItems,
  customItemsLabel,
  emptyCustomText,
  deletingId,
  deleteLabel,
  onDelete,
}: SettingsTagSectionProps) {
  const hasDefaultsSection = Boolean(defaultItemsLabel)

  return (
    <GlassPanel>
      <div className="flex items-center gap-2.5 mb-1.5">
        <span className="text-primary-hover">{icon}</span>
        <h2 className="text-lg font-display font-semibold text-white">{title}</h2>
      </div>
      <p className="text-xs text-zinc-400 mb-4 font-sans leading-relaxed">{description}</p>

      <form onSubmit={onSubmit} className="flex gap-2 mb-5 items-end">
        <div className="flex-1">
          <Input
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={placeholder}
            disabled={isPending}
          />
        </div>
        <Button
          type="submit"
          disabled={isPending || inputValue.trim().length === 0}
          className="h-[42px] shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>{isPending ? savingLabel : addButtonLabel}</span>
        </Button>
      </form>

      {feedback && (
        <p
          role="status"
          className={`mb-4 text-xs font-mono ${
            feedback.type === "success" ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {feedback.text}
        </p>
      )}

      {hasDefaultsSection && defaultItems && (
        <div className="pt-4 border-t border-white/[0.08]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block mb-3">
            {defaultItemsLabel} ({defaultItems.length})
          </span>
          {defaultItems.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {defaultItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-sans text-zinc-200 ${defaultChipClassName}`}
                >
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          ) : (
            emptyDefaultText && (
              <p className="text-xs text-zinc-500 italic mb-4">{emptyDefaultText}</p>
            )
          )}
        </div>
      )}

      {(!hasDefaultsSection || customItems.length > 0) && (
        <div className={`${hasDefaultsSection ? "pt-3" : "pt-4"} border-t border-white/[0.08]`}>
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block mb-3">
            {customItemsLabel} ({customItems.length})
          </span>

          {customItems.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {customItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-sans text-zinc-200"
                >
                  <span>{item.name}</span>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                    title={deleteLabel}
                    aria-label={`${deleteLabel} ${item.name}`}
                  >
                    {deletingId === item.id ? (
                      "..."
                    ) : (
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            emptyCustomText && <p className="text-xs text-zinc-500 italic">{emptyCustomText}</p>
          )}
        </div>
      )}
    </GlassPanel>
  )
}
