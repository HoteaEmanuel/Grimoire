import { NextResponse } from "next/server";

export function internalErrorResponse() {
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
