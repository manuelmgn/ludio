"use server"

import { getAuthenticatedUser } from "@/lib/auth-user"
import { uploadImage } from "@/lib/storage"

export async function uploadCanvasImage(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return { success: false, error: "Debes iniciar sesión." }
    }
    const file = formData.get("file") as File | null
    if (!file || file.size === 0) {
      return { success: false, error: "No se encontró ningún archivo." }
    }

    const url = await uploadImage(file)
    return { success: true, url }
  } catch (error) {
    console.error("Error al subir la imagen:", error)
    return { success: false, error: "Ocurrió un error al guardar la imagen." }
  }
}
