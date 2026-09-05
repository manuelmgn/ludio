"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import type { PlaythroughStatus } from "../../../generated/prisma/client"

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

export async function addGameToLibrary(gameId: string, data: AddGameData): Promise<ActionResponse> {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return { success: false, error: "Debes iniciar sesión para añadir partidas." }
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return { success: false, error: "Usuario no encontrado." }
    }

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
    } else if (data.rating || data.publicReview) {
      libraryEntry = await prisma.libraryEntry.update({
        where: { id: libraryEntry.id },
        data: {
          rating: data.rating ?? libraryEntry.rating,
          publicReview: data.publicReview ?? libraryEntry.publicReview,
        }
      })
    }

    // 2. Create the Playthrough only if status is NOT "WISHED"
    if (data.status !== "WISHED") {
      await prisma.playthrough.create({
        data: {
          libraryEntryId: libraryEntry.id,
          status: data.status,
          platform: data.platform,
          startDate: data.startDate || null,
          endDate: data.endDate || null,
        },
      })
    }

    return { success: true }
  } catch (error) {
    console.error("[addGameToLibrary] Error:", error)
    return { success: false, error: "No se pudo añadir a la biblioteca. Inténtalo de nuevo." }
  }
}
