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
        passwordHash: "dummy_hash"
      }
    })
  }

  const entries: LibraryEntryWithDetails[] = await prisma.libraryEntry.findMany({
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
        select: { 
          status: true,
          platform: true,
          purchasePrice: true,
          salePrice: true,
        },
        orderBy: { updatedAt: "desc" }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  return (
    <div className="flex min-h-screen flex-col items-center p-4 sm:p-8 relative">
      {/* Background decoration */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-1/3 right-1/4 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-[140px] -z-10" />

      <div className="w-full max-w-5xl mt-6">
        <LibraryFilter entries={entries} />
      </div>
    </div>
  )
}
