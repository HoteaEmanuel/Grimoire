import { NextResponse } from "next/server"
import crypto from "crypto"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"
import { RESET_PREFIX, hashToken } from "@/lib/auth-constants"
import { forgotPasswordLimiter, getIP, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit"
import { internalErrorResponse } from "@/lib/api-response"

const schema = z.object({ email: z.email() })

export async function POST(req: Request) {
  const { success, retryAfter } = await checkRateLimit(forgotPasswordLimiter, getIP(req))
  if (!success) return rateLimitResponse(retryAfter)

  try {
    const body = await req.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      // Return 200 to avoid email enumeration
      return NextResponse.json({ success: true })
    }

    const { email } = result.data

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    })

    // Only allow reset for credential accounts (password is set)
    if (!user || !user.password) {
      return NextResponse.json({ success: true })
    }

    // Delete any existing reset tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: `${RESET_PREFIX}${email}` },
    })

    const rawToken = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.verificationToken.create({
      data: { identifier: `${RESET_PREFIX}${email}`, token: hashToken(rawToken), expires },
    })

    await sendPasswordResetEmail(email, rawToken)

    return NextResponse.json({ success: true })
  } catch {
    return internalErrorResponse()
  }
}
