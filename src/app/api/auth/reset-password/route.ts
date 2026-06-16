import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const schema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
})

const RESET_PREFIX = "reset:"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const { token, email, password } = result.data

    const record = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (
      !record ||
      record.identifier !== `${RESET_PREFIX}${email}` ||
      record.expires < new Date()
    ) {
      await prisma.verificationToken.deleteMany({ where: { token } })
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
        where: { token },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
