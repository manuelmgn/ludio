"use server"

import { getAuthenticatedOrDemoUser } from "@/lib/auth-user"
import { prisma } from "@/lib/prisma"
import { deleteLocalUpload } from "@/lib/storage"
import { PrivacyLevel } from "@generated/prisma/enums"
import { revalidatePath } from "next/cache"

export async function saveCanvasText(libraryEntryId: string, content: string) {
  try {
    const user = await getAuthenticatedOrDemoUser()
    const libraryEntry = await prisma.libraryEntry.findUnique({
      where: { id: libraryEntryId },
      select: { userId: true, gameId: true },
    })

    if (!libraryEntry || libraryEntry.userId !== user.id) {
      return { success: false, error: "Non tes permisos para editar este canvas." }
    }

    const canvas = await prisma.gameCanvas.upsert({
      where: { libraryEntryId },
      update: { content },
      create: {
        libraryEntryId,
        content,
      },
    })

    revalidatePath(`/games/${libraryEntry.gameId}/canvas`)
    revalidatePath(`/games/${libraryEntry.gameId}`)
    return { success: true, data: canvas }
  } catch (error) {
    console.error("Error saving canvas text:", error)
    return { success: false, error: "Error al guardar las notas." }
  }
}

export async function saveCanvasImageRecord(
  libraryEntryId: string,
  url: string,
  privacy: PrivacyLevel
) {
  try {
    const user = await getAuthenticatedOrDemoUser()
    const libraryEntry = await prisma.libraryEntry.findUnique({
      where: { id: libraryEntryId },
      select: { userId: true, gameId: true },
    })

    if (!libraryEntry || libraryEntry.userId !== user.id) {
      return { success: false, error: "Non tes permisos para editar este canvas." }
    }

    const canvas = await prisma.gameCanvas.upsert({
      where: { libraryEntryId },
      update: {},
      create: {
        libraryEntryId,
      },
    })

    const image = await prisma.canvasImage.create({
      data: {
        url,
        privacy,
        canvasId: canvas.id,
      },
    })

    revalidatePath(`/games/${libraryEntry.gameId}/canvas`)
    revalidatePath(`/games/${libraryEntry.gameId}`)
    return { success: true, data: image }
  } catch (error) {
    console.error("Error saving canvas image record:", error)
    return { success: false, error: "Error al guardar el registro de la imagen." }
  }
}

export async function deleteCanvasImage(imageId: string, libraryEntryId: string) {
  try {
    const user = await getAuthenticatedOrDemoUser()
    const image = await prisma.canvasImage.findUnique({
      where: { id: imageId },
      include: {
        canvas: {
          include: {
            libraryEntry: {
              select: { id: true, userId: true, gameId: true },
            },
          },
        },
      },
    })

    if (!image || image.canvas.libraryEntry.id !== libraryEntryId) {
      return { success: false, error: "Imagen no encontrada." }
    }

    if (image.canvas.libraryEntry.userId !== user.id) {
      return { success: false, error: "Non tes permisos para eliminar esta imaxe." }
    }

    await deleteLocalUpload(image.url)

    await prisma.canvasImage.delete({
      where: { id: imageId },
    })

    revalidatePath(`/games/${image.canvas.libraryEntry.gameId}/canvas`)
    revalidatePath(`/games/${image.canvas.libraryEntry.gameId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting canvas image:", error)
    return { success: false, error: "Error al eliminar la imagen." }
  }
}
