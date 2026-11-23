import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isPublicPwaRoute =
        nextUrl.pathname === "/offline" ||
        nextUrl.pathname === "/sw.js" ||
        nextUrl.pathname.startsWith("/pwa/")

      if (isPublicPwaRoute) {
        return true
      }

      const isAuthPage =
        nextUrl.pathname === "/login" || nextUrl.pathname === "/register"

      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl))
        }
        return true
      }

      if (!isLoggedIn) {
        return false // Redirect all unauthenticated requests to /login
      }

      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
      }
      return session
    },
  },
  providers: [],
} satisfies NextAuthConfig
