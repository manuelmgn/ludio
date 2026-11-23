import crypto from "crypto"
import fs from "fs"
import path from "path"

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads")

/**
 * Saves an uploaded image file to `public/uploads` with a collision-free name
 * and returns its public URL path.
 */
export async function uploadImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  }

  const baseName = path.basename(file.name || "upload")
  const safeName = baseName.replace(/[^a-zA-Z0-9.-]/g, "_")
  const uniqueSuffix = crypto.randomUUID().slice(0, 8)
  const fileName = `${Date.now()}-${uniqueSuffix}-${safeName}`
  const filePath = path.join(UPLOADS_DIR, fileName)

  await fs.promises.writeFile(filePath, buffer)

  return `/uploads/${fileName}`
}

/**
 * Deletes a locally stored upload under `/uploads/` if it exists on disk.
 */
export async function deleteLocalUpload(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith("/uploads/")) return

  const fileName = path.basename(url)
  if (!fileName || fileName === "." || fileName === "..") return

  const filePath = path.join(UPLOADS_DIR, fileName)
  if (fs.existsSync(filePath)) {
    try {
      await fs.promises.unlink(filePath)
    } catch (err) {
      console.warn("Could not delete file from disk:", err)
    }
  }
}
