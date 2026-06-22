import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/schemas/auth"
import { sendVerificationEmail } from "@/lib/email"
import { hashToken } from "@/lib/auth-constants"
import { registerLimiter, getIP, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit"
import { internalErrorResponse } from "@/lib/api-response"

export async function POST(req: Request) {
  const { success, retryAfter } = await checkRateLimit(registerLimiter, getIP(req))
  if (!success) return rateLimitResponse(retryAfter)

  try {
    const body = await req.json()
    const result = registerSchema.safeParse(body)

    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Invalid input"
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { name, email, password } = result.data
    const verificationEnabled = process.env.EMAIL_VERIFICATION_ENABLED !== "false"

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      // Return the same response as a successful registration to avoid email enumeration
      return NextResponse.json({ success: true, verified: !verificationEnabled }, { status: 201 })
    }

    const hashed = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        emailVerified: verificationEnabled ? null : new Date(),
      },
    })

    if (verificationEnabled) {
      const rawToken = crypto.randomBytes(32).toString("hex")
      const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

      await prisma.verificationToken.create({
        data: { identifier: email, token: hashToken(rawToken), expires },
      })

      try {
        await sendVerificationEmail(email, rawToken)
      } catch {
        // Email delivery failed — clean up so the user can retry registration
        await prisma.verificationToken.deleteMany({ where: { identifier: email } })
        await prisma.user.delete({ where: { email } })
        return NextResponse.json(
          { error: "Failed to send verification email. Please try again." },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({ success: true, verified: !verificationEnabled }, { status: 201 })
  } catch {
    return internalErrorResponse()
  }
}
