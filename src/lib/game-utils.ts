import type { PlaythroughStatus } from "@generated/prisma/enums"

export function sortAlphabetically(items: string[]): string[] {
  return [...items].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
}

export function sortByNameAlphabetically<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
}

export const STANDARD_PLATFORMS = sortAlphabetically([
  "Android",
  "iOS",
  "Nintendo 3DS",
  "Nintendo Switch",
  "Nintendo Switch 2",
  "PC",
  "PlayStation 2",
  "PlayStation 3",
  "PlayStation 4",
  "PlayStation 5",
  "Retro / Emulador",
  "Steam Deck",
  "Xbox One",
  "Xbox Series X/S",
])

export type LibraryStatusKey = PlaythroughStatus | "WISH"

export interface StatusStyleMeta {
  label: string
  dot: string
  pill: string
}

export const STATUS_META: Record<PlaythroughStatus, StatusStyleMeta> = {
  PLAYING: {
    label: "Xogando",
    dot: "bg-sky-400",
    pill: "bg-sky-950/85 text-sky-200 border-sky-400/35",
  },
  COMPLETED: {
    label: "Completado",
    dot: "bg-emerald-400",
    pill: "bg-emerald-950/85 text-emerald-200 border-emerald-400/35",
  },
  ON_HOLD: {
    label: "En Pausa",
    dot: "bg-amber-400",
    pill: "bg-amber-950/85 text-amber-200 border-amber-400/35",
  },
  ABANDONED: {
    label: "Abandonado",
    dot: "bg-rose-400",
    pill: "bg-rose-950/85 text-rose-200 border-rose-400/35",
  },
}

export const LIBRARY_STATUS_META: Record<LibraryStatusKey, StatusStyleMeta> = {
  ...STATUS_META,
  WISH: {
    label: "Desexado",
    dot: "bg-purple-400",
    pill: "bg-purple-950/85 text-purple-200 border-purple-400/35",
  },
}

function extractYear(dateStr?: string | null): number | null {
  if (!dateStr) return null
  const match = dateStr.match(/\b(19|20)\d{2}\b/)
  return match ? Number(match[0]) : null
}

/**
 * Formats a compact year range for playthrough switcher pills:
 * - Same year: "2024"
 * - Different years: "24-25"
 * - Only start year: "2026"
 * - Fallback to createdAt year if no start/end date
 */
export function formatPlaythroughYearRange(
  startDate?: string | null,
  endDate?: string | null,
  createdAt?: Date | string
): string {
  const startY = extractYear(startDate)
  const endY = extractYear(endDate)

  if (startY && endY) {
    if (startY === endY) return String(startY)
    return `${String(startY).slice(-2)}-${String(endY).slice(-2)}`
  }
  if (startY) return String(startY)
  if (endY) return String(endY)
  if (createdAt) {
    const d = typeof createdAt === "string" ? new Date(createdAt) : createdAt
    if (!Number.isNaN(d.getTime())) return String(d.getFullYear())
  }
  return ""
}

export function formatPlaythroughDateLabel(
  startDate?: string | null,
  endDate?: string | null
): string {
  if (startDate && endDate) return `${startDate} → ${endDate}`
  if (startDate) return `Desde ${startDate}`
  if (endDate) return `Ata ${endDate}`
  return "Sen datas"
}

export function getShortPlatformName(platform: string): string {
  const map: Record<string, string> = {
    "PlayStation 5": "PS5",
    "PlayStation 4": "PS4",
    "PlayStation 3": "PS3",
    "PlayStation 2": "PS2",
    "PlayStation": "PS1",
    "PlayStation Vita": "PS Vita",
    "PlayStation Portable": "PSP",
    "Nintendo Switch": "Switch",
    "Nintendo Switch 2": "Switch 2",
    "Nintendo 3DS": "3DS",
    "Xbox Series X/S": "Xbox Series",
    "Xbox Series X|S": "Xbox Series",
    "PC (Microsoft Windows)": "PC",
    "Retro / Emulador": "Retro",
  }
  return map[platform] || platform
}
