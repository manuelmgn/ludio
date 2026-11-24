import { prisma } from "@/lib/prisma"
import { requireAuthenticatedUser } from "@/lib/auth-user"
import { LibraryFilter, type LibraryEntryWithDetails } from "./LibraryFilter"

export const dynamic = "force-dynamic"

export default async function LibraryPage() {
  const user = await requireAuthenticatedUser()

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
          includedInPlan: true,
          plan: {
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
