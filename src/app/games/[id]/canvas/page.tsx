import { prisma } from "@/lib/prisma"
import { CanvasEditor } from "./CanvasEditor"

export const dynamic = "force-dynamic"

interface CanvasPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CanvasPage({ params }: CanvasPageProps) {
  const { id: gameId } = await params

  // TODO: Obtener el usuario real
  const user = await prisma.user.findFirst()
  if (!user) {
    return <div className="p-8 text-white">Debes iniciar sesión.</div>
  }

  // Buscar el LibraryEntry para este usuario y este juego
  const libraryEntry = await prisma.libraryEntry.findUnique({
    where: {
      userId_gameId: {
        userId: user.id,
        gameId: gameId
      }
    },
    include: {
      game: true,
      gameCanvas: {
        include: {
          images: {
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  })

  // Si no tiene el juego en la biblioteca, no puede tener un Canvas
  if (!libraryEntry) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-sans text-white text-center">
          Debes añadir el juego a tu biblioteca primero para acceder a su Canvas.
        </h1>
      </div>
    )
  }

  const canvas = libraryEntry.gameCanvas
  const initialContent = canvas?.content || ""
  const images = canvas?.images || []

  return (
    <div className="flex min-h-screen flex-col items-center p-8 relative">
      <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-1/3 left-1/4 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-[140px] -z-10" />

      <h1 className="text-4xl font-pixel text-white mb-2 tracking-wider mt-8">
        Canvas: {libraryEntry.game.title}
      </h1>
      <p className="text-gray-400 font-sans mb-8">
        Espacio libre para tus notas y capturas locales.
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
