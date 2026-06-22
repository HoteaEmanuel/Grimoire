import { NextResponse } from "next/server";
import { requireUserIdOrResponse } from "@/lib/auth-helpers";
import { getUserCollections } from "@/lib/db/collections";

export async function GET() {
  const auth = await requireUserIdOrResponse();
  if (auth instanceof NextResponse) return auth;

  const collections = await getUserCollections(auth.userId);
  return NextResponse.json(collections);
}
