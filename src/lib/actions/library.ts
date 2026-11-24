"use server"

import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth-user"
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
  // Subscription plan
  includedInPlan?: boolean
  planId?: string
}

function toNullableString(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function toNullableFiniteNumber(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

export async function addGameToLibrary(gameId: string, data: AddGameData): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return { success: false, error: "Debes iniciar sesión." }
    }
    const normalizedReview = toNullableString(data.publicReview)
    const normalizedRating = toNullableFiniteNumber(data.rating)

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
          rating: normalizedRating,
          publicReview: normalizedReview,
        },
      })
    } else {
      // Never overwrite existing overall rating/review when adding another playthrough
      const shouldFillRating = libraryEntry.rating === null && normalizedRating !== null
      const shouldFillReview = !libraryEntry.publicReview && normalizedReview !== null
      if (shouldFillRating || shouldFillReview) {
        libraryEntry = await prisma.libraryEntry.update({
          where: { id: libraryEntry.id },
          data: {
            ...(shouldFillRating ? { rating: normalizedRating } : {}),
            ...(shouldFillReview ? { publicReview: normalizedReview } : {}),
          },
        })
      }
    }

    // 2. Create the Playthrough only if status is NOT "WISHED"
    let createdPlaythroughId: string | undefined
    if (data.status !== "WISHED") {
      const includedInPlan = Boolean(data.includedInPlan)
      const created = await prisma.playthrough.create({
        data: {
          libraryEntryId: libraryEntry.id,
          status: data.status,
          platform: toNullableString(data.platform) || "PC",
          startDate: toNullableString(data.startDate),
          endDate: toNullableString(data.endDate),
          rating: normalizedRating,
          review: normalizedReview,
          purchasePrice: includedInPlan ? null : toNullableFiniteNumber(data.purchasePrice),
          purchaseStoreId: includedInPlan ? null : toNullableString(data.purchaseStoreId),
          purchaseDate: includedInPlan ? null : toNullableString(data.purchaseDate),
          salePrice: includedInPlan ? null : toNullableFiniteNumber(data.salePrice),
          saleStoreId: includedInPlan ? null : toNullableString(data.saleStoreId),
          saleDate: includedInPlan ? null : toNullableString(data.saleDate),
          includedInPlan,
          planId: includedInPlan ? toNullableString(data.planId) : null,
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
    const user = await getAuthenticatedUser()
    if (!user) {
      return { success: false, error: "Debes iniciar sesión." }
    }

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
    const user = await getAuthenticatedUser()
    if (!user) {
      return { success: false, error: "Debes iniciar sesión." }
    }

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
  includedInPlan?: boolean
  planId?: string | null
}

export async function updatePlaythrough(
  playthroughId: string,
  gameId: string,
  data: UpdatePlaythroughData
): Promise<ActionResponse> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return { success: false, error: "Debes iniciar sesión." }
    }

    const playthrough = await prisma.playthrough.findUnique({
      where: { id: playthroughId },
      include: { libraryEntry: true },
    })

    if (!playthrough || playthrough.libraryEntry.userId !== user.id) {
      return { success: false, error: "Non tes permisos para modificar esta partida." }
    }

    const nextIncludedInPlan =
      data.includedInPlan !== undefined ? data.includedInPlan : playthrough.includedInPlan

    await prisma.playthrough.update({
      where: { id: playthroughId },
      data: {
        status: data.status,
        platform: toNullableString(data.platform) || playthrough.platform || "PC",
        startDate: data.startDate !== undefined ? toNullableString(data.startDate) : playthrough.startDate,
        endDate: data.endDate !== undefined ? toNullableString(data.endDate) : playthrough.endDate,
        rating: data.rating !== undefined ? toNullableFiniteNumber(data.rating) : playthrough.rating,
        review: data.review !== undefined ? toNullableString(data.review) : playthrough.review,
        includedInPlan: nextIncludedInPlan,
        planId: nextIncludedInPlan
          ? data.planId !== undefined
            ? toNullableString(data.planId)
            : playthrough.planId
          : null,
        purchasePrice: nextIncludedInPlan
          ? null
          : data.purchasePrice !== undefined
            ? toNullableFiniteNumber(data.purchasePrice)
            : playthrough.purchasePrice,
        purchaseStoreId: nextIncludedInPlan
          ? null
          : data.purchaseStoreId !== undefined
            ? toNullableString(data.purchaseStoreId)
            : playthrough.purchaseStoreId,
        purchaseDate: nextIncludedInPlan
          ? null
          : data.purchaseDate !== undefined
            ? toNullableString(data.purchaseDate)
            : playthrough.purchaseDate,
        salePrice: nextIncludedInPlan
          ? null
          : data.salePrice !== undefined
            ? toNullableFiniteNumber(data.salePrice)
            : playthrough.salePrice,
        saleStoreId: nextIncludedInPlan
          ? null
          : data.saleStoreId !== undefined
            ? toNullableString(data.saleStoreId)
            : playthrough.saleStoreId,
        saleDate: nextIncludedInPlan
          ? null
          : data.saleDate !== undefined
            ? toNullableString(data.saleDate)
            : playthrough.saleDate,
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
    const user = await getAuthenticatedUser()
    if (!user) {
      return { success: false, error: "Debes iniciar sesión." }
    }

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
    const user = await getAuthenticatedUser()
    if (!user) {
      return { success: false, error: "Debes iniciar sesión." }
    }

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
