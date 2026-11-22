"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

async function getOrCreateCurrentUser() {
  const session = await auth()
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    if (user) return user
  }

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
  return user
}

export async function getCustomPlatforms() {
  try {
    const user = await getOrCreateCurrentUser()
    const platforms = await prisma.customPlatform.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    })
    return { success: true, data: platforms }
  } catch (error) {
    console.error("Error fetching custom platforms:", error)
    return { success: false, data: [] }
  }
}

export async function addCustomPlatform(name: string) {
  if (!name || name.trim().length === 0) {
    return { success: false, error: "O nome da plataforma é obrigatorio." }
  }

  try {
    const user = await getOrCreateCurrentUser()

    // Comprobar si ya existe una plataforma con ese nombre para este usuario
    const existing = await prisma.customPlatform.findFirst({
      where: {
        userId: user.id,
        name: {
          equals: name.trim(),
          mode: "insensitive"
        }
      }
    })

    if (existing) {
      return { success: false, error: "Esta plataforma xa existe." }
    }

    const platform = await prisma.customPlatform.create({
      data: {
        name: name.trim(),
        userId: user.id
      }
    })

    revalidatePath("/settings")
    revalidatePath("/library")

    return { success: true, data: platform }
  } catch (error) {
    console.error("Error adding custom platform:", error)
    return { success: false, error: "Ocorreu un erro ao engadir a plataforma." }
  }
}

export async function deleteCustomPlatform(platformId: string) {
  try {
    const user = await getOrCreateCurrentUser()
    await prisma.customPlatform.deleteMany({
      where: {
        id: platformId,
        userId: user.id
      }
    })

    revalidatePath("/settings")
    revalidatePath("/library")
    return { success: true }
  } catch (error) {
    console.error("Error deleting custom platform:", error)
    return { success: false, error: "Erro ao eliminar a plataforma." }
  }
}
