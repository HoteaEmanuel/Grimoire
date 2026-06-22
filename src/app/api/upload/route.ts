import { NextRequest, NextResponse } from "next/server";
import { requireUserIdOrResponse } from "@/lib/auth-helpers";
import { putObject, getPublicUrl } from "@/lib/r2";
import { uploadLimiter, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { randomUUID } from "crypto";
import path from "path";

const IMAGE_MIME_TYPES = new Set([
  "image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml",
]);
const FILE_MIME_TYPES = new Set([
  "application/pdf", "text/plain", "text/markdown", "application/json",
  "application/x-yaml", "text/yaml", "application/xml", "text/xml",
  "text/csv", "application/toml",
]);

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"]);
const FILE_EXTENSIONS = new Set([".pdf", ".txt", ".md", ".json", ".yaml", ".yml", ".xml", ".csv", ".toml", ".ini"]);

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  if (!process.env.R2_BUCKET_NAME || !process.env.R2_ACCOUNT_ID || !process.env.R2_PUBLIC_URL) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  const authResult = await requireUserIdOrResponse();
  if (authResult instanceof NextResponse) return authResult;
  if (!authResult.isPro) {
    return NextResponse.json({ error: "Files and images are a Pro feature" }, { status: 403 });
  }

  const { success, retryAfter } = await checkRateLimit(uploadLimiter, `upload:${authResult.userId}`);
  if (!success) return rateLimitResponse(retryAfter);

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const file = formData.get("file");
  const typeSlug = formData.get("typeSlug");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (typeSlug !== "files" && typeSlug !== "images") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  const isImage = typeSlug === "images";
  const allowedMime = isImage ? IMAGE_MIME_TYPES : FILE_MIME_TYPES;
  const allowedExt = isImage ? IMAGE_EXTENSIONS : FILE_EXTENSIONS;
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;

  if (!allowedMime.has(file.type)) {
    return NextResponse.json({ error: `File type "${file.type}" is not allowed` }, { status: 422 });
  }
  if (!allowedExt.has(ext)) {
    return NextResponse.json({ error: `Extension "${ext}" is not allowed` }, { status: 422 });
  }
  if (file.size > maxSize) {
    const limit = isImage ? "5 MB" : "10 MB";
    return NextResponse.json({ error: `File exceeds the ${limit} limit` }, { status: 422 });
  }

  const safeName = path.basename(file.name).replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${authResult.userId}/${typeSlug}/${randomUUID()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await putObject(key, buffer, file.type, file.size);
  } catch (err) {
    console.error("[upload] R2 put failed", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const fileUrl = getPublicUrl(key);
  return NextResponse.json({ key, fileUrl, fileName: file.name, fileSize: file.size });
}
