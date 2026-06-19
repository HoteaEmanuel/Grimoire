import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "@/auth";
import { updateItem, deleteItem, createItem, toggleItemFavorite, toggleItemPin } from "./items";
import { prisma } from "@/lib/prisma";
import { deleteR2Object } from "@/lib/r2";

vi.mock("@/lib/db/items", () => ({
  updateItem: vi.fn(),
  createItem: vi.fn(),
  toggleItemFavorite: vi.fn(),
  toggleItemPin: vi.fn(),
}));

import { updateItem as dbUpdateItem } from "@/lib/db/items";
import { createItem as dbCreateItem } from "@/lib/db/items";
import { toggleItemFavorite as dbToggleItemFavorite } from "@/lib/db/items";
import { toggleItemPin as dbToggleItemPin } from "@/lib/db/items";

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

describe("createItem server action", () => {
  const mockCreatedItem = {
    id: "item-new",
    title: "New Snippet",
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
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
    lastUsedAt: null,
    typeName: "Snippet",
    typeSlug: "snippets",
    typeColor: "#3b82f6",
    typeIconName: "Code",
    tags: [],
    collections: [],
  };

  describe("auth checks", () => {
    it("returns error when unauthenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const result = await createItem({ typeSlug: "snippets", title: "Title" });

      expect(result).toEqual({ success: false, error: "Unauthorized" });
      expect(dbCreateItem).not.toHaveBeenCalled();
    });

    it("returns error when session has no user id", async () => {
      vi.mocked(auth).mockResolvedValue({ user: {} } as never);

      const result = await createItem({ typeSlug: "snippets", title: "Title" });

      expect(result).toEqual({ success: false, error: "Unauthorized" });
    });
  });

  describe("input validation", () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue(mockSession as never);
    });

    it("rejects empty title", async () => {
      const result = await createItem({ typeSlug: "snippets", title: "" });

      expect(result).toEqual({ success: false, error: "Title is required" });
      expect(dbCreateItem).not.toHaveBeenCalled();
    });

    it("rejects invalid type slug", async () => {
      const result = await createItem({ typeSlug: "invalid-type" as never, title: "Title" });

      expect(result.success).toBe(false);
      expect(dbCreateItem).not.toHaveBeenCalled();
    });

    it("rejects link without URL", async () => {
      const result = await createItem({ typeSlug: "links", title: "My Link" });

      expect(result).toEqual({ success: false, error: "URL is required" });
      expect(dbCreateItem).not.toHaveBeenCalled();
    });

    it("rejects link with invalid URL", async () => {
      const result = await createItem({ typeSlug: "links", title: "My Link", url: "not-a-url" });

      expect(result.success).toBe(false);
      expect(dbCreateItem).not.toHaveBeenCalled();
    });

    it("accepts link with valid URL", async () => {
      vi.mocked(dbCreateItem).mockResolvedValue(mockCreatedItem);

      const result = await createItem({ typeSlug: "links", title: "My Link", url: "https://example.com" });

      expect(result.success).toBe(true);
    });
  });

  describe("successful create", () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue(mockSession as never);
      vi.mocked(dbCreateItem).mockResolvedValue(mockCreatedItem);
    });

    it("returns created item on success", async () => {
      const result = await createItem({ typeSlug: "snippets", title: "New Snippet" });

      expect(result).toEqual({ success: true, data: mockCreatedItem });
    });

    it("passes userId and form data to db function", async () => {
      await createItem({
        typeSlug: "snippets",
        title: "  My Snippet  ",
        description: "desc",
        content: "code",
        language: "typescript",
      });

      expect(dbCreateItem).toHaveBeenCalledWith(
        "user-1",
        expect.objectContaining({
          typeSlug: "snippets",
          title: "My Snippet",
          description: "desc",
          content: "code",
          language: "typescript",
        }),
      );
    });

    it("strips content and language for link type", async () => {
      await createItem({ typeSlug: "links", title: "My Link", url: "https://example.com" });

      expect(dbCreateItem).toHaveBeenCalledWith(
        "user-1",
        expect.objectContaining({ content: null, language: null, url: "https://example.com" }),
      );
    });

    it("passes fileUrl, fileName, fileSize to db for file type", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: true } } as never);

      await createItem({
        typeSlug: "files",
        title: "My PDF",
        fileUrl: "https://pub-test.r2.dev/user-1/files/doc.pdf",
        fileName: "doc.pdf",
        fileSize: 20480,
      });

      expect(dbCreateItem).toHaveBeenCalledWith(
        "user-1",
        expect.objectContaining({
          typeSlug: "files",
          fileUrl: "https://pub-test.r2.dev/user-1/files/doc.pdf",
          fileName: "doc.pdf",
          fileSize: 20480,
        }),
      );
    });

    it("passes fileUrl, fileName, fileSize to db for image type", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: true } } as never);

      await createItem({
        typeSlug: "images",
        title: "My Photo",
        fileUrl: "https://pub-test.r2.dev/user-1/images/photo.png",
        fileName: "photo.png",
        fileSize: 512000,
      });

      expect(dbCreateItem).toHaveBeenCalledWith(
        "user-1",
        expect.objectContaining({
          typeSlug: "images",
          fileUrl: "https://pub-test.r2.dev/user-1/images/photo.png",
        }),
      );
    });
  });

  describe("file type validation", () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue(mockSession as never);
    });

    it("rejects file type without fileUrl", async () => {
      const result = await createItem({ typeSlug: "files", title: "My File" });

      expect(result).toEqual({ success: false, error: "File upload is required" });
      expect(dbCreateItem).not.toHaveBeenCalled();
    });

    it("rejects image type without fileUrl", async () => {
      const result = await createItem({ typeSlug: "images", title: "My Image" });

      expect(result).toEqual({ success: false, error: "File upload is required" });
      expect(dbCreateItem).not.toHaveBeenCalled();
    });
  });

  describe("db failure", () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue(mockSession as never);
    });

    it("returns error when db create returns null", async () => {
      vi.mocked(dbCreateItem).mockResolvedValue(null);

      const result = await createItem({ typeSlug: "snippets", title: "Title" });

      expect(result).toEqual({ success: false, error: "Failed to create item" });
    });
  });

  describe("free-tier limits", () => {
    it("succeeds when free user is under the item limit", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: false } } as never);
      vi.mocked(prisma.item.count).mockResolvedValue(49);
      vi.mocked(dbCreateItem).mockResolvedValue(mockCreatedItem);

      const result = await createItem({ typeSlug: "snippets", title: "Title" });

      expect(result.success).toBe(true);
    });

    it("rejects when free user is at the item limit", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: false } } as never);
      vi.mocked(prisma.item.count).mockResolvedValue(50);

      const result = await createItem({ typeSlug: "snippets", title: "Title" });

      expect(result).toEqual({ success: false, error: "Free plan is limited to 50 items" });
      expect(dbCreateItem).not.toHaveBeenCalled();
    });

    it("succeeds when Pro user is at the item limit", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: true } } as never);
      vi.mocked(prisma.item.count).mockResolvedValue(100);
      vi.mocked(dbCreateItem).mockResolvedValue(mockCreatedItem);

      const result = await createItem({ typeSlug: "snippets", title: "Title" });

      expect(result.success).toBe(true);
      expect(prisma.item.count).not.toHaveBeenCalled();
    });

    it("rejects file type for free user even under the item limit", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: false } } as never);

      const result = await createItem({
        typeSlug: "files",
        title: "My File",
        fileUrl: "https://pub-test.r2.dev/user-1/files/doc.pdf",
      });

      expect(result).toEqual({ success: false, error: "Files and images are a Pro feature" });
      expect(dbCreateItem).not.toHaveBeenCalled();
    });

    it("succeeds creating a file item for a Pro user", async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: true } } as never);
      vi.mocked(dbCreateItem).mockResolvedValue(mockCreatedItem);

      const result = await createItem({
        typeSlug: "files",
        title: "My File",
        fileUrl: "https://pub-test.r2.dev/user-1/files/doc.pdf",
      });

      expect(result.success).toBe(true);
    });
  });
});

