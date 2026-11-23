export type GameType =
  | "main"
  | "remake"
  | "remaster"
  | "expansion"
  | "dlc"
  | "bundle"
  | "port"
  | "mod"

export const GAME_TYPE_ORDER: GameType[] = [
  "main",
  "remake",
  "remaster",
  "expansion",
  "dlc",
  "bundle",
  "port",
  "mod",
]

/**
 * Maps IGDB v4 `game_type` numeric IDs to clean UI categories.
 * Reference (IGDB /v4/game_types):
 *  0: Main Game, 1: DLC, 2: Expansion, 3: Bundle, 4: Standalone Expansion,
 *  5: Mod, 6: Episode, 7: Season, 8: Remake, 9: Remaster, 10: Expanded Game,
 * 11: Port, 12: Fork, 13: Pack / Addon, 14: Update
 */
export function mapIGDBGameType(igdbGameType?: number | null): GameType | null {
  switch (igdbGameType) {
    case 0:
      return "main"
    case 8:
      return "remake"
    case 9:
      return "remaster"
    case 2:
    case 4:
    case 10:
      return "expansion"
    case 1:
    case 6:
    case 7:
    case 13:
    case 14:
      return "dlc"
    case 3:
      return "bundle"
    case 11:
      return "port"
    case 5:
    case 12:
      return "mod"
    default:
      return null
  }
}

export interface GameTypeStyle {
  i18nKey: string
  badgeClass: string
  activePillClass: string
}

export const GAME_TYPE_STYLES: Record<GameType, GameTypeStyle> = {
  main: {
    i18nKey: "game_type_main",
    badgeClass: "bg-emerald-950/85 text-emerald-300 border-emerald-400/30",
    activePillClass:
      "bg-emerald-500/20 text-emerald-200 border-emerald-400/50 shadow-[0_2px_10px_rgba(16,185,129,0.25)]",
  },
  remake: {
    i18nKey: "game_type_remake",
    badgeClass: "bg-sky-950/85 text-sky-300 border-sky-400/30",
    activePillClass:
      "bg-sky-500/20 text-sky-200 border-sky-400/50 shadow-[0_2px_10px_rgba(14,165,233,0.25)]",
  },
  remaster: {
    i18nKey: "game_type_remaster",
    badgeClass: "bg-cyan-950/85 text-cyan-300 border-cyan-400/30",
    activePillClass:
      "bg-cyan-500/20 text-cyan-200 border-cyan-400/50 shadow-[0_2px_10px_rgba(6,182,212,0.25)]",
  },
  expansion: {
    i18nKey: "game_type_expansion",
    badgeClass: "bg-violet-950/85 text-violet-300 border-violet-400/30",
    activePillClass:
      "bg-violet-500/20 text-violet-200 border-violet-400/50 shadow-[0_2px_10px_rgba(139,92,246,0.25)]",
  },
  dlc: {
    i18nKey: "game_type_dlc",
    badgeClass: "bg-amber-950/85 text-amber-300 border-amber-400/30",
    activePillClass:
      "bg-amber-500/20 text-amber-200 border-amber-400/50 shadow-[0_2px_10px_rgba(245,158,11,0.25)]",
  },
  bundle: {
    i18nKey: "game_type_bundle",
    badgeClass: "bg-indigo-950/85 text-indigo-300 border-indigo-400/30",
    activePillClass:
      "bg-indigo-500/20 text-indigo-200 border-indigo-400/50 shadow-[0_2px_10px_rgba(99,102,241,0.25)]",
  },
  port: {
    i18nKey: "game_type_port",
    badgeClass: "bg-teal-950/85 text-teal-300 border-teal-400/30",
    activePillClass:
      "bg-teal-500/20 text-teal-200 border-teal-400/50 shadow-[0_2px_10px_rgba(20,184,166,0.25)]",
  },
  mod: {
    i18nKey: "game_type_mod",
    badgeClass: "bg-rose-950/85 text-rose-300 border-rose-400/30",
    activePillClass:
      "bg-rose-500/20 text-rose-200 border-rose-400/50 shadow-[0_2px_10px_rgba(244,63,94,0.25)]",
  },
}
