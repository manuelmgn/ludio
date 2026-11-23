import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  Calendar,
  Star,
  CheckCircle2,
  Palette,
  BookOpen,
  Gamepad2,
  ChevronRight,
  ChevronDown,
  Plus,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { AddGameForm } from "@/components/library/AddGameForm"
import { RemoveGameButton } from "@/components/library/RemoveGameButton"
import { ReviewEditor } from "@/components/library/LibraryEntryControls"
import { PlaythroughList } from "@/components/library/PlaythroughList"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { ensureDefaultStores } from "@/lib/actions/settings"
import { syncGameMetadataIfMissing } from "@/lib/api/games"

export const dynamic = "force-dynamic"

interface GamePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function GamePage({ params }: GamePageProps) {
  const { id } = await params

  let game = await prisma.game.findUnique({
    where: { id },
  })

  if (!game) {
    notFound()
  }

  if (game.firstReleaseDate === null || game.igdbRating === null) {
    const synced = await syncGameMetadataIfMissing(id)
    if (synced) {
      game = synced
    }
  }

  const releaseYear = game.firstReleaseDate ? game.firstReleaseDate.getFullYear() : null

  const session = await auth()
  let user = null
  if (session?.user?.email) {
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
  }
  if (!user) {
    user = await prisma.user.findFirst()
  }

