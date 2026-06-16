import NextAuth from "next-auth"
import authConfig from "./auth.config"

const { auth } = NextAuth(authConfig)

export const proxy = auth(function middleware(req) {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isProtected =
    nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname.startsWith("/profile")

  if (isProtected) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/sign-in", nextUrl))
    }

    // Block unverified credentials users from the dashboard
    const verificationEnabled = process.env.EMAIL_VERIFICATION_ENABLED !== "false"
    const emailVerified = req.auth?.user?.emailVerified
    if (verificationEnabled && !emailVerified) {
      const email = req.auth?.user?.email ?? ""
      const url = new URL("/verify-email", nextUrl)
      if (email) url.searchParams.set("email", email)
      return Response.redirect(url)
    }
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
