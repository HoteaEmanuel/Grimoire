import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireUserIdOrResponse } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/schemas/auth";
import { changePasswordLimiter, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { internalErrorResponse } from "@/lib/api-response";

export async function POST(req: Request) {
  const auth = await requireUserIdOrResponse();
  if (auth instanceof NextResponse) return auth;

  const { success, retryAfter } = await checkRateLimit(changePasswordLimiter, auth.userId);
  if (!success) return rateLimitResponse(retryAfter);

  try {
    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { currentPassword, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json({ error: "No password set on this account" }, { status: 400 });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: auth.userId }, data: { password: hashed } });

    return NextResponse.json({ success: true });
  } catch {
    return internalErrorResponse();
  }
}
