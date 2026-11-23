import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

/**
 * Returns the currently authenticated user, or falls back to a local demo user
 * when running without an active session.
 */
export async function getAuthenticatedOrDemoUser() {
  const session = await auth()
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
    if (user) return user
  }

  let user = await prisma.user.findFirst()
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "demo@ludio.app",
        username: "demo_user",
        passwordHash: "mock_hash",
      },
    })
  }
  return user
}
