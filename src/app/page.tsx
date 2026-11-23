import Link from "next/link"
import Image from "next/image"
import {
  Search,
  Library,
  Compass,
  Settings,
  Palette,
  BookOpen,
  Gamepad2,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { GlassPanel } from "@/components/ui/GlassPanel"

export const dynamic = "force-dynamic"

const statusStyles: Record<string, { label: string; dot: string; badge: string }> = {
  PLAYING: {
    label: "Xogando",
    dot: "bg-sky-400",
    badge: "bg-sky-950/80 text-sky-200 border-sky-400/30",
  },
  COMPLETED: {
    label: "Completado",
    dot: "bg-emerald-400",
    badge: "bg-emerald-950/80 text-emerald-200 border-emerald-400/30",
  },
  ON_HOLD: {
    label: "En Pausa",
    dot: "bg-amber-400",
    badge: "bg-amber-950/80 text-amber-200 border-amber-400/30",
  },
  ABANDONED: {
    label: "Abandonado",
    dot: "bg-rose-400",
    badge: "bg-rose-950/80 text-rose-200 border-rose-400/30",
  },
}

export default async function HomePage() {
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

  const [libraryCount, recentEntries, totalGamesCount] = await Promise.all([
    user ? prisma.libraryEntry.count({ where: { userId: user.id } }) : 0,
    user
      ? prisma.libraryEntry.findMany({
          where: { userId: user.id },
          take: 4,
          orderBy: { updatedAt: "desc" },
          include: {
            game: true,
            playthroughs: { take: 1, orderBy: { updatedAt: "desc" } },
          },
        })
      : [],
    prisma.game.count(),
  ])

  const suggestedGames =
    recentEntries.length === 0
      ? await prisma.game.findMany({
          take: 4,
          orderBy: { createdAt: "desc" },
        })
      : []

  return (
    <div className="flex flex-1 flex-col items-center justify-between px-4 sm:px-8 py-8 relative">
      {/* Hero Section */}
      <section className="w-full max-w-5xl flex flex-col items-center text-center mt-4 sm:mt-8 mb-20 relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-7 backdrop-blur-md shadow-[0_0_24px_rgba(168,85,247,0.18)]">
          <Sparkles className="w-3.5 h-3.5 text-primary-hover" aria-hidden="true" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-purple-200">
            {totalGamesCount > 0
              ? `${totalGamesCount} xogos indexados`
              : "Diario & Colección Gamer"}
          </span>
        </div>

        <h1 className="font-pixel text-7xl sm:text-8xl md:text-[7.25rem] tracking-[0.14em] leading-none bg-gradient-to-b from-white via-purple-100 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(168,85,247,0.45)] mb-5 select-none">
          LUDIO
        </h1>

        <p className="max-w-2xl text-base sm:text-lg text-zinc-300/90 font-sans leading-relaxed mb-9">
          O teu santuario persoal de videoxogos. Rexistra as túas partidas, anota estratexias no teu caderno e garda as túas memorias gamer para sempre.
        </p>

        {/* Hero Quick Search Bar */}
        <form
          action="/search"
          method="GET"
          className="w-full max-w-2xl flex items-center gap-2 bg-[#0e0e17]/85 border border-white/[0.12] rounded-2xl p-2 backdrop-blur-xl shadow-[0_16px_50px_-12px_rgba(0,0,0,0.85)] mb-8 group focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/25 transition-all"
        >
          <Search
            className="w-4 h-4 text-zinc-500 ml-3 shrink-0 group-focus-within:text-primary-hover transition-colors"
            aria-hidden="true"
          />
          <input
            name="q"
            type="text"
            placeholder="Buscar calquera videoxogo (ex: Chrono Trigger, Zelda, Metroid)..."
            aria-label="Buscar videoxogos"
            className="flex-1 bg-transparent px-2 py-2.5 text-sm text-white placeholder-zinc-500 outline-none font-sans"
          />
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 px-5 py-2.5 text-xs font-medium text-white border border-purple-400/30 shadow-[0_6px_20px_-4px_rgba(168,85,247,0.55)] transition-all font-sans cursor-pointer"
          >
            Buscar
          </button>
        </form>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/library"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 text-white text-sm font-medium border border-purple-400/30 shadow-[0_8px_24px_-4px_rgba(168,85,247,0.5)] transition-all font-sans"
          >
            <Library className="w-4 h-4" aria-hidden="true" />
            <span>A Miña Biblioteca</span>
            {libraryCount > 0 && (
              <span className="ml-0.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-black/25 text-purple-100">
                {libraryCount}
              </span>
            )}
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.11] text-zinc-100 text-sm font-medium border border-white/10 hover:border-white/20 backdrop-blur-md transition-all font-sans"
          >
            <Compass className="w-4 h-4 text-primary-hover" aria-hidden="true" />
            <span>Explorar Xogos</span>
          </Link>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white text-sm font-medium border border-white/[0.08] transition-all font-sans"
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
            <span>Axustes</span>
          </Link>
        </div>
      </section>

      {/* User's Recent Games or Suggested Games */}
      <section className="w-full max-w-5xl mb-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary-hover">
              <Gamepad2 className="w-4 h-4" aria-hidden="true" />
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
              {recentEntries.length > 0 ? "As túas partidas recentes" : "Descubre xogos en Ludio"}
            </h2>
          </div>
          <Link
            href={recentEntries.length > 0 ? "/library" : "/search"}
            className="inline-flex items-center gap-1 text-xs font-mono text-primary-hover hover:text-white transition-colors"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {recentEntries.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {recentEntries.map((entry) => {
              const statusKey = entry.playthroughs[0]?.status
              const statusMeta = statusKey ? statusStyles[statusKey] : null
              return (
                <GlassPanel
                  key={entry.game.id}
                  interactive
                  className="p-2.5 flex flex-col justify-between group"
                >
                  <Link href={`/games/${entry.game.id}`} className="block">
                    <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#0c0c14] relative mb-3 ring-1 ring-white/[0.06]">
                      {entry.game.coverUrl ? (
                        <>
                          <Image
                            src={entry.game.coverUrl}
                            alt={entry.game.title}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                          <div
                            aria-hidden="true"
                            className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"
                          />
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-950/90 via-[#1b1030] to-[#0c0c16] p-3 text-center">
                          <Gamepad2 className="w-6 h-6 text-primary-hover/60" aria-hidden="true" />
                          <span className="text-xs text-purple-100/90 line-clamp-3">
                            {entry.game.title}
                          </span>
                        </div>
                      )}

                      {statusMeta && (
                        <div
                          className={`absolute top-2 left-2 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono border flex items-center gap-1.5 ${statusMeta.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                          <span>{statusMeta.label}</span>
                        </div>
                      )}

                      {entry.game.firstReleaseDate && (
                        <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[10px] font-mono text-zinc-200 border border-white/10">
                          {entry.game.firstReleaseDate.getFullYear()}
                        </div>
                      )}

                      {entry.game.igdbRating !== null && (
                        <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[10px] font-mono text-amber-300 border border-amber-400/20 flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                          <span>{entry.game.igdbRating}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-xs font-medium text-zinc-100 line-clamp-1 group-hover:text-primary-hover transition-colors px-0.5">
                      {entry.game.title}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/[0.06] text-[11px] font-mono px-0.5">
                    <Link
                      href={`/games/${entry.game.id}/canvas`}
                      className="inline-flex items-center gap-1 text-primary-hover hover:text-white transition-colors"
                    >
                      <Palette className="w-3 h-3" aria-hidden="true" />
                      <span>Canvas</span>
                    </Link>
                    <Link
                      href={`/games/${entry.game.id}/journal`}
                      className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                    >
                      <BookOpen className="w-3 h-3" aria-hidden="true" />
                      <span>Diario</span>
                    </Link>
                  </div>
                </GlassPanel>
              )
            })}
          </div>
        ) : suggestedGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {suggestedGames.map((game) => (
              <Link key={game.id} href={`/games/${game.id}`} className="block group">
                <GlassPanel interactive className="p-2.5 flex flex-col h-full">
                  <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#0c0c14] relative mb-3 ring-1 ring-white/[0.06]">
                    {game.coverUrl ? (
                      <Image
                        src={game.coverUrl}
                        alt={game.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-950/90 via-[#1b1030] to-[#0c0c16] p-3 text-center">
                        <Gamepad2 className="w-6 h-6 text-primary-hover/60" aria-hidden="true" />
                        <span className="text-xs text-purple-100/90 line-clamp-3">{game.title}</span>
                      </div>
                    )}
                    {game.firstReleaseDate && (
                      <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[10px] font-mono text-zinc-200 border border-white/10">
                        {game.firstReleaseDate.getFullYear()}
                      </div>
                    )}
                    {game.igdbRating !== null && (
                      <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[10px] font-mono text-amber-300 border border-amber-400/20 flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                        <span>{game.igdbRating}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xs font-medium text-zinc-100 line-clamp-2 group-hover:text-primary-hover transition-colors px-0.5">
                    {game.title}
                  </h3>
                </GlassPanel>
              </Link>
            ))}
          </div>
        ) : (
          <GlassPanel className="p-10 text-center flex flex-col items-center justify-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary-hover mb-1">
              <Gamepad2 className="w-6 h-6" aria-hidden="true" />
            </span>
            <p className="text-sm text-zinc-200 font-sans max-w-md">
              Aínda non tes xogos na túa biblioteca. Comeza buscando o teu xogo favorito!
            </p>
            <Link
              href="/search"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium px-5 py-2.5 rounded-xl bg-gradient-to-b from-purple-500 to-purple-700 text-white hover:from-purple-400 hover:to-purple-600 transition-all shadow-[0_6px_20px_-4px_rgba(168,85,247,0.5)]"
            >
              <span>Buscar Xogos</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </GlassPanel>
        )}
      </section>

      {/* Features Bento Grid */}
      <section className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
        <GlassPanel interactive className="p-6 flex flex-col gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300">
            <Library className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-display font-semibold text-white tracking-tight">
            Biblioteca Intelixente
          </h3>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            Filtra en tempo real por Xogando, Completados, Desexados ou en Pausa. Valora do 1 ao 5 con estrelas e garda a plataforma e economía exacta de cada partida.
          </p>
        </GlassPanel>

        <GlassPanel interactive className="p-6 flex flex-col gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
            <Palette className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-display font-semibold text-white tracking-tight">
            Caderno Canvas & Capturas
          </h3>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            Un lenzo libre con formato Markdown para tomar apuntamentos de estratexia, códigos, listas de misións e subir capturas locais de pantalla.
          </p>
        </GlassPanel>

        <GlassPanel interactive className="p-6 flex flex-col gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <BookOpen className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-display font-semibold text-white tracking-tight">
            Diario de Crónicas
          </h3>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            Inmortaliza as túas sesións de xogo con marcas temporais automáticas. Escribe as túas sensacións tras derrotar un xefe difícil ou rematar unha historia.
          </p>
        </GlassPanel>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-5xl py-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 font-mono gap-4">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-3.5 h-3.5 text-primary-hover" aria-hidden="true" />
          <span>LUDIO © 2026 — O teu santuario gamer</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/library" className="hover:text-zinc-200 transition-colors">
            Biblioteca
          </Link>
          <Link href="/search" className="hover:text-zinc-200 transition-colors">
            Buscar
          </Link>
          <Link href="/dashboard" className="hover:text-zinc-200 transition-colors">
            Dashboard
          </Link>
          <Link href="/settings" className="hover:text-zinc-200 transition-colors">
            Axustes
          </Link>
        </div>
      </footer>
    </div>
  )
}
