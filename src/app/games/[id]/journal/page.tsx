import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { JournalEditor } from "@/components/journal/JournalEditor"
import Image from "next/image"
import Link from "next/link"

export const dynamic = "force-dynamic"

interface JournalPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function JournalPage({ params }: JournalPageProps) {
  const { id } = await params
  
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

  if (!user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-8">
        <GlassPanel className="text-center max-w-md">
          <p className="text-white font-sans text-sm mb-4">
            Debes iniciar sesión para acceder ao diario.
          </p>
          <Link href="/login" className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-sans">
            Iniciar sesión →
          </Link>
        </GlassPanel>
      </div>
    )
  }

  const game = await prisma.game.findUnique({
    where: { id },
  })

  if (!game) return notFound()

  const libraryEntry = await prisma.libraryEntry.findUnique({
    where: {
      userId_gameId: {
        userId: user.id,
        gameId: id,
      },
    },
    include: {
      journalEntry: {
        include: {
          images: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  })

  if (!libraryEntry) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-8 relative">
        <GlassPanel className="text-center max-w-md p-8 flex flex-col items-center gap-3">
          <span className="text-3xl">🎮</span>
          <p className="text-white font-sans text-base">Non tes este xogo na túa biblioteca.</p>
          <p className="text-zinc-400 text-xs font-sans">
            Engádeo primeiro á túa colección para poder escribir crónicas de partida.
          </p>
          <Link
            href={`/games/${id}`}
            className="mt-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-medium font-sans transition-colors"
          >
            Ir á ficha do xogo →
          </Link>
        </GlassPanel>
      </div>
    )
  }

  const journal = libraryEntry.journalEntry

  return (
    <div className="flex min-h-screen flex-col items-center p-4 sm:p-8 relative">
      {/* Background decoration */}
      <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-1/3 left-1/4 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-[140px] -z-10" />

      <div className="w-full max-w-4xl flex flex-col mt-4">
        <div className="flex items-center justify-between mb-8">
          <Link
            href={`/games/${id}`}
            className="text-zinc-400 hover:text-white transition-colors text-sm font-sans flex items-center gap-1.5"
          >
            <span>←</span>
            <span>Volver ao xogo: <strong className="text-zinc-200">{game.title}</strong></span>
          </Link>

          <Link
            href={`/games/${id}/canvas`}
            className="text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-primary border border-primary/30 transition-colors"
          >
            🎨 Abrir Canvas
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="text-3xl">📖</span>
          <h1 className="text-3xl font-pixel text-white tracking-wider">
            Diario de Crónicas: {game.title}
          </h1>
          {game.firstReleaseDate && (
            <span className="text-xs font-mono text-zinc-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
              {game.firstReleaseDate.getFullYear()}
            </span>
          )}
          {game.igdbRating !== null && (
            <span className="text-xs font-mono text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
              ⭐ {game.igdbRating}
            </span>
          )}
        </div>

        <JournalEditor libraryEntryId={libraryEntry.id} />

        {journal && (journal.content || journal.images.length > 0) ? (
          <GlassPanel className="w-full flex flex-col gap-6">
            <h3 className="text-xl font-pixel text-white border-b border-white/10 pb-4 flex items-center gap-2">
              <span>📜</span>
              <span>As túas Entradas</span>
            </h3>
            
            {journal.content && (
              <div className="whitespace-pre-wrap font-sans text-zinc-300 leading-relaxed text-sm bg-black/30 p-4 rounded-xl border border-white/5">
                {journal.content}
              </div>
            )}

            {journal.images.length > 0 && (
              <div className="mt-4">
                <h4 className="text-lg font-pixel text-white mb-4 flex items-center gap-2">
                  <span>📷</span>
                  <span>Capturas gardadas ({journal.images.length})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {journal.images.map((image) => (
                    <div
                      key={image.id}
                      className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group bg-zinc-900/60"
                    >
                      <Image
                        src={image.localUrl}
                        alt="Captura do diario"
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-zinc-300 font-mono border border-white/10">
                        {image.privacyLevel === "PRIVATE" ? "Privado" : image.privacyLevel === "FOLLOWERS" ? "Seguidores" : "Público"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassPanel>
        ) : (
          <GlassPanel className="text-center text-zinc-400 py-12 font-sans text-sm">
            Aínda non escribiches ningunha entrada no diario para este xogo.
          </GlassPanel>
        )}
      </div>
    </div>
  )
}
