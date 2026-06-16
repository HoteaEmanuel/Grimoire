import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/schemas/auth"
import { sendVerificationEmail } from "@/lib/email"
import { hashToken } from "@/lib/auth-constants"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = registerSchema.safeParse(body)

    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Invalid input"
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { name, email, password } = result.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)
    const verificationEnabled = process.env.EMAIL_VERIFICATION_ENABLED !== "false"

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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
