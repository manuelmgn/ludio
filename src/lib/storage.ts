import fs from "fs"
import path from "path"

export async function uploadImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uploadDir = path.join(process.cwd(), "public", "uploads")
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const safeName = file.name.replace(/\s+/g, "_")
  const fileName = `${Date.now()}-${safeName}`
  const filePath = path.join(uploadDir, fileName)

  await fs.promises.writeFile(filePath, buffer)

  return `/uploads/${fileName}`
}
