import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import { config } from "dotenv";

config({ path: ".env" });

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const command = new PutBucketCorsCommand({
  Bucket: process.env.R2_BUCKET_NAME,
  CORSConfiguration: {
    CORSRules: [
      {
        AllowedOrigins: ["*"],
        AllowedMethods: ["GET", "PUT", "POST", "HEAD"],
        AllowedHeaders: ["*"],
        MaxAgeSeconds: 3600,
      },
    ],
  },
});

try {
  await r2.send(command);
  console.log("✅ R2 CORS configuration applied to bucket:", process.env.R2_BUCKET_NAME);
} catch (err) {
  console.error("❌ Failed to set CORS:", err.message);
  process.exit(1);
}
