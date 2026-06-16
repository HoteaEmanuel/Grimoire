import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import authConfig from "./auth.config"

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user, account, profile }) {
      if (user) token.id = user.id
      // On GitHub OAuth, grab avatar directly from the raw provider profile
      // because account linking doesn't update user.image in the DB
      if (account?.provider === "github" && profile) {
        token.picture =
          (profile as { avatar_url?: string }).avatar_url ?? token.picture
      } else if (user?.image) {
        token.picture = user.image
      }
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      if (token.picture) session.user.image = token.picture as string
      return session
    },
  },
  ...authConfig,
  providers: [
    GitHub({ allowDangerousEmailAccountLinking: true }),
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string
          password: string
        }
        if (!email || !password) return null

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user?.password) return null

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return null

        return user
      },
    }),
  ],
})
