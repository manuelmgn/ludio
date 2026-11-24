"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Plus, Star, Layers } from "lucide-react"
import type { PlaythroughStatus } from "@generated/prisma/enums"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { Button } from "@/components/ui/Button"
import {
  AddToLibraryModal,
  type StoreOption,
  type PlanOption,
} from "@/components/game/AddToLibraryModal"
import {
  STATUS_META,
  formatPlaythroughDateLabel,
} from "@/lib/game-utils"

export interface PlaythroughSummaryItem {
  id: string
  number: number
  status: PlaythroughStatus
  platform: string
  startDate: string | null
  endDate: string | null
  rating: number | null
  entriesCount: number
  includedInPlan?: boolean
  planName?: string | null
}

interface PlaythroughsWidgetProps {
  gameId: string
  gameTitle: string
  releaseYear: number | null
  playthroughs: PlaythroughSummaryItem[]
  customPlatforms: string[]
  stores: StoreOption[]
  plans: PlanOption[]
}

export function PlaythroughsWidget({
  gameId,
  gameTitle,
  releaseYear,
  playthroughs,
  customPlatforms,
  stores,
  plans,
}: PlaythroughsWidgetProps) {
  const [modalOpen, setModalOpen] = useState(false)

  if (playthroughs.length === 0) {
    return (
      <>
        <GlassPanel className="p-6 text-center flex flex-col items-center gap-3">
          <p className="text-sm text-zinc-200 font-medium">
            Este xogo está na túa lista de Desexados
          </p>
          <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
            Aínda non tes ningunha partida rexistrada. Cando comeces a xogalo, engade a túa primeira partida para levar o diario, a valoración e os prezos.
          </p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="mt-1"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Rexistrar primeira partida</span>
          </Button>
        </GlassPanel>

        <AddToLibraryModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          gameId={gameId}
          gameTitle={gameTitle}
          releaseYear={releaseYear}
          mode="new-playthrough"
          customPlatforms={customPlatforms}
          stores={stores}
          plans={plans}
        />
      </>
    )
  }

  return (
    <>
      <GlassPanel className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.07] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-display font-semibold text-white">As túas partidas</h2>
            <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded-full tabular-nums">
              {playthroughs.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary-hover hover:text-white transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Nova partida</span>
          </button>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {playthroughs.map((pt) => {
            const meta = STATUS_META[pt.status] || {
              label: pt.status,
              dot: "bg-zinc-400",
            }
            const dateLabel = formatPlaythroughDateLabel(pt.startDate, pt.endDate)

            return (
              <Link
                key={pt.id}
                href={`/games/${gameId}/playthroughs/${pt.id}`}
                transitionTypes={["nav-forward"]}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors group"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
                    <span className="text-sm font-medium text-zinc-100 group-hover:text-white truncate">
                      Partida #{pt.number} · {pt.platform}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-4.5 text-xs text-zinc-400">
                    <span>{meta.label}</span>
                    <span className="text-zinc-600">·</span>
                    <span className="font-mono text-[11px] text-zinc-500">{dateLabel}</span>
                    {pt.includedInPlan && (
                      <>
                        <span className="text-zinc-600">·</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-purple-300">
                          <Layers className="w-3 h-3" aria-hidden="true" />
                          <span>{pt.planName || "Plan"}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {pt.rating && (
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-amber-300/90 tabular-nums">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                      <span>{pt.rating}/5</span>
                    </span>
                  )}
                  {pt.entriesCount > 0 && (
                    <span className="hidden sm:inline text-[11px] font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors tabular-nums">
                      {pt.entriesCount} {pt.entriesCount === 1 ? "entrada" : "entradas"}
                    </span>
                  )}
                  <span className="w-7 h-7 rounded-lg bg-white/[0.04] group-hover:bg-primary/20 border border-white/[0.07] group-hover:border-primary/40 flex items-center justify-center text-zinc-400 group-hover:text-purple-200 transition-all">
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </GlassPanel>

      <AddToLibraryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        gameId={gameId}
        gameTitle={gameTitle}
        releaseYear={releaseYear}
        mode="new-playthrough"
        customPlatforms={customPlatforms}
        stores={stores}
        plans={plans}
      />
    </>
  )
}
