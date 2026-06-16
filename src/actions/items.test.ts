import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "@/auth";
import { updateItem } from "./items";

vi.mock("@/lib/db/items", () => ({
  updateItem: vi.fn(),
}));

import { updateItem as dbUpdateItem } from "@/lib/db/items";

const mockSession = { user: { id: "user-1" } };

const mockItemDetail = {
  id: "item-1",
  title: "Updated Title",
  description: null,
  contentKind: "TEXT" as const,
  content: "console.log('hi')",
  url: null,
  fileUrl: null,
  fileName: null,
  fileSize: null,
  language: "typescript",
  isFavorite: false,
  isPinned: false,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-05"),
  lastUsedAt: null,
  typeName: "Snippet",
  typeSlug: "snippets",
  typeColor: "#3b82f6",
  typeIconName: "Code",
  tags: ["react"],
  collections: [],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateItem server action", () => {
  describe("auth checks", () => {
    it("returns error when unauthenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const result = await updateItem("item-1", { title: "Title", tags: [] });

      expect(result).toEqual({ success: false, error: "Unauthorized" });
      expect(dbUpdateItem).not.toHaveBeenCalled();
    });

    it("returns error when session has no user id", async () => {
      vi.mocked(auth).mockResolvedValue({ user: {} } as never);

      const result = await updateItem("item-1", { title: "Title", tags: [] });

      expect(result).toEqual({ success: false, error: "Unauthorized" });
    });
  });

  describe("input validation", () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue(mockSession as never);
    });

    it("rejects empty title", async () => {
      const result = await updateItem("item-1", { title: "", tags: [] });

      expect(result).toEqual({ success: false, error: "Title is required" });
      expect(dbUpdateItem).not.toHaveBeenCalled();
    });

    it("rejects whitespace-only title", async () => {
      const result = await updateItem("item-1", { title: "   ", tags: [] });

      expect(result).toEqual({ success: false, error: "Title is required" });
    });

    it("rejects invalid URL", async () => {
      const result = await updateItem("item-1", {
        title: "Title",
        url: "not-a-url",
        tags: [],
      });

      expect(result).toEqual({ success: false, error: "Must be a valid URL" });
      expect(dbUpdateItem).not.toHaveBeenCalled();
    });

    it("accepts valid URL", async () => {
      vi.mocked(dbUpdateItem).mockResolvedValue(mockItemDetail);

      const result = await updateItem("item-1", {
        title: "Title",
        url: "https://example.com",
        tags: [],
      });

      expect(result.success).toBe(true);
    });

    it("accepts null URL", async () => {
      vi.mocked(dbUpdateItem).mockResolvedValue(mockItemDetail);

      const result = await updateItem("item-1", { title: "Title", url: null, tags: [] });

      expect(result.success).toBe(true);
    });
  });

  describe("successful update", () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue(mockSession as never);
      vi.mocked(dbUpdateItem).mockResolvedValue(mockItemDetail);
    });

    it("returns updated item on success", async () => {
      const result = await updateItem("item-1", {
        title: "Updated Title",
        description: null,
        content: "console.log('hi')",
        url: null,
        language: "typescript",
        tags: ["react"],
      });

      expect(result).toEqual({ success: true, data: mockItemDetail });
    });

    it("passes trimmed title to db function", async () => {
      await updateItem("item-1", { title: "  My Title  ", tags: [] });

      expect(dbUpdateItem).toHaveBeenCalledWith(
        "user-1",
        "item-1",
        expect.objectContaining({ title: "My Title" }),
      );
    });

    it("converts optional fields to null when omitted", async () => {
      await updateItem("item-1", { title: "Title", tags: [] });

      expect(dbUpdateItem).toHaveBeenCalledWith(
        "user-1",
        "item-1",
        expect.objectContaining({
          description: null,
          content: null,
          url: null,
          language: null,
        }),
      );
    });
  });

  describe("db failure", () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue(mockSession as never);
    });

    it("returns error when db update returns null", async () => {
      vi.mocked(dbUpdateItem).mockResolvedValue(null);

      const result = await updateItem("item-1", { title: "Title", tags: [] });

      expect(result).toEqual({ success: false, error: "Failed to save changes" });
    });
  });
});