describe("toggleItemFavorite server action", () => {
  describe("auth checks", () => {
    it("returns error when unauthenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const result = await toggleItemFavorite("item-1", true);

      expect(result).toEqual({ success: false, error: "Unauthorized" });
      expect(dbToggleItemFavorite).not.toHaveBeenCalled();
    });
  });

  describe("successful toggle", () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue(mockSession as never);
    });

    it("passes userId, itemId, and isFavorite to db function", async () => {
      vi.mocked(dbToggleItemFavorite).mockResolvedValue(true);

      const result = await toggleItemFavorite("item-1", true);

      expect(dbToggleItemFavorite).toHaveBeenCalledWith("user-1", "item-1", true);
      expect(result).toEqual({ success: true });
    });
  });

  describe("db failure", () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue(mockSession as never);
    });

    it("returns error when db update returns false", async () => {
      vi.mocked(dbToggleItemFavorite).mockResolvedValue(false);

      const result = await toggleItemFavorite("item-1", true);

      expect(result).toEqual({ success: false, error: "Failed to update favorite" });
    });
  });
});

describe("toggleItemPin server action", () => {
  describe("auth checks", () => {
    it("returns error when unauthenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const result = await toggleItemPin("item-1", true);

      expect(result).toEqual({ success: false, error: "Unauthorized" });
      expect(dbToggleItemPin).not.toHaveBeenCalled();
    });
  });

  describe("successful toggle", () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue(mockSession as never);
    });

    it("passes userId, itemId, and isPinned to db function", async () => {
      vi.mocked(dbToggleItemPin).mockResolvedValue(true);

      const result = await toggleItemPin("item-1", true);

      expect(dbToggleItemPin).toHaveBeenCalledWith("user-1", "item-1", true);
      expect(result).toEqual({ success: true });
    });
  });

  describe("db failure", () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue(mockSession as never);
    });

    it("returns error when db update returns false", async () => {
      vi.mocked(dbToggleItemPin).mockResolvedValue(false);

      const result = await toggleItemPin("item-1", true);

      expect(result).toEqual({ success: false, error: "Failed to update pin" });
    });
  });
});

