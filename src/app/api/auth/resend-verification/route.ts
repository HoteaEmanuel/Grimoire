import { NextResponse } from "next/server"
import crypto from "crypto"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/email"

const schema = z.object({ email: z.email() })

export async function POST(req: Request) {
  if (process.env.EMAIL_VERIFICATION_ENABLED === "false") {
    return NextResponse.json({ success: true })
  }

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
      select: { emailVerified: true },
    })

    // Don't reveal whether the user exists — always return 200
    if (!user || user.emailVerified) {
      return NextResponse.json({ success: true })
    }

    // Delete all existing tokens for this email and issue a fresh one
    await prisma.verificationToken.deleteMany({ where: { identifier: email } })

    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    })

    await sendVerificationEmail(email, token)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
