"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import type { PlaythroughStatus } from "@generated/prisma/enums"
import { revalidatePath } from "next/cache"

export interface ActionResponse {
  success: boolean
  error?: string
  playthroughId?: string
}

export interface AddGameData {
  status: "WISHED" | PlaythroughStatus
  platform: string
  startDate?: string
  endDate?: string
  rating?: number
  publicReview?: string
  // Pricing
  purchasePrice?: number
  purchaseStoreId?: string
  purchaseDate?: string
  salePrice?: number
  saleStoreId?: string
  saleDate?: string
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
    let createdPlaythroughId: string | undefined
    if (data.status !== "WISHED") {
      const created = await prisma.playthrough.create({
        data: {
          libraryEntryId: libraryEntry.id,
          status: data.status,
          platform: data.platform || "PC",
          startDate: data.startDate || null,
          endDate: data.endDate || null,
          rating: data.rating ?? null,
          review: data.publicReview?.trim() || null,
          purchasePrice: data.purchasePrice ?? null,
          purchaseStoreId: data.purchaseStoreId || null,
          purchaseDate: data.purchaseDate || null,
          salePrice: data.salePrice ?? null,
          saleStoreId: data.saleStoreId || null,
          saleDate: data.saleDate || null,
        },
      })
      createdPlaythroughId = created.id
    }

    revalidatePath("/library")
    revalidatePath(`/games/${gameId}`)
    revalidatePath("/dashboard")
    revalidatePath("/")

    return { success: true, playthroughId: createdPlaythroughId }
  } catch (error) {
    console.error("[addGameToLibrary] Error:", error)
    return { success: false, error: "Non se puido engadir á biblioteca. Téntao de novo." }
  }
}

export async function removeGameFromLibrary(gameId: string): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedOrDemoUser()

    const libraryEntry = await prisma.libraryEntry.findUnique({
      where: {
        userId_gameId: {
          userId: user.id,
          gameId,
        },
      },
    })

    if (!libraryEntry) {
      return { success: false, error: "O xogo non está na biblioteca." }
    }

    await prisma.libraryEntry.delete({
      where: { id: libraryEntry.id },
    })

    revalidatePath("/library")
    revalidatePath(`/games/${gameId}`)
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("[removeGameFromLibrary] Error:", error)
    return { success: false, error: "Non se puido eliminar da biblioteca." }
  }
}

export async function updateLibraryReview(
  gameId: string,
  rating: number | null,
  publicReview: string | null
): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedOrDemoUser()

    const libraryEntry = await prisma.libraryEntry.findUnique({
      where: {
        userId_gameId: {
          userId: user.id,
          gameId,
        },
      },
    })

    if (!libraryEntry) {
      return { success: false, error: "O xogo non está na biblioteca." }
    }

    await prisma.libraryEntry.update({
      where: { id: libraryEntry.id },
      data: {
        rating,
        publicReview: publicReview?.trim() || null,
      },
    })

    revalidatePath("/library")
    revalidatePath(`/games/${gameId}`)
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("[updateLibraryReview] Error:", error)
    return { success: false, error: "Non se puido actualizar a valoración." }
  }
}

export interface UpdatePlaythroughData {
  status: PlaythroughStatus
  platform: string
  startDate?: string | null
  endDate?: string | null
  rating?: number | null
  review?: string | null
  purchasePrice?: number | null
  purchaseStoreId?: string | null
  purchaseDate?: string | null
  salePrice?: number | null
  saleStoreId?: string | null
  saleDate?: string | null
}

export async function updatePlaythrough(
  playthroughId: string,
  gameId: string,
  data: UpdatePlaythroughData
): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedOrDemoUser()

    const playthrough = await prisma.playthrough.findUnique({
      where: { id: playthroughId },
      include: { libraryEntry: true },
    })

    if (!playthrough || playthrough.libraryEntry.userId !== user.id) {
      return { success: false, error: "Non tes permisos para modificar esta partida." }
    }

    await prisma.playthrough.update({
      where: { id: playthroughId },
      data: {
        status: data.status,
        platform: data.platform,
        startDate: data.startDate !== undefined ? data.startDate : playthrough.startDate,
        endDate: data.endDate !== undefined ? data.endDate : playthrough.endDate,
        rating: data.rating !== undefined ? data.rating : playthrough.rating,
        review: data.review !== undefined ? data.review : playthrough.review,
        purchasePrice: data.purchasePrice !== undefined ? data.purchasePrice : playthrough.purchasePrice,
        purchaseStoreId: data.purchaseStoreId !== undefined ? data.purchaseStoreId : playthrough.purchaseStoreId,
        purchaseDate: data.purchaseDate !== undefined ? data.purchaseDate : playthrough.purchaseDate,
        salePrice: data.salePrice !== undefined ? data.salePrice : playthrough.salePrice,
        saleStoreId: data.saleStoreId !== undefined ? data.saleStoreId : playthrough.saleStoreId,
        saleDate: data.saleDate !== undefined ? data.saleDate : playthrough.saleDate,
      },
    })

    revalidatePath(`/games/${gameId}`)
    revalidatePath(`/games/${gameId}/playthroughs/${playthroughId}`)
    revalidatePath("/library")
    revalidatePath("/dashboard")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("[updatePlaythrough] Error:", error)
    return { success: false, error: "Erro ao actualizar a partida." }
  }
}

export async function updatePlaythroughRating(
  playthroughId: string,
  gameId: string,
  rating: number | null,
  review?: string | null
): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedOrDemoUser()

    const playthrough = await prisma.playthrough.findUnique({
      where: { id: playthroughId },
      include: { libraryEntry: true },
    })

    if (!playthrough || playthrough.libraryEntry.userId !== user.id) {
      return { success: false, error: "Non tes permisos para valorar esta partida." }
    }

    await prisma.playthrough.update({
      where: { id: playthroughId },
      data: {
        rating,
        ...(review !== undefined ? { review: review?.trim() || null } : {}),
      },
    })

    // If the parent libraryEntry has no overall rating yet, sync it cleanly
    if (rating !== null && playthrough.libraryEntry.rating === null) {
      await prisma.libraryEntry.update({
        where: { id: playthrough.libraryEntryId },
        data: { rating },
      })
    }

    revalidatePath(`/games/${gameId}`)
    revalidatePath(`/games/${gameId}/playthroughs/${playthroughId}`)
    revalidatePath("/library")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("[updatePlaythroughRating] Error:", error)
    return { success: false, error: "Non se puido gardar a valoración da partida." }
  }
}

export async function deletePlaythrough(
  playthroughId: string,
  gameId: string
): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedOrDemoUser()

    const playthrough = await prisma.playthrough.findUnique({
      where: { id: playthroughId },
      include: { libraryEntry: true },
    })

    if (!playthrough || playthrough.libraryEntry.userId !== user.id) {
      return { success: false, error: "Non tes permisos para eliminar esta partida." }
    }

    await prisma.playthrough.delete({
      where: { id: playthroughId },
    })

    revalidatePath(`/games/${gameId}`)
    revalidatePath("/library")
    revalidatePath("/dashboard")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("[deletePlaythrough] Error:", error)
    return { success: false, error: "Erro ao eliminar a partida." }
  }
}
