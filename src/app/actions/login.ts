"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function authenticate(prevState: unknown, formData: FormData) {
  try {
    await signIn("credentials", formData)
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciales incorrectas." }
        default:
          return { error: "Hubo un error al iniciar sesión." }
      }
    }
    throw error
  }
}
