import Link from "next/link"
import {
  Library,
  Compass,
  Palette,
  BookOpen,
  Gamepad2,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { requireAuthenticatedUser } from "@/lib/auth-user"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { GameCard } from "@/components/ui/GameCard"
import { EmptyState } from "@/components/ui/PageShell"
import { buttonVariants } from "@/components/ui/Button"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const user = await requireAuthenticatedUser()

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
    <div className="flex flex-1 flex-col items-center justify-between px-3 sm:px-6 py-6 sm:py-8 relative">
      {/* Hero Section */}
      <section className="w-full max-w-6xl flex flex-col items-center text-center mt-4 sm:mt-8 mb-16 sm:mb-20 relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-7 backdrop-blur-md shadow-[0_0_24px_rgba(168,85,247,0.18)]">
          <Sparkles className="w-3.5 h-3.5 text-primary-hover" aria-hidden="true" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-purple-200">
            {totalGamesCount > 0
              ? `${totalGamesCount} xogos indexados`
              : "Diario & Colección Gamer"}
          </span>
        </div>

        <h1 className="font-pixel text-7xl sm:text-8xl md:text-[7.25rem] tracking-[0.14em] leading-none bg-gradient-to-b from-white via-purple-100 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(168,85,247,0.45)] mb-5 select-none">
          FLUX
        </h1>

        <p className="max-w-2xl text-base sm:text-lg text-zinc-300/90 font-sans leading-relaxed mb-8">
          O teu santuario persoal de videoxogos. Rexistra as túas partidas, anota estratexias no teu caderno e garda as túas memorias gamer para sempre.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/library"
            className={buttonVariants({ variant: "primary", size: "lg" })}
          >
            <Library className="w-4 h-4" aria-hidden="true" />
            <span>Biblioteca</span>
            {libraryCount > 0 && (
              <span className="ml-0.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-black/25 text-purple-100 tabular-nums">
                {libraryCount}
              </span>
            )}
          </Link>
          <Link
            href="/search"
            className={buttonVariants({ variant: "glass", size: "lg" })}
          >
            <Compass className="w-4 h-4 text-primary-hover" aria-hidden="true" />
            <span>Explorar Xogos</span>
          </Link>
        </div>
      </section>

      {/* User's Recent Games or Suggested Games */}
      <section className="w-full max-w-6xl mb-16 sm:mb-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary-hover">
              <Gamepad2 className="w-4 h-4" aria-hidden="true" />
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
              {recentEntries.length > 0 ? "As túas partidas recentes" : "Descubre xogos en Flux"}
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
            {recentEntries.map((entry) => (
              <GameCard
                key={entry.game.id}
                id={entry.game.id}
                title={entry.game.title}
                coverUrl={entry.game.coverUrl}
                firstReleaseDate={entry.game.firstReleaseDate}
                rating={entry.game.igdbRating}
                personalRating={entry.rating}
                status={entry.playthroughs[0]?.status ?? "WISH"}
                footer={
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <Link
                      href={`/games/${entry.game.id}/canvas`}
                      transitionTypes={["nav-forward"]}
                      className="inline-flex items-center gap-1 text-primary-hover hover:text-white transition-colors"
                    >
                      <Palette className="w-3 h-3" aria-hidden="true" />
                      <span>Canvas</span>
                    </Link>
                    <Link
                      href={`/games/${entry.game.id}/journal`}
                      transitionTypes={["nav-forward"]}
                      className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                    >
                      <BookOpen className="w-3 h-3" aria-hidden="true" />
                      <span>Diario</span>
                    </Link>
                  </div>
                }
              />
            ))}
          </div>
        ) : suggestedGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {suggestedGames.map((game) => (
              <GameCard
                key={game.id}
                id={game.id}
                title={game.title}
                coverUrl={game.coverUrl}
                firstReleaseDate={game.firstReleaseDate}
                rating={game.igdbRating}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Gamepad2 className="w-6 h-6" aria-hidden="true" />}
            title="Aínda non tes xogos na túa biblioteca."
            description="Comeza buscando o teu xogo favorito desde a lupa da cabeceira ou explora o catálogo global."
            action={
              <Link
                href="/search"
                className={buttonVariants({ variant: "primary", size: "sm" })}
              >
                <span>Buscar Xogos</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            }
          />
        )}
      </section>

      {/* Features Bento Grid */}
      <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-5 mb-16 sm:mb-20">
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
      <footer className="w-full max-w-6xl py-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 font-mono gap-4">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-3.5 h-3.5 text-primary-hover" aria-hidden="true" />
          <span>FLUX © 2026 — O teu santuario gamer</span>
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
