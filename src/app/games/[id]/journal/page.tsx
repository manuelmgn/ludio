import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { GlassPanel } from "@/components/ui/GlassPanel"
import { JournalEditor } from "@/components/journal/JournalEditor"
import Image from "next/image"
import Link from "next/link"

interface JournalPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function JournalPage({ params }: JournalPageProps) {
  const { id } = await params
  
  const session = await auth()
  if (!session?.user?.email) {
    return <div className="p-8 text-white">Debes iniciar sesión para ver el diario.</div>
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) return notFound()

  const game = await prisma.game.findUnique({
    where: { id },
  })

  if (!game) return notFound()

  const libraryEntry = await prisma.libraryEntry.findUnique({
    where: {
      userId_gameId: {
        userId: user.id,
        gameId: id,
      }
    },
    include: {
      journalEntry: {
        include: {
          images: {
            orderBy: { createdAt: "desc" }
          }
        }
      }
    }
  })

  if (!libraryEntry) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 relative">
        <GlassPanel className="text-center max-w-md">
          <p className="text-white font-sans text-lg mb-4">No tienes este juego en tu biblioteca.</p>
          <Link href={`/games/${id}`} className="text-primary hover:underline">
            Ve a la página del juego para añadirlo
          </Link>
        </GlassPanel>
      </div>
    )
  }

  const journal = libraryEntry.journalEntry

  return (
    <div className="flex min-h-screen flex-col items-center p-8 relative">
      {/* Background decoration */}
      <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-1/3 left-1/4 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-[140px] -z-10" />

      <div className="w-full max-w-4xl flex flex-col mt-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/games/${id}`} className="text-white/50 hover:text-white transition-colors">
            &larr; Volver al juego
          </Link>
          <h1 className="text-3xl font-pixel text-white tracking-wider">
            Diario de: {game.title}
          </h1>
        </div>

        <JournalEditor libraryEntryId={libraryEntry.id} />

        {journal ? (
          <GlassPanel className="w-full flex flex-col gap-6">
            <h3 className="text-xl font-pixel text-white border-b border-white/10 pb-4">Tus Entradas</h3>
            
            <div className="whitespace-pre-wrap font-sans text-zinc-300 leading-relaxed">
              {journal.content || "No hay texto en tu diario."}
            </div>

            {journal.images.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-pixel text-white mb-4">Capturas guardadas</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {journal.images.map(image => (
                    <div key={image.id} className="relative aspect-video rounded-lg overflow-hidden border border-white/10 group">
                      <Image
                        src={image.localUrl}
                        alt="Captura del diario"
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs text-white/80 font-mono">
                        {image.privacyLevel}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassPanel>
        ) : (
          <div className="text-center text-white/40 py-12 font-sans text-lg">
            Aún no has escrito nada en el diario para este juego.
          </div>
        )}
      </div>
    </div>
  )
}
