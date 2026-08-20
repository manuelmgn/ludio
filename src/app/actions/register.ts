"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export async function registerUser(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (!email || !username || !password) {
    return { error: "Todos los campos son obligatorios" }
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  })

  if (existingUser) {
    return { error: "El email o el nombre de usuario ya están en uso" }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
    },
  })

  redirect("/login")
}
