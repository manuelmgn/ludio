import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { CanvasEditor } from "./CanvasEditor"

export const dynamic = "force-dynamic"

interface CanvasPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CanvasPage({ params }: CanvasPageProps) {
  const { id: gameId } = await params

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
            Debes iniciar sesión para acceder ao Canvas.
          </p>
          <Link href="/login" className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-sans">
            Iniciar sesión →
          </Link>
        </GlassPanel>
      </div>
    )
  }

  const game = await prisma.game.findUnique({
    where: { id: gameId },
  })

  if (!game) return notFound()

  // Buscar o LibraryEntry para este usuario e este xogo
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
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-8 relative">
        <GlassPanel className="text-center max-w-md p-8 flex flex-col items-center gap-3">
          <span className="text-3xl">🎨</span>
          <p className="text-white font-sans text-base">
            Non tes este xogo na túa biblioteca.
          </p>
          <p className="text-zinc-400 text-xs font-sans">
            Debes engadir o xogo primeiro para poder acceder ao seu caderno Canvas de notas e capturas.
          </p>
          <Link
            href={`/games/${gameId}`}
            className="mt-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-medium font-sans transition-colors"
          >
            Ir á ficha do xogo →
          </Link>
        </GlassPanel>
      </div>
    )
  }

  const canvas = libraryEntry.gameCanvas
  const initialContent = canvas?.content || ""
  const images = canvas?.images || []

  return (
    <div className="flex min-h-screen flex-col items-center p-4 sm:p-8 relative">
      <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-1/3 left-1/4 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-[140px] -z-10" />

      <h1 className="text-4xl font-pixel text-white mb-2 tracking-wider mt-4">
        Canvas: {libraryEntry.game.title}
      </h1>
      <p className="text-zinc-400 font-sans text-xs mb-8">
        Espazo libre para as túas estratexias, notas e galería de capturas.
      </p>

      <CanvasEditor 
        libraryEntryId={libraryEntry.id}
        gameId={libraryEntry.gameId}
        gameTitle={libraryEntry.game.title}
        initialContent={initialContent}
        images={images}
      />
    </div>
  )
}
