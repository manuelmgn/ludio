import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { AddGameForm } from "@/components/library/AddGameForm"
import { RemoveGameButton } from "@/components/library/RemoveGameButton"
import { GlassPanel } from "@/components/ui/GlassPanel"
import Image from "next/image"
import Link from "next/link"

export const dynamic = "force-dynamic"

interface GamePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function GamePage({ params }: GamePageProps) {
  const { id } = await params

  const game = await prisma.game.findUnique({
    where: { id },
  })

  if (!game) {
    notFound()
  }

  // Get current user or demo user
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

  // Fetch library entry if exists
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

  // Fetch user's custom platforms
  const customPlatforms = user
    ? await prisma.customPlatform.findMany({
        where: { userId: user.id },
      })
    : []

  const customPlatformNames = customPlatforms.map((p) => p.name)

  return (
    <div className="flex min-h-screen flex-col items-center p-4 sm:p-8 relative">
      {/* Background decoration */}
      <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-1/3 left-1/4 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-[140px] -z-10" />

      {/* Breadcrumb / Top Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6">
        <Link
          href="/library"
          className="text-sm font-sans text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
        >
          <span>←</span>
          <span>Volver á Biblioteca</span>
        </Link>
        <Link
          href="/search"
          className="text-sm font-sans text-zinc-400 hover:text-white transition-colors"
        >
          Nova busca →
        </Link>
      </div>

      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8">
        {/* Left Column: Game Cover & Shortcuts */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <GlassPanel className="p-4 flex flex-col overflow-hidden items-center">
            <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-zinc-900/50 mb-4 relative shadow-2xl">
              {game.coverUrl ? (
                <Image
                  src={game.coverUrl}
                  alt={game.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#4a0080] p-4 border border-primary/30">
                  <span className="text-purple-100 text-center font-medium line-clamp-3">
                    {game.title}
                  </span>
                </div>
              )}
            </div>

            <h1 className="text-2xl font-pixel text-white text-center leading-tight tracking-wider mb-2">
              {game.title}
            </h1>

            {libraryEntry && (
              <div className="w-full mt-2 pt-3 border-t border-white/10 flex flex-col items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                  ✓ Na túa biblioteca
                </span>
                {libraryEntry.rating && (
                  <div className="text-amber-400 text-sm font-mono tracking-widest mt-1">
                    {"⭐".repeat(libraryEntry.rating)}
                    <span className="text-zinc-400 text-xs ml-1">({libraryEntry.rating}/5)</span>
                  </div>
                )}
                <div className="mt-2">
                  <RemoveGameButton gameId={game.id} gameTitle={game.title} />
                </div>
              </div>
            )}
          </GlassPanel>

          {/* Quick Actions (Canvas & Journal) */}
          <div className="flex flex-col gap-2">
            <Link
              href={`/games/${id}/canvas`}
              className="flex items-center justify-between p-3.5 rounded-xl bg-primary/20 hover:bg-primary/30 text-white font-sans text-sm border border-primary/40 shadow-[0_0_15px_rgba(157,0,255,0.2)] transition-all group"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">🎨</span>
                <span className="font-medium">Caderno Canvas</span>
              </span>
              <span className="text-xs font-mono text-purple-300 group-hover:translate-x-1 transition-transform">
                {libraryEntry?.gameCanvas?.images?.length ? `${libraryEntry.gameCanvas.images.length} capturas →` : "Abrir →"}
              </span>
            </Link>

            <Link
              href={`/games/${id}/journal`}
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-sans text-sm border border-white/10 transition-all group"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">📖</span>
                <span className="font-medium">Diario de Partidas</span>
              </span>
              <span className="text-xs font-mono text-zinc-400 group-hover:translate-x-1 transition-transform">
                {libraryEntry?.journalEntry ? "Ver entradas →" : "Escribir →"}
              </span>
            </Link>
          </div>
        </div>

        {/* Right Column: Library Status & Form */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          {libraryEntry ? (
            <GlassPanel className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-xl font-pixel text-white tracking-wider flex items-center gap-2">
                  <span>🕹️</span>
                  <span>Historial de Partidas</span>
                </h2>
                <span className="text-xs text-zinc-400 font-mono">
                  {libraryEntry.playthroughs.length} partida(s)
                </span>
              </div>

              {libraryEntry.publicReview && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                    A túa crítica
                  </span>
                  <p className="text-zinc-200 font-sans text-sm italic">
                    &ldquo;{libraryEntry.publicReview}&rdquo;
                  </p>
                </div>
              )}

              {libraryEntry.playthroughs.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {libraryEntry.playthroughs.map((pt) => {
                    const statusLabels: Record<string, { label: string; color: string }> = {
                      PLAYING: { label: "Xogando", color: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
                      COMPLETED: { label: "Completado", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
                      ON_HOLD: { label: "En Pausa", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
                      ABANDONED: { label: "Abandonado", color: "bg-rose-500/20 text-rose-300 border-rose-500/40" },
                    }
                    const badge = statusLabels[pt.status] || { label: pt.status, color: "bg-zinc-800 text-zinc-300 border-zinc-700" }

                    return (
                      <div
                        key={pt.id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="text-sm font-sans text-zinc-200">
                            {pt.platform}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-zinc-400">
                          {pt.startDate || pt.endDate ? (
                            <span>
                              {pt.startDate || "?"} → {pt.endDate || "Presente"}
                            </span>
                          ) : (
                            <span>Rexistrada</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-sm text-zinc-400 bg-white/5 rounded-xl p-4 text-center">
                  Este xogo está na túa lista de <strong>Desexados</strong>. Rexistra a túa primeira partida abaixo cando comeces a xogalo.
                </div>
              )}

              {/* Add another playthrough form */}
              <div className="pt-4 border-t border-white/10">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-primary hover:text-primary-hover flex items-center justify-between">
                    <span>+ Rexistrar outra partida ou actualizar estado</span>
                    <span className="text-xs transition-transform group-open:rotate-180">▼</span>
                  </summary>
                  <div className="mt-4">
                    <AddGameForm gameId={game.id} customPlatforms={customPlatformNames} />
                  </div>
                </details>
              </div>
            </GlassPanel>
          ) : (
            <AddGameForm gameId={game.id} customPlatforms={customPlatformNames} />
          )}
        </div>
      </div>
    </div>
  )
}
