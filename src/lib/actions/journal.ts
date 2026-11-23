"use server"

import { prisma } from "@/lib/prisma"
import { uploadImage } from "@/lib/storage"
import type { PrivacyLevel } from "@generated/prisma/enums"
import { revalidatePath } from "next/cache"

export async function addJournalEntry(libraryEntryId: string, formData: FormData) {
  try {
    const content = formData.get("content") as string | null
    const image = formData.get("image") as File | null
    const privacyLevel = (formData.get("privacyLevel") as PrivacyLevel) || "PRIVATE"

    if ((!content || content.trim() === "") && (!image || image.size === 0)) {
      return { success: false, error: "O diario non pode estar baleiro." }
    }

    let localUrl: string | null = null
    if (image && image.size > 0) {
      localUrl = await uploadImage(image)
    }

    const existingEntry = await prisma.journalEntry.findUnique({
      where: { libraryEntryId }
    })

    const dateStr = new Date().toLocaleString("gl-ES", {
      dateStyle: "medium",
      timeStyle: "short"
    })
    const newContentText = content && content.trim() !== "" ? `\n\n--- Entrada [${dateStr}] ---\n${content.trim()}` : ""
    
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
    return { success: false, error: "Erro ao gardar no diario." }
  }
}

export async function addPlaythroughJournalEntry(
  playthroughId: string,
  gameId: string,
  formData: FormData
) {
  try {
    const content = (formData.get("content") as string | null)?.trim() || ""
    const image = formData.get("image") as File | null
    const privacyLevel = (formData.get("privacyLevel") as PrivacyLevel) || "PRIVATE"

    if (!content && (!image || image.size === 0)) {
      return { success: false, error: "A entrada non pode estar baleira." }
    }

    let imageUrl: string | null = null
    if (image && image.size > 0) {
      imageUrl = await uploadImage(image)
    }

    await prisma.playthroughJournalEntry.create({
      data: {
        playthroughId,
        content,
        imageUrl,
        privacyLevel,
      },
    })

    revalidatePath(`/games/${gameId}`)
    revalidatePath(`/games/${gameId}/playthroughs/${playthroughId}`)

    return { success: true }
  } catch (error) {
    console.error("[addPlaythroughJournalEntry] Error:", error)
    return { success: false, error: "Erro ao gardar a entrada do diario." }
  }
}

export async function deletePlaythroughJournalEntry(
  entryId: string,
  playthroughId: string,
  gameId: string
) {
  try {
    await prisma.playthroughJournalEntry.delete({
      where: { id: entryId },
    })

    revalidatePath(`/games/${gameId}`)
    revalidatePath(`/games/${gameId}/playthroughs/${playthroughId}`)

    return { success: true }
  } catch (error) {
    console.error("[deletePlaythroughJournalEntry] Error:", error)
    return { success: false, error: "Non se puido eliminar a entrada." }
  }
}
