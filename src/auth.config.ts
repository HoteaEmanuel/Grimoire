import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"
import { applyEmailVerified } from "@/lib/auth-session"

export default {
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    session({ session, token }) {
      applyEmailVerified(session, token)
      return session
    },
  },
  providers: [
    GitHub({}),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: () => null,
    }),
  ],
} satisfies NextAuthConfig
