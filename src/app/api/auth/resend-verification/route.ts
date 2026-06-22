import { NextResponse } from "next/server"
import crypto from "crypto"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/email"
import { hashToken } from "@/lib/auth-constants"
import { resendVerificationLimiter, getIP, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit"
import { internalErrorResponse } from "@/lib/api-response"

const schema = z.object({ email: z.email() })

export async function POST(req: Request) {
  if (process.env.EMAIL_VERIFICATION_ENABLED === "false") {
    return NextResponse.json({ success: true })
  }

  const { success: ipOk, retryAfter: ipRetry } = await checkRateLimit(
    resendVerificationLimiter,
    getIP(req),
  )
  if (!ipOk) return rateLimitResponse(ipRetry)

  try {
    const body = await req.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      // Return 200 to avoid email enumeration
      return NextResponse.json({ success: true })
    }

    const { email } = result.data

    const { success, retryAfter } = await checkRateLimit(
      resendVerificationLimiter,
      `${getIP(req)}:${email}`,
    )
    if (!success) return rateLimitResponse(retryAfter)

    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true },
    })

    // Don't reveal whether the user exists — always return 200
    if (!user || user.emailVerified) {
      return NextResponse.json({ success: true })
    }

    // Delete all existing tokens for this email and issue a fresh one
    await prisma.verificationToken.deleteMany({ where: { identifier: email } })

    const rawToken = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.verificationToken.create({
      data: { identifier: email, token: hashToken(rawToken), expires },
    })

    await sendVerificationEmail(email, rawToken)

    return NextResponse.json({ success: true })
  } catch {
    return internalErrorResponse()
  }
}
