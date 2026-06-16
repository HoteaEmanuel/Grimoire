import { NextResponse } from "next/server"
import { loginLimiter, getIP, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : ""
  const { success, retryAfter } = await checkRateLimit(loginLimiter, `${getIP(req)}:${email}`)
  if (!success) return rateLimitResponse(retryAfter)
  return NextResponse.json({ ok: true })
}