describe("deleteItem server action", () => {
  describe("auth checks", () => {
    it("returns error when unauthenticated", async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const result = await deleteItem("item-1");

      expect(result).toEqual({ success: false, error: "Unauthorized" });
      expect(prisma.item.deleteMany).not.toHaveBeenCalled();
    });

    it("returns error when session has no user id", async () => {
      vi.mocked(auth).mockResolvedValue({ user: {} } as never);

      const result = await deleteItem("item-1");

      expect(result).toEqual({ success: false, error: "Unauthorized" });
    });
  });

  describe("ownership check", () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue(mockSession as never);
    });

    it("returns error when item not found or belongs to another user", async () => {
      vi.mocked(prisma.item.findFirst).mockResolvedValue(null);

      const result = await deleteItem("item-999");

      expect(result).toEqual({ success: false, error: "Item not found" });
    });

    it("passes userId as ownership filter to deleteMany", async () => {
      vi.mocked(prisma.item.findFirst).mockResolvedValue({ fileUrl: null } as never);
      vi.mocked(prisma.item.deleteMany).mockResolvedValue({ count: 1 });

      await deleteItem("item-1");

      expect(prisma.item.deleteMany).toHaveBeenCalledWith({
        where: { id: "item-1", userId: "user-1" },
      });
    });
  });

  describe("successful delete", () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue(mockSession as never);
      vi.mocked(prisma.item.findFirst).mockResolvedValue({ fileUrl: null } as never);
      vi.mocked(prisma.item.deleteMany).mockResolvedValue({ count: 1 });
    });

    it("returns success when item is deleted", async () => {
      const result = await deleteItem("item-1");

      expect(result).toEqual({ success: true });
    });
  });

  describe("db error", () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue(mockSession as never);
      vi.mocked(prisma.item.findFirst).mockResolvedValue({ fileUrl: null } as never);
    });

    it("returns error when prisma throws", async () => {
      vi.mocked(prisma.item.deleteMany).mockRejectedValue(new Error("DB error"));

      const result = await deleteItem("item-1");

      expect(result).toEqual({ success: false, error: "Failed to delete item" });
    });
  });

  describe("R2 cleanup on delete", () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue(mockSession as never);
      vi.mocked(prisma.item.deleteMany).mockResolvedValue({ count: 1 });
    });

    it("calls deleteR2Object when item has a fileUrl", async () => {
      vi.mocked(prisma.item.findFirst).mockResolvedValue({
        fileUrl: "https://pub-test.r2.dev/user-1/files/doc.pdf",
      } as never);

      await deleteItem("item-1");

      expect(deleteR2Object).toHaveBeenCalledWith("user-1/files/doc.pdf");
    });

    it("does not call deleteR2Object when item has no fileUrl", async () => {
      vi.mocked(prisma.item.findFirst).mockResolvedValue({ fileUrl: null } as never);

      await deleteItem("item-1");

      expect(deleteR2Object).not.toHaveBeenCalled();
    });

    it("still returns success when R2 delete throws", async () => {
      vi.mocked(prisma.item.findFirst).mockResolvedValue({
        fileUrl: "https://pub-test.r2.dev/user-1/files/doc.pdf",
      } as never);
      vi.mocked(deleteR2Object).mockRejectedValue(new Error("R2 error"));

      const result = await deleteItem("item-1");

      expect(result).toEqual({ success: true });
    });
  });
});
