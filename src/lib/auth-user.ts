import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

/**
 * Returns the currently authenticated database user, or null if not logged in.
 * Never falls back to another user or creates demo accounts.
 */
export async function getAuthenticatedUser() {
  const session = await auth()
  if (!session?.user?.email) {
    return null
  }

  return prisma.user.findUnique({
    where: { email: session.user.email },
  })
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
