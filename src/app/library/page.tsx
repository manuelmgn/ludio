import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { LibraryFilter, type LibraryEntryWithDetails } from "./LibraryFilter"

export const dynamic = "force-dynamic"

export default async function LibraryPage() {
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
    user = await prisma.user.create({
      data: {
        email: "admin@ludio.app",
        username: "admin",
        passwordHash: "dummy_hash",
      },
    })
  }

  const entries: LibraryEntryWithDetails[] = await prisma.libraryEntry.findMany({
    where: { userId: user.id },
    include: {
      game: {
        select: {
          id: true,
          title: true,
          coverUrl: true,
          firstReleaseDate: true,
          igdbRating: true,
        },
      },
      playthroughs: {
        select: {
          status: true,
          platform: true,
          purchasePrice: true,
          salePrice: true,
          purchaseStore: {
            select: { name: true },
          },
          saleStore: {
            select: { name: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="flex flex-1 flex-col items-center px-4 sm:px-8 py-6 sm:py-8">
      <div className="w-full max-w-6xl">
        <LibraryFilter entries={entries} />
      </div>
    </div>
  )
}
