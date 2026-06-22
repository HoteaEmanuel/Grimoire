import { NextResponse } from "next/server";
import { requireUserIdOrResponse } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const auth = await requireUserIdOrResponse();
  if (auth instanceof NextResponse) return auth;

  await prisma.user.delete({ where: { id: auth.userId } });

  return NextResponse.json({ success: true });
}
