"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { uploadImage } from "@/lib/storage"
import type { PrivacyLevel } from "../../../generated/prisma/client"
import { revalidatePath } from "next/cache"

export async function addJournalEntry(libraryEntryId: string, formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return { success: false, error: "Debes iniciar sesión." }
    }

    const content = formData.get("content") as string | null
    const image = formData.get("image") as File | null
    const privacyLevel = (formData.get("privacyLevel") as PrivacyLevel) || "PRIVATE"

    if ((!content || content.trim() === "") && (!image || image.size === 0)) {
      return { success: false, error: "El diario no puede estar vacío." }
    }

    let localUrl: string | null = null
    if (image && image.size > 0) {
      localUrl = await uploadImage(image)
    }

    const existingEntry = await prisma.journalEntry.findUnique({
      where: { libraryEntryId }
    })

    const dateStr = new Date().toLocaleString("es-ES")
    const newContentText = content && content.trim() !== "" ? `\n\n--- Entrada el ${dateStr} ---\n${content.trim()}` : ""
    
    let updatedContent = existingEntry ? existingEntry.content : ""
    updatedContent += newContentText

    const journalEntry = await prisma.journalEntry.upsert({
      where: { libraryEntryId },
      update: {
        content: updatedContent.trim(),
      },
      create: {
        libraryEntryId,
        content: updatedContent.trim(),
      }
    })

    if (localUrl) {
      await prisma.journalImage.create({
        data: {
          journalEntryId: journalEntry.id,
          localUrl,
          privacyLevel,
        }
      })
    }

    revalidatePath("/games/[id]/journal", "page")

    return { success: true }
  } catch (error) {
    console.error("[addJournalEntry] Error:", error)
    return { success: false, error: "Error al guardar en el diario." }
  }
}
