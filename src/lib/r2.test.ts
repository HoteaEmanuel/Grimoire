import { describe, it, expect, beforeEach, vi } from "vitest";

// Set env vars before importing r2 (they're read at module init)
beforeEach(() => {
  vi.stubEnv("R2_PUBLIC_URL", "https://pub-test.r2.dev");
  vi.stubEnv("R2_ACCOUNT_ID", "test-account");
  vi.stubEnv("R2_ACCESS_KEY_ID", "test-key");
  vi.stubEnv("R2_SECRET_ACCESS_KEY", "test-secret");
  vi.stubEnv("R2_BUCKET_NAME", "test-bucket");
});

// Import after stubs are in place
const { keyFromPublicUrl, getPublicUrl } = await import("@/lib/r2");

describe("keyFromPublicUrl", () => {
  it("extracts a simple key from public URL", () => {
    const url = "https://pub-test.r2.dev/some-key.pdf";
    expect(keyFromPublicUrl(url)).toBe("some-key.pdf");
  });

  it("extracts a nested key with slashes", () => {
    const url = "https://pub-test.r2.dev/user-123/files/abc-def-myfile.pdf";
    expect(keyFromPublicUrl(url)).toBe("user-123/files/abc-def-myfile.pdf");
  });

  it("does not include a leading slash", () => {
    const url = "https://pub-test.r2.dev/path/to/image.png";
    const key = keyFromPublicUrl(url);
    expect(key.startsWith("/")).toBe(false);
  });

  it("handles a deep path correctly", () => {
    const url = "https://pub-test.r2.dev/user-id/images/uuid-photo.webp";
    expect(keyFromPublicUrl(url)).toBe("user-id/images/uuid-photo.webp");
  });
});

describe("getPublicUrl", () => {
  it("constructs public URL from a simple key", () => {
    expect(getPublicUrl("my-key.pdf")).toBe("https://pub-test.r2.dev/my-key.pdf");
  });

  it("constructs public URL from a nested key", () => {
    expect(getPublicUrl("user-1/files/doc.pdf")).toBe("https://pub-test.r2.dev/user-1/files/doc.pdf");
  });

  it("is the inverse of keyFromPublicUrl", () => {
    const key = "user-1/images/photo.png";
    const url = getPublicUrl(key);
    expect(keyFromPublicUrl(url)).toBe(key);
  });
});
