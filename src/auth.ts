import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./lib/prisma"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },
      authorize: async (credentials) => {
        const rawUsername =
          typeof credentials?.username === "string" ? credentials.username.trim() : ""
        const rawPassword =
          typeof credentials?.password === "string" ? credentials.password : ""

        if (!rawUsername || !rawPassword) {
          return null
        }

        const user = await prisma.user.findFirst({
          where: {
            username: {
              equals: rawUsername,
              mode: "insensitive",
            },
          },
        })

        if (!user || !user.passwordHash) {
          return null // Do not reveal if user exists
        }

        const isValid = await bcrypt.compare(rawPassword, user.passwordHash)

        if (!isValid) {
          return null // Do not reveal if password is wrong
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
        }
      },
    }),
  ],
})
