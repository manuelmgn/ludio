import { prisma } from "@/lib/prisma"
import { LibraryFilter, type LibraryEntryWithDetails } from "./LibraryFilter"

export default async function LibraryPage() {
  // TODO: Use real authenticated user id
  const user = await prisma.user.findFirst()
  let entries: LibraryEntryWithDetails[] = []

  if (user) {
    entries = await prisma.libraryEntry.findMany({
      where: { userId: user.id },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            coverUrl: true
          }
        },
        playthroughs: {
          select: { status: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-8 relative">
      {/* Background decoration */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-1/3 right-1/4 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-[140px] -z-10" />

      <h1 className="text-4xl font-pixel text-white mb-8 tracking-wider mt-8">
        Mi Biblioteca
      </h1>

      <div className="w-full max-w-4xl">
        <LibraryFilter entries={entries} />
      </div>
    </div>
  )
}
