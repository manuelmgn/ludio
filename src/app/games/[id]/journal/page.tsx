import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Palette,
  BookOpen,
  Star,
  ScrollText,
  Camera,
  ArrowRight,
  Gamepad2,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { JournalEditor } from "@/components/journal/JournalEditor"

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
      <div className="flex flex-1 items-center justify-center p-8">
        <GlassPanel className="text-center max-w-md flex flex-col items-center gap-4">
          <p className="text-zinc-200 font-sans text-sm">
            Debes iniciar sesión para acceder ao diario.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-b from-purple-500 to-purple-700 text-white text-xs font-medium font-sans"
          >
            <span>Iniciar sesión</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
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
      <div className="flex flex-1 items-center justify-center p-8">
        <GlassPanel className="text-center max-w-md p-8 flex flex-col items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary-hover">
            <Gamepad2 className="w-6 h-6" aria-hidden="true" />
          </span>
          <p className="text-white font-display font-semibold text-base">
            Non tes este xogo na túa biblioteca.
          </p>
          <p className="text-zinc-400 text-xs font-sans leading-relaxed">
            Engádeo primeiro á túa colección para poder escribir crónicas de partida.
          </p>
          <Link
            href={`/games/${id}`}
            className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-b from-purple-500 to-purple-700 text-white text-xs font-medium font-sans"
          >
            <span>Ir á ficha do xogo</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </GlassPanel>
      </div>
    )
  }

  const journal = libraryEntry.journalEntry

  return (
    <div className="flex flex-1 flex-col items-center px-4 sm:px-8 py-6 sm:py-8">
      <div className="w-full max-w-4xl flex flex-col">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08] flex-wrap gap-3">
          <Link
            href={`/games/${id}`}
            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-xs sm:text-sm font-sans"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>
              Volver ao xogo: <strong className="text-zinc-200">{game.title}</strong>
            </span>
          </Link>

          <Link
            href={`/games/${id}/canvas`}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-purple-200 border border-primary/30 transition-colors"
          >
            <Palette className="w-3.5 h-3.5 text-primary-hover" aria-hidden="true" />
            <span>Abrir Canvas</span>
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary-hover">
            <BookOpen className="w-5 h-5" aria-hidden="true" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Diario de Crónicas: {game.title}
          </h1>
          {game.firstReleaseDate && (
            <span className="text-xs font-mono text-zinc-300 bg-white/[0.05] border border-white/10 px-2.5 py-0.5 rounded-full">
              {game.firstReleaseDate.getFullYear()}
            </span>
          )}
          {game.igdbRating !== null && (
            <span className="inline-flex items-center gap-1 text-xs font-mono text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span>{game.igdbRating}</span>
            </span>
          )}
        </div>

        <JournalEditor libraryEntryId={libraryEntry.id} />

        {journal && (journal.content || journal.images.length > 0) ? (
          <GlassPanel className="w-full flex flex-col gap-6">
            <h3 className="text-lg font-display font-semibold text-white border-b border-white/[0.08] pb-4 flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-primary-hover" aria-hidden="true" />
              <span>As túas Entradas</span>
            </h3>

            {journal.content && (
              <div className="whitespace-pre-wrap font-sans text-zinc-200 leading-relaxed text-sm bg-[#0b0b12]/70 p-5 rounded-xl border border-white/[0.07]">
                {journal.content}
              </div>
            )}

            {journal.images.length > 0 && (
              <div className="mt-2">
                <h4 className="text-base font-display font-semibold text-white mb-4 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-primary-hover" aria-hidden="true" />
                  <span>Capturas gardadas ({journal.images.length})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {journal.images.map((image) => (
                    <div
                      key={image.id}
                      className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group bg-[#0c0c14]"
                    >
                      <Image
                        src={image.localUrl}
                        alt="Captura do diario"
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] text-zinc-200 font-mono border border-white/15">
                        {image.privacyLevel === "PRIVATE"
                          ? "Privado"
                          : image.privacyLevel === "FOLLOWERS"
                          ? "Seguidores"
                          : "Público"}
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
