import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashToken } from "@/lib/auth-constants"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const rawToken = searchParams.get("token")
  const email = searchParams.get("email")

  const base =
    process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"

  if (!rawToken || !email) {
    return NextResponse.redirect(new URL("/verify-email?error=invalid-token", base))
  }

  try {
    const record = await prisma.verificationToken.findUnique({
      where: { token: hashToken(rawToken) },
    })

    if (!record || record.identifier !== email || record.expires < new Date()) {
      await prisma.verificationToken.deleteMany({ where: { token: hashToken(rawToken) } })
      return NextResponse.redirect(new URL("/verify-email?error=token-expired", base))
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.delete({
        where: { token: hashToken(rawToken) },
      }),
    ])

    return NextResponse.redirect(
      new URL("/sign-in?toast=email-verified", base),
    )
  } catch {
    return NextResponse.redirect(new URL("/verify-email?error=invalid-token", base))
  }
}
