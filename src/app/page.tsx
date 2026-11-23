import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { GlassPanel } from "@/components/ui/GlassPanel"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const session = await auth()
  
  // Find current user or fallback user
  let user = null
  if (session?.user?.email) {
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
  }
  if (!user) {
    user = await prisma.user.findFirst()
  }

  // Get user's library entries count and recently updated entries
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

  // If no user entries yet, show some games from the DB as suggestions
  const suggestedGames = recentEntries.length === 0
    ? await prisma.game.findMany({
        take: 4,
        orderBy: { createdAt: "desc" },
      })
    : []

  return (
    <div className="flex min-h-[90vh] flex-col items-center justify-between px-4 sm:px-8 py-8 relative overflow-hidden">
      {/* Glowing backdrop orbs */}
      <div className="fixed top-12 left-1/3 w-[550px] h-[550px] bg-primary/25 rounded-full blur-[140px] -z-10 animate-pulse pointer-events-none" />
      <div className="fixed bottom-10 right-1/4 w-[450px] h-[450px] bg-blue-900/20 rounded-full blur-[130px] -z-10 pointer-events-none" />

      {/* Hero Section */}
      <div className="w-full max-w-5xl flex flex-col items-center text-center mt-6 mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span className="text-xs font-mono uppercase tracking-widest text-purple-300">
            {totalGamesCount > 0 ? `${totalGamesCount} Xogos na base de datos` : "Diario & Colección Gamer"}
          </span>
        </div>

        <h1 className="font-pixel text-6xl sm:text-7xl md:text-8xl text-white tracking-widest leading-none drop-shadow-[0_0_35px_rgba(157,0,255,0.6)] mb-6">
          LUDIO
        </h1>

        <p className="max-w-2xl text-lg sm:text-xl text-zinc-300 font-sans leading-relaxed mb-8">
          O teu santuario persoal de videoxogos. Rexistra as túas partidas, anota estratexias no teu caderno e garda as túas memorias gamer para sempre.
        </p>

        {/* Hero Quick Search Bar */}
        <form
          action="/search"
          method="GET"
          className="w-full max-w-xl flex items-center gap-2 bg-black/60 border border-white/15 rounded-2xl p-2 backdrop-blur-xl shadow-2xl mb-8 group focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all"
        >
          <span className="text-zinc-500 pl-3">🔍</span>
          <input
            name="q"
            type="text"
            placeholder="Buscar calquera videoxogo (ex: Chrono Trigger, Zelda, Metroid)..."
            className="flex-1 bg-transparent px-2 py-2 text-sm text-white placeholder-zinc-500 outline-none font-sans"
          />
          <button
            type="submit"
            className="rounded-xl bg-primary px-5 py-2.5 text-xs font-medium text-white hover:bg-primary-hover shadow-[0_0_15px_rgba(157,0,255,0.4)] transition-all font-sans"
          >
            Buscar
          </button>
        </form>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/library"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-medium shadow-[0_0_20px_rgba(157,0,255,0.35)] transition-all font-sans"
          >
            <span>📚</span>
            <span>A Miña Biblioteca {libraryCount > 0 ? `(${libraryCount})` : ""}</span>
          </Link>
          <Link
            href="/search"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 text-sm font-medium border border-white/10 transition-all font-sans"
          >
            <span>🎮</span>
            <span>Explorar Xogos</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-sm font-medium border border-white/10 transition-all font-sans"
          >
            <span>⚙️</span>
            <span>Axustes</span>
          </Link>
        </div>
      </div>

      {/* User's Recent Games or Suggested Games */}
      <div className="w-full max-w-5xl mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-pixel text-white tracking-wider flex items-center gap-2">
            <span>{recentEntries.length > 0 ? "🕹️ As túas partidas recentes" : "🌟 Descubre xogos en Ludio"}</span>
          </h2>
          <Link
            href={recentEntries.length > 0 ? "/library" : "/search"}
            className="text-xs font-mono text-primary hover:underline"
          >
            Ver todos →
          </Link>
        </div>

        {recentEntries.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recentEntries.map((entry) => (
              <GlassPanel
                key={entry.game.id}
                className="p-3 flex flex-col justify-between group hover:border-primary/40 transition-all"
              >
                <Link href={`/games/${entry.game.id}`} className="block">
                  <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-zinc-900/60 relative mb-3">
                    {entry.game.coverUrl ? (
                      <Image
                        src={entry.game.coverUrl}
                        alt={entry.game.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#3c006b] p-2 text-center text-xs text-purple-200">
                        {entry.game.title}
                      </div>
                    )}
                    {entry.playthroughs[0]?.status && (
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300 border border-white/10">
                        {entry.playthroughs[0].status === "PLAYING" ? "Xogando" : entry.playthroughs[0].status === "COMPLETED" ? "Completado" : entry.playthroughs[0].status}
                      </div>
                    )}
                    {entry.game.firstReleaseDate && (
                      <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-300 border border-white/10">
                        {entry.game.firstReleaseDate.getFullYear()}
                      </div>
                    )}
                    {entry.game.igdbRating !== null && (
                      <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-400 border border-white/10">
                        ⭐ {entry.game.igdbRating}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xs font-medium text-white line-clamp-1 hover:text-primary transition-colors">
                    {entry.game.title}
                  </h3>
                </Link>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-[11px] font-mono">
                  <Link
                    href={`/games/${entry.game.id}/canvas`}
                    className="text-primary hover:underline"
                  >
                    🎨 Canvas
                  </Link>
                  <Link
                    href={`/games/${entry.game.id}/journal`}
                    className="text-zinc-400 hover:text-white"
                  >
                    📖 Diario
                  </Link>
                </div>
              </GlassPanel>
            ))}
          </div>
        ) : suggestedGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {suggestedGames.map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className="block group"
              >
                <GlassPanel className="p-3 flex flex-col group-hover:border-primary/40 transition-all h-full">
                  <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-zinc-900/60 relative mb-3">
                    {game.coverUrl ? (
                      <Image
                        src={game.coverUrl}
                        alt={game.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#3c006b] p-2 text-center text-xs text-purple-200">
                        {game.title}
                      </div>
                    )}
                    {game.firstReleaseDate && (
                      <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-300 border border-white/10">
                        {game.firstReleaseDate.getFullYear()}
                      </div>
                    )}
                    {game.igdbRating !== null && (
                      <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-400 border border-white/10">
                        ⭐ {game.igdbRating}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xs font-medium text-white line-clamp-2 group-hover:text-primary transition-colors">
                    {game.title}
                  </h3>
                </GlassPanel>
              </Link>
            ))}
          </div>
        ) : (
          <GlassPanel className="p-8 text-center flex flex-col items-center justify-center">
            <span className="text-4xl mb-3">🎮</span>
            <p className="text-sm text-zinc-300 font-sans mb-4">
              Aínda non tes xogos na túa biblioteca. Comeza buscando o teu xogo favorito!
            </p>
            <Link
              href="/search"
              className="text-xs font-medium px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
            >
              Buscar Xogos →
            </Link>
          </GlassPanel>
        )}
      </div>

      {/* Features Grid */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <GlassPanel className="p-6 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-xl">
            📚
          </div>
          <h3 className="text-lg font-pixel text-white tracking-wider">
            Biblioteca Intelixente
          </h3>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            Filtra en tempo real por Xogando, Completados, Desexados ou en Pausa. Valora do 1 ao 5 con estrelas e garda a plataforma exacta na que xogas.
          </p>
        </GlassPanel>

        <GlassPanel className="p-6 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-xl">
            🎨
          </div>
          <h3 className="text-lg font-pixel text-white tracking-wider">
            Caderno Canvas & Capturas
          </h3>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            Un lenzo libre para tomar apuntamentos de estratexia, códigos de portas, recordatorios de misións secundarias e subir capturas locais de pantalla.
          </p>
        </GlassPanel>

        <GlassPanel className="p-6 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-xl">
            📖
          </div>
          <h3 className="text-lg font-pixel text-white tracking-wider">
            Diario de Crónicas
          </h3>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            Inmortaliza as túas sesións de xogo con marcas temporais automáticas. Escribe as túas sensacións tras derrotar un xefe difícil ou rematar unha historia.
          </p>
        </GlassPanel>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-5xl py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 font-mono gap-4">
        <div>
          <span>LUDIO © 2026 — O teu santuario gamer</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/library" className="hover:text-zinc-300 transition-colors">
            Biblioteca
          </Link>
          <Link href="/search" className="hover:text-zinc-300 transition-colors">
            Buscar
          </Link>
          <Link href="/settings" className="hover:text-zinc-300 transition-colors">
            Axustes
          </Link>
        </div>
      </footer>
    </div>
  )
}
