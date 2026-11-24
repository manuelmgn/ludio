import React from "react"
import { LIBRARY_STATUS_META, type LibraryStatusKey } from "@/lib/game-utils"
import { cn } from "./GlassPanel"

interface StatusBadgeProps {
  status: LibraryStatusKey
  label?: string
  className?: string
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const meta = LIBRARY_STATUS_META[status]
  if (!meta) return null

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono border",
        meta.pill,
        className
      )}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
      <span>{label || meta.label}</span>
    </span>
  )
}
