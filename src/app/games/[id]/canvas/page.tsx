import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BookOpen, Palette, Star, ArrowRight } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { requireAuthenticatedUser } from "@/lib/auth-user"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { buttonVariants } from "@/components/ui/Button"
import { PageContainer } from "@/components/ui/PageShell"
import { CanvasEditor } from "./CanvasEditor"

export const dynamic = "force-dynamic"

interface CanvasPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CanvasPage({ params }: CanvasPageProps) {
  const { id: gameId } = await params

  const user = await requireAuthenticatedUser()

  const game = await prisma.game.findUnique({
    where: { id: gameId },
  })

  if (!game) return notFound()

  const libraryEntry = await prisma.libraryEntry.findUnique({
    where: {
      userId_gameId: {
        userId: user.id,
        gameId: gameId,
      },
    },
    include: {
      game: true,
      gameCanvas: {
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
            <Palette className="w-6 h-6" aria-hidden="true" />
          </span>
          <p className="text-white font-display font-semibold text-base">
            Non tes este xogo na túa biblioteca.
          </p>
          <p className="text-zinc-400 text-xs font-sans leading-relaxed">
            Debes engadir o xogo primeiro para poder acceder ao seu caderno Canvas de notas e capturas.
          </p>
          <Link
            href={`/games/${gameId}`}
            className={buttonVariants({ variant: "primary", size: "sm", className: "mt-2" })}
          >
            <span>Ir á ficha do xogo</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </GlassPanel>
      </div>
    )
  }

  const canvas = libraryEntry.gameCanvas
  const initialContent = canvas?.content || ""
  const images = canvas?.images || []

  return (
    <PageContainer>
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] flex-wrap gap-3">
        <Link
          href={`/games/${gameId}`}
          transitionTypes={["nav-back"]}
          className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-xs sm:text-sm font-sans"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>
            Volver ao xogo: <strong className="text-zinc-200">{libraryEntry.game.title}</strong>
          </span>
        </Link>

        <Link
          href={`/games/${gameId}/journal`}
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-purple-200 border border-primary/30 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-primary-hover" aria-hidden="true" />
          <span>Abrir Diario</span>
        </Link>
      </div>

      <div className="w-full flex flex-col items-start">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary-hover">
            <Palette className="w-5 h-5" aria-hidden="true" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Canvas: {libraryEntry.game.title}
          </h1>
          {libraryEntry.game.firstReleaseDate && (
            <span className="text-xs font-mono text-zinc-300 bg-white/[0.05] border border-white/10 px-2.5 py-0.5 rounded-full">
              {libraryEntry.game.firstReleaseDate.getFullYear()}
            </span>
          )}
          {libraryEntry.game.igdbRating !== null && (
            <span className="inline-flex items-center gap-1 text-xs font-mono text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span>{libraryEntry.game.igdbRating}</span>
            </span>
          )}
        </div>
        <p className="text-zinc-400 font-sans text-xs sm:text-sm mt-2">
          Espazo libre para as túas estratexias, notas e galería de capturas.
        </p>
      </div>

      <CanvasEditor
        libraryEntryId={libraryEntry.id}
        gameId={libraryEntry.gameId}
        gameTitle={libraryEntry.game.title}
        initialContent={initialContent}
        images={images}
      />
    </PageContainer>
  )
}
