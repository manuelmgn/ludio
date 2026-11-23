import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

/**
 * Returns the currently authenticated database user, or null if not logged in.
 * Never falls back to another user or creates demo accounts.
 */
export async function getAuthenticatedUser() {
  const session = await auth()
  if (!session?.user) {
    return null
  }

  if (session.user.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })
    if (user) return user
  }

  if (session.user.name) {
    const user = await prisma.user.findUnique({
      where: { username: session.user.name },
    })
    if (user) return user
  }

  if (session.user.email) {
    return prisma.user.findUnique({
      where: { email: session.user.email },
    })
  }

  return null
}

/**
 * Requires an authenticated user in Server Components; redirects to `/login` otherwise.
 */
export async function requireAuthenticatedUser() {
  const user = await getAuthenticatedUser()
  if (!user) {
    redirect("/login")
  }
  return user
}
