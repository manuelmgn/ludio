import { prisma } from "@/lib/prisma"
import { requireAuthenticatedUser } from "@/lib/auth-user"
import { PageContainer } from "@/components/ui/PageShell"
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
    <PageContainer>
      <LibraryFilter entries={entries} />
    </PageContainer>
  )
}
