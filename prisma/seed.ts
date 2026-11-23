import { PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import "dotenv/config"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error("❌ DATABASE_URL no está definida en las variables de entorno.")
  process.exit(1)
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

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

async function main() {
  console.log("🌱 Inicializando base de datos...")

  // 1. Tiendas por defecto
  console.log("🏪 Verificando e insertando tiendas por defecto...")
  for (const name of DEFAULT_STORES) {
    const existing = await prisma.store.findFirst({
      where: { name, isDefault: true },
    })
    if (!existing) {
      await prisma.store.create({
        data: { name, isDefault: true, userId: null },
      })
      console.log(`   + Tenda: ${name}`)
    }
  }

  // 2. Usuario administrador / inicial
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@ludio.app").trim()
  const adminUsername = (process.env.ADMIN_USERNAME || "admin").trim()
  const adminPassword = process.env.ADMIN_PASSWORD || "ludio_admin_123"

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: adminEmail, mode: "insensitive" } },
        { username: { equals: adminUsername, mode: "insensitive" } },
      ],
    },
  })

  if (!existingUser) {
    console.log(`👤 Creando usuario inicial (${adminUsername} / ${adminEmail})...`)
    const passwordHash = await bcrypt.hash(adminPassword, 10)
    await prisma.user.create({
      data: {
        email: adminEmail,
        username: adminUsername,
        passwordHash,
      },
    })
    console.log(`✓ Usuario creado con éxito: ${adminUsername} (${adminEmail})`)
  } else {
    const passwordMatches = existingUser.passwordHash
      ? await bcrypt.compare(adminPassword, existingUser.passwordHash)
      : false
    const needsUpdate =
      existingUser.email !== adminEmail ||
      existingUser.username !== adminUsername ||
      !passwordMatches

    if (needsUpdate) {
      const passwordHash = passwordMatches
        ? existingUser.passwordHash
        : await bcrypt.hash(adminPassword, 10)

      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          email: adminEmail,
          username: adminUsername,
          passwordHash,
        },
      })
      console.log(
        `🔄 Usuario inicial actualizado con as credenciais de .env (${adminUsername} / ${adminEmail}).`
      )
    } else {
      console.log(
        `ℹ️ O usuario inicial (${existingUser.username} / ${existingUser.email}) xa está sincronizado.`
      )
    }
  }

  console.log("✅ Inicialización completada con éxito.")
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
