import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AddGameForm } from "@/components/library/AddGameForm"
import { GlassPanel } from "@/components/ui/GlassPanel"
import Image from "next/image"
import Link from "next/link"

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

  return (
    <div className="flex min-h-screen flex-col items-center p-8 relative">
      {/* Background decoration */}
      <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-1/3 left-1/4 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-[140px] -z-10" />

      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 mt-8">
        {/* Left Column: Game Cover */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <GlassPanel className="p-4 flex flex-col overflow-hidden">
            <div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-zinc-900/50 relative">
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
            <h1 className="text-xl font-bold text-white font-sans text-center leading-tight mt-4 mb-2">
              {game.title}
            </h1>
          </GlassPanel>

          <Link
            href={`/games/${id}/journal`}
            className="text-center text-primary/80 hover:text-primary text-sm font-sans transition-colors underline underline-offset-4"
          >
            Abrir Diario de este juego →
          </Link>
        </div>

        {/* Right Column: Add to Library Form */}
        <div className="w-full md:w-2/3">
          <AddGameForm gameId={game.id} />
        </div>
      </div>
    </div>
  )
}
