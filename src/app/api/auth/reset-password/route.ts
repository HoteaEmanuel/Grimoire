import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { RESET_PREFIX, hashToken } from "@/lib/auth-constants"
import { resetPasswordLimiter, getIP, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit"

const schema = z.object({
  token: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
})

export async function POST(req: Request) {
  const { success, retryAfter } = await checkRateLimit(resetPasswordLimiter, getIP(req))
  if (!success) return rateLimitResponse(retryAfter)

  try {
    const body = await req.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const { token: rawToken, email, password } = result.data

    const record = await prisma.verificationToken.findUnique({
      where: { token: hashToken(rawToken) },
    })

    if (
      !record ||
      record.identifier !== `${RESET_PREFIX}${email}` ||
      record.expires < new Date()
    ) {
      await prisma.verificationToken.deleteMany({ where: { token: hashToken(rawToken) } })
      return NextResponse.json(
        { error: "token-expired" },
        { status: 400 },
      )
    }

    const hashed = await bcrypt.hash(password, 12)

    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { password: hashed },
      }),
      prisma.verificationToken.delete({
        where: { token: hashToken(rawToken) },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
