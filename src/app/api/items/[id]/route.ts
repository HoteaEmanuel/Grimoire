import { NextResponse } from "next/server";
import { requireUserIdOrResponse } from "@/lib/auth-helpers";
import { getItemById } from "@/lib/db/items";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUserIdOrResponse();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const item = await getItemById(auth.userId, id);

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}
