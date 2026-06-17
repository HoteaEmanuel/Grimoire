import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getObjectStream } from "@/lib/r2";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key: segments } = await params;
  const key = segments.join("/");

  // Verify ownership: the key starts with userId/
  if (!key.startsWith(`${session.user.id}/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Confirm the item exists in DB
  const fileUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
  const item = await prisma.item.findFirst({
    where: { userId: session.user.id, fileUrl },
    select: { id: true, fileName: true },
  });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const obj = await getObjectStream(key);
  if (!obj.Body) {
    return NextResponse.json({ error: "File not found in storage" }, { status: 404 });
  }

  const fileName = item.fileName ?? segments.at(-1) ?? "download";
  const contentType = obj.ContentType ?? "application/octet-stream";
  const contentLength = obj.ContentLength;

  const headers: HeadersInit = {
    "Content-Type": contentType,
    "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
    "Cache-Control": "private, max-age=3600",
  };
  if (contentLength) {
    headers["Content-Length"] = String(contentLength);
  }

  // @ts-expect-error — ReadableStream from AWS SDK is compatible
  return new NextResponse(obj.Body, { headers });
}
