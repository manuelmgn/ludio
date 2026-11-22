import { auth, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import { DashboardClient } from "./DashboardClient"

export const dynamic = "force-dynamic"

export interface UserStats {
  totalGames: number
  playingCount: number
  completedCount: number
  onHoldCount: number
  abandonedCount: number
  wishlistCount: number
  averageRating: number | null
  ratedGamesCount: number
  recentEntries: {
    id: string
    rating?: number | null
    updatedAt: Date
    game: {
      id: string
      title: string
      coverUrl: string | null
    }
    latestStatus?: string | null
    platform?: string | null
  }[]
}

export default async function DashboardPage() {
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

  let stats: UserStats = {
    totalGames: 0,
    playingCount: 0,
    completedCount: 0,
    onHoldCount: 0,
    abandonedCount: 0,
    wishlistCount: 0,
    averageRating: null,
    ratedGamesCount: 0,
    recentEntries: [],
  }

  if (user) {
    const entries = await prisma.libraryEntry.findMany({
      where: { userId: user.id },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            coverUrl: true,
          },
        },
        playthroughs: {
          orderBy: { updatedAt: "desc" },
          select: {
            status: true,
            platform: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    const totalGames = entries.length
    let playingCount = 0
    let completedCount = 0
    let onHoldCount = 0
    let abandonedCount = 0
    let wishlistCount = 0
    let ratingSum = 0
    let ratedGamesCount = 0

    for (const entry of entries) {
      if (entry.rating) {
        ratingSum += entry.rating
        ratedGamesCount++
      }

      if (entry.playthroughs.length === 0) {
        wishlistCount++
      } else {
        const latest = entry.playthroughs[0]
        if (latest.status === "PLAYING") playingCount++
        else if (latest.status === "COMPLETED") completedCount++
        else if (latest.status === "ON_HOLD") onHoldCount++
        else if (latest.status === "ABANDONED") abandonedCount++
      }
    }

    const averageRating = ratedGamesCount > 0 ? Number((ratingSum / ratedGamesCount).toFixed(1)) : null

    const recentEntries = entries.slice(0, 5).map((e) => ({
      id: e.id,
      rating: e.rating,
      updatedAt: e.updatedAt,
      game: e.game,
      latestStatus: e.playthroughs[0]?.status || (e.playthroughs.length === 0 ? "WISH" : null),
      platform: e.playthroughs[0]?.platform || null,
    }))

    stats = {
      totalGames,
      playingCount,
      completedCount,
      onHoldCount,
      abandonedCount,
      wishlistCount,
      averageRating,
      ratedGamesCount,
      recentEntries,
    }
  }

  const handleSignOut = async () => {
    "use server"
    await signOut({ redirectTo: "/login" })
  }

  return (
    <DashboardClient
      user={session?.user}
      stats={stats}
      signOutAction={handleSignOut}
    />
  )
}
