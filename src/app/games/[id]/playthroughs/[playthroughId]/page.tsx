import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Palette, ChevronRight, Gamepad2 } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { requireAuthenticatedUser } from "@/lib/auth-user"
import { ensureDefaultStores, ensureDefaultPlans } from "@/lib/actions/settings"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { PlaythroughJournalSection } from "@/components/game/PlaythroughJournalSection"
import {
  PlaythroughRatingCard,
  PlaythroughDetailsCard,
  DeletePlaythroughAction,
} from "@/components/game/PlaythroughSidebarControls"
import {
  STATUS_META,
  formatPlaythroughDateLabel,
  formatPlaythroughYearRange,
  getShortPlatformName,
  sortAlphabetically,
  sortByNameAlphabetically,
} from "@/lib/game-utils"

export const dynamic = "force-dynamic"

interface PlaythroughPageProps {
  params: Promise<{
    id: string
    playthroughId: string
  }>
}

export default async function PlaythroughPage({ params }: PlaythroughPageProps) {
  const { id, playthroughId } = await params

  const user = await requireAuthenticatedUser()

  const game = await prisma.game.findUnique({
    where: { id },
  })
  if (!game) {
    notFound()
  }

  const libraryEntry = await prisma.libraryEntry.findUnique({
    where: {
      userId_gameId: {
        userId: user.id,
        gameId: id,
      },
    },
    include: {
      playthroughs: {
        orderBy: { createdAt: "desc" },
        include: {
          purchaseStore: true,
          saleStore: true,
          plan: true,
          journalEntries: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  })

  if (!libraryEntry) {
    notFound()
  }

  const totalPlaythroughs = libraryEntry.playthroughs.length
  const currentIndex = libraryEntry.playthroughs.findIndex((p) => p.id === playthroughId)
  if (currentIndex === -1) {
    notFound()
  }

  const playthrough = libraryEntry.playthroughs[currentIndex]
  const playthroughNumber = totalPlaythroughs - currentIndex
  const statusMeta = STATUS_META[playthrough.status]
  const dateLabel = formatPlaythroughDateLabel(playthrough.startDate, playthrough.endDate)

  await Promise.all([ensureDefaultStores(), ensureDefaultPlans()])

  const [customPlatforms, stores, plans] = await Promise.all([
    prisma.customPlatform.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    }),
    prisma.store.findMany({
      where: {
        OR: [{ isDefault: true }, { userId: user.id }],
      },
      orderBy: { name: "asc" },
    }),
    prisma.plan.findMany({
      where: {
        OR: [{ isDefault: true }, { userId: user.id }],
      },
      orderBy: { name: "asc" },
    }),
  ])

  const customPlatformNames = sortAlphabetically(customPlatforms.map((p) => p.name))
  const storeOptions = sortByNameAlphabetically(stores.map((s) => ({ id: s.id, name: s.name })))
  const planOptions = sortByNameAlphabetically(plans.map((p) => ({ id: p.id, name: p.name })))

  const serializedEntries = playthrough.journalEntries.map((entry) => ({
    id: entry.id,
    content: entry.content,
    imageUrl: entry.imageUrl,
    privacyLevel: entry.privacyLevel,
    createdAt: entry.createdAt.toISOString(),
  }))

  return (
    <div className="flex flex-1 flex-col items-center pb-14">
      <div className="w-full max-w-6xl px-3 sm:px-6 pt-6 sm:pt-8 flex flex-col gap-6">
        {/* Top Breadcrumb + Playthrough Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href={`/games/${id}`}
              transitionTypes={["nav-back"]}
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="truncate max-w-[200px] sm:max-w-xs">{game.title}</span>
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-200 font-medium shrink-0">
              Partida #{playthroughNumber}
            </span>
          </div>

          {totalPlaythroughs > 1 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {libraryEntry.playthroughs.map((p, idx) => {
                const num = totalPlaythroughs - idx
                const isActive = p.id === playthrough.id
                const meta = STATUS_META[p.status]
                const yearRange = formatPlaythroughYearRange(
                  p.startDate,
                  p.endDate,
                  p.createdAt
                )
                return (
                  <Link
                    key={p.id}
                    href={`/games/${id}/playthroughs/${p.id}`}
                    className={`px-2.5 py-1 rounded-lg text-[11px] inline-flex items-center gap-1.5 transition-all ${
                      isActive
                        ? "bg-white/10 text-white border border-white/15 font-medium"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                    <span>Partida #{num}</span>
                    <span className="text-zinc-500">·</span>
                    <span>{getShortPlatformName(p.platform)}</span>
                    {yearRange && (
                      <span className="font-mono text-[10px] text-zinc-400">
                        ({yearRange})
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Compact Playthrough Header */}
        <GlassPanel className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href={`/games/${id}`}
              transitionTypes={["nav-back"]}
              className="w-12 h-16 rounded-xl overflow-hidden shrink-0 ring-1 ring-white/15 bg-[#0c0c14] relative"
            >
              {game.coverUrl ? (
                <Image
                  src={game.coverUrl}
                  alt={game.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-purple-950/60">
                  <Gamepad2 className="w-5 h-5 text-primary-hover/70" aria-hidden="true" />
                </div>
              )}
            </Link>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-100 bg-white/[0.06] border border-white/12 px-2.5 py-0.5 rounded-full">
                  <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                  <span>{statusMeta.label}</span>
                </span>
                <span className="text-xs text-zinc-300">{playthrough.platform}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-xs font-mono text-zinc-400">{dateLabel}</span>
              </div>

              <h1 className="text-xl font-display font-bold text-white tracking-tight truncate">
                Partida #{playthroughNumber} · {playthrough.platform}
              </h1>
              <p className="text-xs text-zinc-400 truncate">{game.title}</p>
            </div>
          </div>
        </GlassPanel>

        {/* Main 2-Column Body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left 2/3: Journal for this playthrough */}
          <div className="lg:col-span-2 min-w-0">
            <PlaythroughJournalSection
              playthroughId={playthrough.id}
              gameId={game.id}
              entries={serializedEntries}
            />
          </div>

          {/* Right 1/3: Rating, Details, Pricing & Actions */}
          <aside className="flex flex-col gap-4">
            <PlaythroughRatingCard
              playthroughId={playthrough.id}
              gameId={game.id}
              initialRating={playthrough.rating}
              initialReview={playthrough.review}
            />

            <PlaythroughDetailsCard
              gameId={game.id}
              playthrough={{
                id: playthrough.id,
                status: playthrough.status,
                platform: playthrough.platform,
                startDate: playthrough.startDate,
                endDate: playthrough.endDate,
                purchasePrice: playthrough.purchasePrice,
                purchaseStoreId: playthrough.purchaseStoreId,
                purchaseStoreName: playthrough.purchaseStore?.name ?? null,
                purchaseDate: playthrough.purchaseDate,
                salePrice: playthrough.salePrice,
                saleStoreId: playthrough.saleStoreId,
                saleStoreName: playthrough.saleStore?.name ?? null,
                saleDate: playthrough.saleDate,
                includedInPlan: playthrough.includedInPlan,
                planId: playthrough.planId,
                planName: playthrough.plan?.name ?? null,
              }}
              stores={storeOptions}
              plans={planOptions}
              customPlatforms={customPlatformNames}
            />

            <GlassPanel className="p-4 flex flex-col gap-2">
              <Link
                href={`/games/${id}/canvas`}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-primary/15 border border-white/[0.07] hover:border-primary/35 text-xs text-zinc-200 transition-all group"
              >
                <span className="inline-flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-primary-hover" aria-hidden="true" />
                  <span>Caderno Canvas do xogo</span>
                </span>
                <ChevronRight
                  className="w-3.5 h-3.5 text-zinc-400 group-hover:text-purple-200"
                  aria-hidden="true"
                />
              </Link>

              <DeletePlaythroughAction playthroughId={playthrough.id} gameId={game.id} />
            </GlassPanel>
          </aside>
        </div>
      </div>
    </div>
  )
}
