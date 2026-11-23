import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  Star,
  Palette,
  BookOpen,
  Gamepad2,
  ChevronRight,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { requireAuthenticatedUser } from "@/lib/auth-user"
import { ReviewEditor } from "@/components/library/LibraryEntryControls"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { GameHeroActions } from "@/components/game/AddToLibraryModal"
import { GameGallery, type GalleryImageItem } from "@/components/game/GameGallery"
import { PlaythroughsWidget } from "@/components/game/PlaythroughsWidget"
import { ensureDefaultStores } from "@/lib/actions/settings"
import { syncGameMetadataIfMissing } from "@/lib/api/games"
import { getShortPlatformName } from "@/lib/game-utils"

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

  // Sync rich IGDB details if not yet fetched
  if (
    game.detailsSyncedAt === null ||
    game.firstReleaseDate === null ||
    game.igdbRating === null
  ) {
    const synced = await syncGameMetadataIfMissing(id)
    if (synced) {
      game = synced
    }
  }

  const releaseYear = game.firstReleaseDate ? game.firstReleaseDate.getFullYear() : null
  const formattedReleaseDate = game.firstReleaseDate
    ? game.firstReleaseDate.toLocaleDateString("gl-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null

  const user = await requireAuthenticatedUser()

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
              journalEntries: {
                orderBy: { createdAt: "desc" },
              },
            },
          },
          journalEntry: {
            include: {
              images: {
                orderBy: { createdAt: "desc" },
              },
            },
          },
          gameCanvas: {
            include: {
              images: {
                orderBy: { createdAt: "desc" },
              },
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

  // Compute playthrough numbers (chronological: oldest = #1, newest = #N)
  const totalPlaythroughs = libraryEntry?.playthroughs.length ?? 0
  const playthroughSummaries = (libraryEntry?.playthroughs ?? []).map((pt, idx) => ({
    id: pt.id,
    number: totalPlaythroughs - idx,
    status: pt.status,
    platform: pt.platform,
    startDate: pt.startDate,
    endDate: pt.endDate,
    rating: pt.rating,
    entriesCount: pt.journalEntries.length,
  }))

  const latestPlaythrough = libraryEntry?.playthroughs[0] ?? null
  const isWishedOnly = Boolean(libraryEntry) && totalPlaythroughs === 0

  // Economy totals across all playthroughs of this game
  let totalSpent = 0
  let totalEarned = 0
  let purchasesCount = 0
  let salesCount = 0
  for (const pt of libraryEntry?.playthroughs ?? []) {
    if (pt.purchasePrice != null) {
      totalSpent += pt.purchasePrice
      purchasesCount += 1
    }
    if (pt.salePrice != null) {
      totalEarned += pt.salePrice
      salesCount += 1
    }
  }
  const hasEconomy = purchasesCount > 0 || salesCount > 0
  const netBalance = totalEarned - totalSpent

  // Gallery images: official (IGDB screenshots + artworks) & user-uploaded (when in library)
  const officialImages: GalleryImageItem[] = [
    ...game.screenshots.map((url, idx) => ({
      id: `igdb-ss-${idx}`,
      url,
      alt: `${game.title} — Captura oficial ${idx + 1}`,
      isMine: false,
      sourceLabel: "IGDB",
    })),
    ...game.artworks.map((url, idx) => ({
      id: `igdb-art-${idx}`,
      url,
      alt: `${game.title} — Arte oficial ${idx + 1}`,
      isMine: false,
      sourceLabel: "Arte IGDB",
    })),
  ]

  const userImages: GalleryImageItem[] = []
  if (libraryEntry) {
    for (const [idx, pt] of libraryEntry.playthroughs.entries()) {
      const ptNumber = totalPlaythroughs - idx
      for (const entry of pt.journalEntries) {
        if (entry.imageUrl) {
          userImages.push({
            id: `pt-img-${entry.id}`,
            url: entry.imageUrl,
            alt: entry.content
              ? entry.content.slice(0, 80)
              : `Captura da Partida #${ptNumber}`,
            isMine: true,
            sourceLabel: `Diario · Partida #${ptNumber}`,
          })
        }
      }
    }
    for (const img of libraryEntry.gameCanvas?.images ?? []) {
      userImages.push({
        id: `canvas-img-${img.id}`,
        url: img.url,
        alt: `Captura do Caderno Canvas`,
        isMine: true,
        sourceLabel: "Canvas",
      })
    }
    for (const img of libraryEntry.journalEntry?.images ?? []) {
      userImages.push({
        id: `journal-img-${img.id}`,
        url: img.localUrl,
        alt: `Captura do Diario`,
        isMine: true,
        sourceLabel: "Diario",
      })
    }
  }

  const totalJournalEntries =
    (libraryEntry?.playthroughs.reduce((acc, pt) => acc + pt.journalEntries.length, 0) ?? 0) +
    (libraryEntry?.journalEntry?.content ? 1 : 0)

  const backdropUrl = game.artworks[0] || game.screenshots[0] || game.coverUrl

  const techSpecs: [string, string][] = []
  if (formattedReleaseDate) techSpecs.push(["Lanzamento", formattedReleaseDate])
  if (game.developers.length > 0) techSpecs.push(["Desenvolvedor", game.developers.join(", ")])
  if (game.publishers.length > 0) techSpecs.push(["Editor", game.publishers.join(", ")])
  if (game.gameModes.length > 0) techSpecs.push(["Modos", game.gameModes.join(", ")])
  if (game.igdbRating !== null) {
    techSpecs.push([
      "Valoración IGDB",
      `${game.igdbRating}/100${game.igdbRatingCount ? ` (${game.igdbRatingCount} votos)` : ""}`,
    ])
  }

  return (
    <div className="flex flex-1 flex-col items-center pb-14 relative">
      {/* Cinematic Backdrop */}
      {backdropUrl && (
        <div
          aria-hidden="true"
          className="fixed inset-x-0 top-0 h-[380px] -z-10 pointer-events-none overflow-hidden"
        >
          <Image
            src={backdropUrl}
            alt=""
            fill
            unoptimized
            className="object-cover scale-105 opacity-25 blur-[2px] saturate-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#08080d]/45 via-[#08080d]/80 to-[#08080d]" />
        </div>
      )}

      <div className="w-full max-w-5xl px-4 sm:px-8 pt-6 flex flex-col gap-7">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between">
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

        {/* HERO */}
        <section className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Cover */}
          <div className="w-36 sm:w-44 shrink-0 aspect-[3/4] rounded-2xl overflow-hidden bg-[#0c0c14] relative shadow-2xl ring-1 ring-white/15">
            {game.coverUrl ? (
              <Image
                src={game.coverUrl}
                alt={game.title}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-950/90 via-[#1b1030] to-[#0c0c16] p-4 border border-primary/25">
                <Gamepad2 className="w-9 h-9 text-primary-hover/60" aria-hidden="true" />
                <span className="text-purple-100 text-center font-medium line-clamp-3 text-xs">
                  {game.title}
                </span>
              </div>
            )}
          </div>

          {/* Info + Primary Actions */}
          <div className="flex-1 min-w-0 flex flex-col justify-between gap-4 pt-0.5">
            <div className="space-y-2.5">
              {/* Release Year + Genres */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                {releaseYear && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/[0.07] border border-white/10 text-zinc-200">
                    {releaseYear}
                  </span>
                )}
                {game.genres.slice(0, 4).map((genre, i) => (
                  <span
                    key={genre}
                    className={`px-2.5 py-0.5 rounded-full border ${
                      i === 0
                        ? "bg-primary/15 border-primary/35 text-purple-200"
                        : "bg-white/[0.05] border-white/10 text-zinc-300"
                    }`}
                  >
                    {genre}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl sm:text-4xl font-display font-bold text-white tracking-tight leading-tight">
                {game.title}
              </h1>

              {(game.developers.length > 0 || game.publishers.length > 0) && (
                <p className="text-xs sm:text-sm text-zinc-400">
                  {[game.developers[0], game.publishers[0]]
                    .filter((v, i, arr) => Boolean(v) && arr.indexOf(v) === i)
                    .join(" · ")}
                </p>
              )}

              {/* IGDB Score + Original Platforms */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {game.igdbRating !== null && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-400/25">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                    <span className="font-mono font-semibold text-amber-200 text-xs tabular-nums">
                      {game.igdbRating}
                    </span>
                    <span className="text-[11px] text-amber-200/70 font-mono">/ 100 IGDB</span>
                  </div>
                )}

                {game.platforms.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {game.platforms.slice(0, 6).map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[11px] text-zinc-300"
                        title={p}
                      >
                        {getShortPlatformName(p)}
                      </span>
                    ))}
                    {game.platforms.length > 6 && (
                      <span className="text-[11px] font-mono text-zinc-500">
                        +{game.platforms.length - 6}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <GameHeroActions
              gameId={game.id}
              gameTitle={game.title}
              releaseYear={releaseYear}
              inLibrary={Boolean(libraryEntry)}
              isWishedOnly={isWishedOnly}
              latestPlaythroughStatus={latestPlaythrough?.status ?? null}
              latestPlaythroughPlatform={latestPlaythrough?.platform ?? null}
              overallRating={libraryEntry?.rating ?? null}
              customPlatforms={customPlatformNames}
              stores={storeOptions}
            />
          </div>
        </section>

        {/* MAIN 2-COLUMN BODY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* LEFT 2/3 COLUMN */}
          <div className="lg:col-span-2 flex flex-col gap-6 min-w-0">
            {/* Playthroughs Widget — ONLY when in library */}
            {libraryEntry && (
              <PlaythroughsWidget
                gameId={game.id}
                gameTitle={game.title}
                releaseYear={releaseYear}
                playthroughs={playthroughSummaries}
                customPlatforms={customPlatformNames}
                stores={storeOptions}
              />
            )}

            {/* About / Description */}
            <GlassPanel className="p-5 flex flex-col gap-3">
              <h2 className="text-sm font-display font-semibold text-white tracking-tight">
                Sobre o xogo
              </h2>
              {game.summary ? (
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                  {game.summary}
                </p>
              ) : (
                <p className="text-xs text-zinc-500 italic">
                  Non hai descrición dispoñible para este xogo na base de datos.
                </p>
              )}
              {game.storyline && game.storyline !== game.summary && (
                <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-line pt-2 border-t border-white/[0.06]">
                  {game.storyline}
                </p>
              )}
            </GlassPanel>

            {/* Screenshots & User Captures Gallery */}
            <GameGallery
              officialImages={officialImages}
              userImages={libraryEntry ? userImages : []}
            />
          </div>

          {/* RIGHT 1/3 SIDEBAR */}
          <aside className="flex flex-col gap-4">
            {/* Compact Workspace Links (Canvas & Journal) — ONLY when in library */}
            {libraryEntry && (
              <GlassPanel className="p-4 flex flex-col gap-2">
                <h3 className="px-1 text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  Espazo do xogo
                </h3>

                <Link
                  href={`/games/${id}/canvas`}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.03] hover:bg-primary/15 border border-white/[0.07] hover:border-primary/35 transition-all group"
                >
                  <span className="flex items-center gap-2.5 text-xs font-medium text-zinc-100">
                    <Palette className="w-4 h-4 text-primary-hover" aria-hidden="true" />
                    <span>Caderno Canvas</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 group-hover:text-purple-200">
                    <span>
                      {libraryEntry.gameCanvas?.images?.length
                        ? `${libraryEntry.gameCanvas.images.length} capturas`
                        : "Abrir"}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </Link>

                <Link
                  href={
                    latestPlaythrough
                      ? `/games/${id}/playthroughs/${latestPlaythrough.id}`
                      : `/games/${id}/journal`
                  }
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.07] hover:border-white/20 transition-all group"
                >
                  <span className="flex items-center gap-2.5 text-xs font-medium text-zinc-100">
                    <BookOpen className="w-4 h-4 text-zinc-300" aria-hidden="true" />
                    <span>Diario de Partidas</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 group-hover:text-zinc-200">
                    <span>
                      {totalJournalEntries > 0
                        ? `${totalJournalEntries} ${totalJournalEntries === 1 ? "entrada" : "entradas"}`
                        : "Escribir"}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </Link>
              </GlassPanel>
            )}

            {/* User Rating & Review — ONLY when in library */}
            {libraryEntry && (
              <ReviewEditor
                gameId={game.id}
                initialRating={libraryEntry.rating}
                initialReview={libraryEntry.publicReview}
              />
            )}

            {/* Economy Summary — ONLY when in library and at least one price exists */}
            {libraryEntry && hasEconomy && (
              <GlassPanel className="p-5 flex flex-col gap-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-amber-300/90">
                  Economía deste xogo
                </h3>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">
                      Invertido ({purchasesCount} {purchasesCount === 1 ? "compra" : "compras"})
                    </span>
                    <span className="font-mono text-zinc-200 tabular-nums">
                      {totalSpent.toFixed(2)}€
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">
                      Recuperado ({salesCount} {salesCount === 1 ? "venda" : "vendas"})
                    </span>
                    <span className="font-mono text-emerald-300 tabular-nums">
                      {totalEarned.toFixed(2)}€
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.07]">
                    <span className="text-zinc-300 font-medium">Custo neto</span>
                    <span className="font-mono font-semibold text-white tabular-nums">
                      {netBalance > 0 ? `+${netBalance.toFixed(2)}€` : `${netBalance.toFixed(2)}€`}
                    </span>
                  </div>
                </div>
              </GlassPanel>
            )}

            {/* Technical Details */}
            {(techSpecs.length > 0 || game.platforms.length > 0) && (
              <GlassPanel className="p-5 flex flex-col gap-3.5">
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Ficha técnica
                </h3>
                {techSpecs.length > 0 && (
                  <dl className="flex flex-col gap-2.5 text-xs">
                    {techSpecs.map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-start justify-between gap-3 pb-2 border-b border-white/[0.06] last:border-0 last:pb-0"
                      >
                        <dt className="text-zinc-500 shrink-0">{label}</dt>
                        <dd className="text-zinc-200 text-right">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {game.platforms.length > 0 && (
                  <div className="pt-2 border-t border-white/[0.08] flex flex-col gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                      Plataformas orixinais
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {game.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] text-zinc-300"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </GlassPanel>
            )}

            {/* Subtle prompt when not in library */}
            {!libraryEntry && (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-center space-y-1">
                <p className="text-xs text-zinc-300 font-medium">Non está na túa biblioteca</p>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Engádeo para rexistrar partidas, diario, valoración, prezos e Caderno Canvas.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
