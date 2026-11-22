"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import type { PlaythroughStatus } from "@generated/prisma/enums"
import { revalidatePath } from "next/cache"

export interface ActionResponse {
  success: boolean
  error?: string
}

export interface AddGameData {
  status: "WISHED" | PlaythroughStatus
  platform: string
  startDate?: string
  endDate?: string
  rating?: number
  publicReview?: string
}

async function getAuthenticatedOrDemoUser() {
  const session = await auth()
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
    if (user) return user
  }

  let user = await prisma.user.findFirst()
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "admin@ludio.app",
        username: "admin",
        passwordHash: "dummy_hash",
      },
    })
  }
  return user
}

export async function addGameToLibrary(gameId: string, data: AddGameData): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedOrDemoUser()

    // 1. Find or create the LibraryEntry for this user and game
    let libraryEntry = await prisma.libraryEntry.findUnique({
      where: {
        userId_gameId: {
          userId: user.id,
          gameId,
        },
      },
    })

    if (!libraryEntry) {
      libraryEntry = await prisma.libraryEntry.create({
        data: {
          userId: user.id,
          gameId,
          rating: data.rating,
          publicReview: data.publicReview,
        },
      })
    } else if (data.rating !== undefined || data.publicReview !== undefined) {
      libraryEntry = await prisma.libraryEntry.update({
        where: { id: libraryEntry.id },
        data: {
          rating: data.rating !== undefined ? data.rating : libraryEntry.rating,
          publicReview: data.publicReview !== undefined ? data.publicReview : libraryEntry.publicReview,
        },
      })
    }

    // 2. Create the Playthrough only if status is NOT "WISHED"
    if (data.status !== "WISHED") {
      await prisma.playthrough.create({
        data: {
          libraryEntryId: libraryEntry.id,
          status: data.status,
          platform: data.platform || "PC",
          startDate: data.startDate || null,
          endDate: data.endDate || null,
        },
      })
    }

    revalidatePath("/library")
    revalidatePath(`/games/${gameId}`)
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("[addGameToLibrary] Error:", error)
    return { success: false, error: "Non se puido engadir á biblioteca. Téntao de novo." }
  }
}
