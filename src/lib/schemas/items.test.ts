import { describe, it, expect } from "vitest";
import { createItemSchema } from "./items";

describe("createItemSchema", () => {
  describe("valid inputs", () => {
    it("accepts a minimal snippet", () => {
      const result = createItemSchema.safeParse({ typeSlug: "snippets", title: "My snippet" });
      expect(result.success).toBe(true);
    });

    it("accepts a link with a valid URL", () => {
      const result = createItemSchema.safeParse({ typeSlug: "links", title: "Link", url: "https://example.com" });
      expect(result.success).toBe(true);
    });

    it("accepts a file type with fileUrl provided", () => {
      const result = createItemSchema.safeParse({
        typeSlug: "files",
        title: "My PDF",
        fileUrl: "https://pub-test.r2.dev/user-1/files/doc.pdf",
        fileName: "doc.pdf",
        fileSize: 1024,
      });
      expect(result.success).toBe(true);
    });

    it("accepts an image type with fileUrl provided", () => {
      const result = createItemSchema.safeParse({
        typeSlug: "images",
        title: "My Photo",
        fileUrl: "https://pub-test.r2.dev/user-1/images/photo.png",
        fileName: "photo.png",
        fileSize: 512000,
      });
      expect(result.success).toBe(true);
    });

    it("defaults tags to empty array when not provided", () => {
      const result = createItemSchema.safeParse({ typeSlug: "snippets", title: "Title" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.tags).toEqual([]);
    });
  });

  describe("invalid inputs", () => {
    it("rejects empty title", () => {
      const result = createItemSchema.safeParse({ typeSlug: "snippets", title: "" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Title is required");
      }
    });

    it("rejects unknown type slug", () => {
      const result = createItemSchema.safeParse({ typeSlug: "custom", title: "Title" });
      expect(result.success).toBe(false);
    });

    it("rejects link type without URL", () => {
      const result = createItemSchema.safeParse({ typeSlug: "links", title: "My Link" });
      expect(result.success).toBe(false);
      if (!result.success) {
        const urlIssue = result.error.issues.find((i) => i.path.includes("url"));
        expect(urlIssue?.message).toBe("URL is required");
      }
    });

    it("rejects link type with invalid URL", () => {
      const result = createItemSchema.safeParse({ typeSlug: "links", title: "My Link", url: "not-a-url" });
      expect(result.success).toBe(false);
    });

    it("rejects file type without fileUrl", () => {
      const result = createItemSchema.safeParse({ typeSlug: "files", title: "My File" });
      expect(result.success).toBe(false);
      if (!result.success) {
        const fileIssue = result.error.issues.find((i) => i.path.includes("fileUrl"));
        expect(fileIssue?.message).toBe("File upload is required");
      }
    });

    it("rejects image type without fileUrl", () => {
      const result = createItemSchema.safeParse({ typeSlug: "images", title: "My Image" });
      expect(result.success).toBe(false);
      if (!result.success) {
        const fileIssue = result.error.issues.find((i) => i.path.includes("fileUrl"));
        expect(fileIssue?.message).toBe("File upload is required");
      }
    });
  });
});
