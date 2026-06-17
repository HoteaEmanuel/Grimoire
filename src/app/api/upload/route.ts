import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getPublicUrl } from "@/lib/r2";
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

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  const key = `${session.user.id}/${typeSlug}/${randomUUID()}-${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: file.type,
    ContentLength: file.size,
  }));

  const fileUrl = getPublicUrl(key);
  return NextResponse.json({ key, fileUrl, fileName: file.name, fileSize: file.size });
}
