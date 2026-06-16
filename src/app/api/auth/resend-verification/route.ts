import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

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
