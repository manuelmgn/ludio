"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function addCustomPlatform(name: string) {
  if (!name || name.trim().length === 0) {
    return { success: false, error: "El nombre de la plataforma es obligatorio." }
  }

  try {
    // TODO: Usar sesión real cuando se implemente la autenticación
    // Por ahora, obtenemos el primer usuario de la base de datos o lo creamos si no existe
    let user = await prisma.user.findFirst()
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "demo@ludio.app",
          username: "demo_user",
          passwordHash: "mock_hash"
        }
      })
    }

    const platform = await prisma.customPlatform.create({
      data: {
        name: name.trim(),
        userId: user.id
      }
    })

    // Revalidate paths that might display platforms
    revalidatePath("/settings")
    revalidatePath("/library")

    return { success: true, data: platform }
  } catch (error) {
    console.error("Error adding custom platform:", error)
    return { success: false, error: "Ocurrió un error al añadir la plataforma." }
  }
}
