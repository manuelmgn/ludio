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

// ==================== Custom Platforms ====================

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

// ==================== Stores (Tiendas) ====================

const DEFAULT_STORES = [
  "Amazon",
  "AliExpress",
  "Wallapop",
  "Vinted",
  "GAME",
  "PS Store",
  "Nintendo eShop",
  "Steam",
  "Xbox Store",
  "Epic Games Store",
  "GOG",
  "Humble Bundle",
  "eBay",
  "CeX",
  "MediaMarkt",
  "Carrefour",
  "El Corte Inglés",
  "Cash Converters",
]

export async function ensureDefaultStores() {
  const existingDefaults = await prisma.store.findMany({
    where: { isDefault: true }
  })

  if (existingDefaults.length === 0) {
    await prisma.store.createMany({
      data: DEFAULT_STORES.map((name) => ({
        name,
        isDefault: true,
        userId: null,
      })),
      skipDuplicates: true,
    })
  }
}

export async function getStores() {
  try {
    const user = await getOrCreateCurrentUser()

    // Ensure default stores exist
    await ensureDefaultStores()

    const stores = await prisma.store.findMany({
      where: {
        OR: [
          { isDefault: true },
          { userId: user.id },
        ]
      },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }]
    })
    return { success: true, data: stores }
  } catch (error) {
    console.error("Error fetching stores:", error)
    return { success: false, data: [] }
  }
}

export async function addStore(name: string) {
  if (!name || name.trim().length === 0) {
    return { success: false, error: "O nome da tenda é obrigatorio." }
  }

  try {
    const user = await getOrCreateCurrentUser()

    // Check if store already exists (default or user-created)
    const existing = await prisma.store.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: "insensitive"
        },
        OR: [
          { isDefault: true },
          { userId: user.id },
        ]
      }
    })

    if (existing) {
      return { success: false, error: "Esta tenda xa existe." }
    }

    const store = await prisma.store.create({
      data: {
        name: name.trim(),
        isDefault: false,
        userId: user.id,
      }
    })

    revalidatePath("/settings")
    return { success: true, data: store }
  } catch (error) {
    console.error("Error adding store:", error)
    return { success: false, error: "Ocorreu un erro ao engadir a tenda." }
  }
}

export async function deleteStore(storeId: string) {
  try {
    const user = await getOrCreateCurrentUser()

    // Only allow deleting non-default (user-created) stores
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        isDefault: false,
        userId: user.id,
      }
    })

    if (!store) {
      return { success: false, error: "Non se pode eliminar unha tenda predefinida." }
    }

    await prisma.store.delete({
      where: { id: storeId }
    })

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Error deleting store:", error)
    return { success: false, error: "Erro ao eliminar a tenda." }
  }
}
