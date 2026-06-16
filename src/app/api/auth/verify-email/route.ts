import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const base =
    process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"

  if (!token || !email) {
    return NextResponse.redirect(new URL("/sign-in?error=invalid-token", base))
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!record || record.identifier !== email || record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { token } })
    return NextResponse.redirect(new URL("/sign-in?error=token-expired", base))
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({
      where: { token },
    }),
  ])

  return NextResponse.redirect(
    new URL("/sign-in?toast=email-verified", base),
  )
}
