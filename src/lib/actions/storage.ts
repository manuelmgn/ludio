"use server"

import fs from "fs"
import path from "path"

export async function uploadCanvasImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get("file") as File | null
    if (!file) {
      return { success: false, error: "No se encontró ningún archivo." }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    
    // Asegurarse de que el directorio existe
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Crear un nombre de archivo único
    const timestamp = Date.now()
    // Normalizar el nombre del archivo reemplazando espacios y caracteres no deseados
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}-${safeName}`
    const filePath = path.join(uploadsDir, fileName)

    // Escribir el archivo
    await fs.promises.writeFile(filePath, buffer)

    // Devolver la URL pública
    const url = `/uploads/${fileName}`
    return { success: true, url }
  } catch (error) {
    console.error("Error al subir la imagen:", error)
    return { success: false, error: "Ocurrió un error al guardar la imagen." }
  }
}