  const libraryEntry = user
    ? await prisma.libraryEntry.findUnique({
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
            },
          },
          journalEntry: {
            include: {
              images: true,
            },
          },
          gameCanvas: {
            include: {
              images: true,
            },
          },
        },
      })
    : null

  const customPlatforms = user
    ? await prisma.customPlatform.findMany({
        where: { userId: user.id },
      })
    : []

  const customPlatformNames = customPlatforms.map((p) => p.name)

  await ensureDefaultStores()
  const stores = await prisma.store.findMany({
    where: {
      OR: [{ isDefault: true }, ...(user ? [{ userId: user.id }] : [])],
    },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  })

  const storeOptions = stores.map((s) => ({ id: s.id, name: s.name }))

  return (
    <div className="flex flex-1 flex-col items-center px-4 sm:px-8 py-6 sm:py-8 relative">
      {/* Cinematic Cover Ambient Backdrop */}
      {game.coverUrl && (
        <div
          aria-hidden="true"
          className="fixed inset-x-0 top-0 h-[440px] -z-10 pointer-events-none overflow-hidden"
        >
          <Image
            src={game.coverUrl}
            alt=""
            fill
            unoptimized
            className="object-cover scale-110 blur-3xl opacity-20 saturate-150"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#08080d]/50 via-[#08080d]/85 to-[#08080d]" />
        </div>
      )}

      {/* Breadcrumb / Top Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-6">
        <Link
          href="/library"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-sans text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Volver á Biblioteca</span>
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-sans text-zinc-400 hover:text-white transition-colors"
        >
          <Search className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Nova busca</span>
        </Link>
      </div>

      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-7">
        {/* Left Column: Game Cover & Shortcuts */}
        <div className="w-full md:w-[320px] shrink-0 flex flex-col gap-4">
          <GlassPanel variant="elevated" className="p-4 flex flex-col items-center">
            <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#0c0c14] mb-4 relative shadow-2xl ring-1 ring-white/10">
              {game.coverUrl ? (
                <Image
                  src={game.coverUrl}
                  alt={game.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-purple-950/90 via-[#1b1030] to-[#0c0c16] p-4 border border-primary/25">
                  <Gamepad2 className="w-10 h-10 text-primary-hover/60" aria-hidden="true" />
                  <span className="text-purple-100 text-center font-medium line-clamp-3 text-sm">
                    {game.title}
                  </span>
                </div>
              )}

              {releaseYear && (
                <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-mono text-zinc-200 border border-white/15 inline-flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-zinc-400" aria-hidden="true" />
                  <span>{releaseYear}</span>
                </div>
              )}

              {game.igdbRating !== null && (
                <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-mono text-amber-300 border border-amber-400/25 inline-flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                  <span>{game.igdbRating}</span>
                </div>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-display font-bold text-white text-center leading-snug tracking-tight mb-1.5">
              {game.title}
            </h1>

            {(releaseYear || game.igdbRating !== null) && (
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-zinc-400 mb-2">
                {releaseYear && <span>{releaseYear}</span>}
                {releaseYear && game.igdbRating !== null && <span className="text-zinc-600">•</span>}
                {game.igdbRating !== null && (
                  <span className="text-amber-300">IGDB {game.igdbRating}/100</span>
                )}
              </div>
            )}

            {libraryEntry && (
              <div className="w-full mt-3 pt-3.5 border-t border-white/[0.08] flex flex-col items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Na túa biblioteca</span>
                </span>

                {libraryEntry.rating && (
                  <div className="flex items-center gap-1 mt-0.5" aria-label={`Valoración: ${libraryEntry.rating} de 5`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`w-4 h-4 ${
                          n <= libraryEntry.rating!
                            ? "fill-amber-400 text-amber-400"
                            : "text-zinc-700"
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                    <span className="text-zinc-400 text-xs font-mono ml-1.5">
                      {libraryEntry.rating}/5
                    </span>
                  </div>
                )}

                <div className="mt-1 w-full flex justify-center">
                  <RemoveGameButton gameId={game.id} gameTitle={game.title} />
                </div>
              </div>
            )}
          </GlassPanel>

          {/* Quick Actions (Canvas & Journal) */}
          <div className="flex flex-col gap-2.5">
            <Link
              href={`/games/${id}/canvas`}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-primary/20 to-purple-900/15 hover:from-primary/30 hover:to-purple-900/25 text-white font-sans text-sm border border-primary/35 shadow-[0_8px_24px_-8px_rgba(168,85,247,0.35)] transition-all group"
            >
              <span className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-primary/25 border border-primary/40 flex items-center justify-center text-purple-200">
                  <Palette className="w-4 h-4" aria-hidden="true" />
                </span>
                <span className="font-medium">Caderno Canvas</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-mono text-purple-200 group-hover:translate-x-0.5 transition-transform">
                <span>
                  {libraryEntry?.gameCanvas?.images?.length
                    ? `${libraryEntry.gameCanvas.images.length} capturas`
                    : "Abrir"}
                </span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            </Link>

            <Link
              href={`/games/${id}/journal`}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] text-white font-sans text-sm border border-white/[0.09] hover:border-white/20 transition-all group"
            >
              <span className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-300">
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                </span>
                <span className="font-medium">Diario de Partidas</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-mono text-zinc-400 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-transform">
                <span>{libraryEntry?.journalEntry ? "Ver entradas" : "Escribir"}</span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            </Link>
          </div>
        </div>

        {/* Right Column: Library Status & Playthroughs */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {libraryEntry ? (
            <GlassPanel className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <h2 className="text-xl font-display font-semibold text-white tracking-tight flex items-center gap-2.5">
                  <Gamepad2 className="w-5 h-5 text-primary-hover" aria-hidden="true" />
                  <span>Historial de Partidas</span>
                </h2>
                <span className="text-xs text-zinc-400 font-mono bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-full tabular-nums">
                  {libraryEntry.playthroughs.length}{" "}
                  {libraryEntry.playthroughs.length === 1 ? "partida" : "partidas"}
                </span>
              </div>

              <ReviewEditor
                gameId={game.id}
                initialRating={libraryEntry.rating}
                initialReview={libraryEntry.publicReview}
              />

              {libraryEntry.playthroughs.length > 0 ? (
                <PlaythroughList
                  gameId={game.id}
                  playthroughs={libraryEntry.playthroughs.map((pt) => ({
                    id: pt.id,
                    status: pt.status,
                    platform: pt.platform,
                    startDate: pt.startDate,
                    endDate: pt.endDate,
                    purchasePrice: pt.purchasePrice,
                    purchaseStoreId: pt.purchaseStoreId,
                    purchaseStore: pt.purchaseStore
                      ? { id: pt.purchaseStore.id, name: pt.purchaseStore.name }
                      : null,
                    purchaseDate: pt.purchaseDate,
                    salePrice: pt.salePrice,
                    saleStoreId: pt.saleStoreId,
                    saleStore: pt.saleStore
                      ? { id: pt.saleStore.id, name: pt.saleStore.name }
                      : null,
                    saleDate: pt.saleDate,
                  }))}
                  stores={storeOptions}
                  customPlatforms={customPlatformNames}
                />
              ) : (
                <div className="text-sm text-zinc-400 bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 text-center">
                  Este xogo está na túa lista de <strong className="text-purple-300">Desexados</strong>. Rexistra a túa primeira partida abaixo cando comeces a xogalo.
                </div>
              )}

              {/* Add another playthrough form */}
              <div className="pt-4 border-t border-white/[0.08]">
                <details className="group">
                  <summary className="cursor-pointer list-none text-sm font-medium text-primary-hover hover:text-white flex items-center justify-between py-2 px-3 rounded-xl bg-primary/10 border border-primary/25 hover:bg-primary/15 transition-colors">
                    <span className="inline-flex items-center gap-2">
                      <Plus className="w-4 h-4" aria-hidden="true" />
                      <span>Rexistrar outra partida ou actualizar estado</span>
                    </span>
                    <ChevronDown
                      className="w-4 h-4 transition-transform duration-200 group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <div className="mt-4">
                    <AddGameForm
                      gameId={game.id}
                      customPlatforms={customPlatformNames}
                      stores={storeOptions}
                    />
                  </div>
                </details>
              </div>
            </GlassPanel>
          ) : (
            <AddGameForm
              gameId={game.id}
              customPlatforms={customPlatformNames}
              stores={storeOptions}
            />
          )}
        </div>
      </div>
    </div>
  )
}
