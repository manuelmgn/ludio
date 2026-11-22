"use server"

import { prisma } from "@/lib/prisma"
import { PrivacyLevel } from "@generated/prisma/enums"
import { revalidatePath } from "next/cache"
import fs from "fs"
import path from "path"

export async function saveCanvasText(libraryEntryId: string, content: string) {
  try {
    const canvas = await prisma.gameCanvas.upsert({
      where: { libraryEntryId },
      update: { content },
      create: {
        libraryEntryId,
        content
      }
    })

    revalidatePath(`/games/${libraryEntryId}/canvas`)
    return { success: true, data: canvas }
  } catch (error) {
    console.error("Error saving canvas text:", error)
    return { success: false, error: "Error al guardar las notas." }
  }
}

export async function saveCanvasImageRecord(libraryEntryId: string, url: string, privacy: PrivacyLevel) {
  try {
    // Primero asegurarnos de que el canvas existe
    const canvas = await prisma.gameCanvas.upsert({
      where: { libraryEntryId },
      update: {},
      create: {
        libraryEntryId
      }
    })

    // Crear el registro de la imagen
    const image = await prisma.canvasImage.create({
      data: {
        url,
        privacy,
        canvasId: canvas.id
      }
    })

    revalidatePath(`/games/${libraryEntryId}/canvas`)
    return { success: true, data: image }
  } catch (error) {
    console.error("Error saving canvas image record:", error)
    return { success: false, error: "Error al guardar el registro de la imagen." }
  }
}

export async function deleteCanvasImage(imageId: string, libraryEntryId: string) {
  try {
    const image = await prisma.canvasImage.findUnique({
      where: { id: imageId }
    })

    if (!image) {
      return { success: false, error: "Imagen no encontrada." }
    }

    // Si la imagen es un archivo local en /uploads, eliminarlo del disco
    if (image.url.startsWith("/uploads/")) {
      const fileName = image.url.replace("/uploads/", "")
      const filePath = path.join(process.cwd(), "public", "uploads", fileName)
      if (fs.existsSync(filePath)) {
        try {
          await fs.promises.unlink(filePath)
        } catch (err) {
          console.warn("Could not delete file from disk:", err)
        }
      }
    }

    await prisma.canvasImage.delete({
      where: { id: imageId }
    })

    revalidatePath(`/games/${libraryEntryId}/canvas`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting canvas image:", error)
    return { success: false, error: "Error al eliminar la imagen." }
  }
}
