import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { hashToken, safeCompare } from "@/lib/auth-constants"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const rawToken = searchParams.get("token")
  const email = searchParams.get("email")

  const base =
    process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"

  if (!rawToken || !email) {
    return NextResponse.redirect(new URL("/verify-email?error=invalid-token", base))
  }

  if (!z.email().safeParse(email).success) {
    return NextResponse.redirect(new URL("/verify-email?error=invalid-token", base))
  }

  try {
    const tokenHash = hashToken(rawToken)

    const record = await prisma.verificationToken.findUnique({
      where: { token: tokenHash },
    })

    if (!record || !safeCompare(record.identifier, email) || record.expires < new Date()) {
      await prisma.verificationToken.deleteMany({ where: { token: tokenHash } })
      return NextResponse.redirect(new URL("/verify-email?error=token-expired", base))
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.delete({
        where: { token: tokenHash },
      }),
    ])

    return NextResponse.redirect(
      new URL("/sign-in?toast=email-verified", base),
    )
  } catch {
    return NextResponse.redirect(new URL("/verify-email?error=invalid-token", base))
  }
}
