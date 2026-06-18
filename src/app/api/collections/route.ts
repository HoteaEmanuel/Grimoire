import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserCollections } from "@/lib/db/collections";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const collections = await getUserCollections(session.user.id);
  return NextResponse.json(collections);
}
