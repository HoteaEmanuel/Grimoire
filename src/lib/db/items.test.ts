import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  getItemById,
  getItemCardsByType,
  getItemCardsByCollection,
  getFavoriteItems,
  getSearchIndexItems,
  updateItem,
  createItem,
  toggleItemFavorite,
} from "./items";

const mockPrismaItem = {
  id: "item-1",
  title: "Test Snippet",
  description: "A test",
  contentKind: "TEXT" as const,
  content: "console.log('hi')",
  url: null,
  fileUrl: null,
  fileName: null,
  fileSize: null,
  language: "typescript",
  isFavorite: false,
  isPinned: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-02"),
  lastUsedAt: new Date("2024-01-03"),
  itemType: { name: "Snippet", slug: "snippets", color: "#3b82f6", icon: "Code" },
  tags: [{ tag: { name: "react" } }, { tag: { name: "hooks" } }],
  collections: [{ collection: { id: "col-1", name: "React Patterns" } }],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getItemById", () => {
  it("returns mapped item when found", async () => {
    vi.mocked(prisma.item.findFirst).mockResolvedValue(mockPrismaItem as never);

    const result = await getItemById("user-1", "item-1");

    expect(prisma.item.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "item-1", userId: "user-1" } }),
    );
    expect(result).toMatchObject({
      id: "item-1",
      title: "Test Snippet",
      language: "typescript",
      typeName: "Snippet",
      typeColor: "#3b82f6",
      typeIconName: "Code",
      tags: ["react", "hooks"],
      collections: [{ id: "col-1", name: "React Patterns" }],
      isFavorite: false,
      isPinned: true,
    });
  });

  it("returns null when item not found", async () => {
    vi.mocked(prisma.item.findFirst).mockResolvedValue(null);

    const result = await getItemById("user-1", "not-found");

    expect(result).toBeNull();
  });

  it("returns null and logs error on DB failure", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(prisma.item.findFirst).mockRejectedValue(new Error("DB error"));

    const result = await getItemById("user-1", "item-1");

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith("[getItemById]", expect.any(Error));
    consoleSpy.mockRestore();
  });
});

describe("updateItem", () => {
  const updatedPrismaItem = {
    id: "item-1",
    title: "Updated Title",
    description: "Updated desc",
    contentKind: "TEXT" as const,
    content: "new content",
    url: null,
    fileUrl: null,
    fileName: null,
    fileSize: null,
    language: "python",
    isFavorite: false,
    isPinned: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-05"),
    lastUsedAt: null,
    itemType: { name: "Snippet", slug: "snippets", color: "#3b82f6", icon: "Code" },
    tags: [{ tag: { name: "python" } }],
    collections: [],
  };

  const txMock = {
    tagsOnItems: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
    itemCollection: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
    collection: { findMany: vi.fn().mockResolvedValue([]) },
    item: { update: vi.fn().mockResolvedValue(updatedPrismaItem) },
  };

  beforeEach(() => {
    txMock.tagsOnItems.deleteMany.mockResolvedValue({ count: 1 });
    txMock.itemCollection.deleteMany.mockResolvedValue({ count: 1 });
    txMock.collection.findMany.mockResolvedValue([]);
    txMock.item.update.mockResolvedValue(updatedPrismaItem);
    vi.mocked(prisma.$transaction).mockImplementation(
      async (fn: unknown) => (typeof fn === "function" ? fn(txMock) : Promise.resolve()),
    );
  });

  const data = {
    title: "Updated Title",
    description: "Updated desc",
    content: "new content",
    url: null,
    language: "python",
    tags: ["python"],
    collectionIds: [],
  };

  it("deletes existing tags and updates item in a transaction", async () => {
    const result = await updateItem("user-1", "item-1", data);

    expect(txMock.tagsOnItems.deleteMany).toHaveBeenCalledWith({
      where: { itemId: "item-1", item: { userId: "user-1" } },
    });
    expect(txMock.itemCollection.deleteMany).toHaveBeenCalledWith({
      where: { itemId: "item-1", item: { userId: "user-1" } },
    });
    expect(txMock.item.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "item-1", userId: "user-1" } }),
    );
    expect(result).toMatchObject({
      id: "item-1",
      title: "Updated Title",
      language: "python",
      tags: ["python"],
      collections: [],
    });
  });

  it("passes correct data fields to item.update", async () => {
    await updateItem("user-1", "item-1", data);

    expect(txMock.item.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: "Updated Title",
          description: "Updated desc",
          content: "new content",
          url: null,
          language: "python",
        }),
      }),
    );
  });

  it("returns null and logs error on transaction failure", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(prisma.$transaction).mockRejectedValue(new Error("TX failed"));

    const result = await updateItem("user-1", "item-1", data);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith("[updateItem]", expect.any(Error));
    consoleSpy.mockRestore();
  });
});

describe("createItem", () => {
  const mockCreatedItem = {
    id: "item-new",
    title: "New Snippet",
    description: null,
    contentKind: "TEXT" as const,
    content: "console.log('new')",
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
    itemType: { name: "Snippet", slug: "snippets", color: "#3b82f6", icon: "Code" },
    tags: [{ tag: { name: "react" } }],
    collections: [],
  };

  beforeEach(() => {
    vi.mocked(prisma.itemType.findUnique).mockResolvedValue({ id: "type-1" } as never);
    vi.mocked(prisma.item.create).mockResolvedValue(mockCreatedItem as never);
  });

  it("looks up item type by slug", async () => {
    await createItem("user-1", {
      typeSlug: "snippets",
      title: "New Snippet",
      description: null,
      content: null,
      url: null,
      language: null,
      tags: [],
    });

    expect(prisma.itemType.findUnique).toHaveBeenCalledWith({
      where: { slug: "snippets" },
      select: { id: true },
    });
  });

  it("returns null when item type not found", async () => {
    vi.mocked(prisma.itemType.findUnique).mockResolvedValue(null);

    const result = await createItem("user-1", {
      typeSlug: "snippets",
      title: "New Snippet",
      description: null,
      content: null,
      url: null,
      language: null,
      tags: [],
    });

    expect(result).toBeNull();
    expect(prisma.item.create).not.toHaveBeenCalled();
  });

  it("creates item with correct contentKind for text types", async () => {
    await createItem("user-1", {
      typeSlug: "snippets",
      title: "New Snippet",
      description: null,
      content: "code",
      url: null,
      language: "typescript",
      tags: [],
    });

    expect(prisma.item.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          itemTypeId: "type-1",
          contentKind: "TEXT",
          title: "New Snippet",
          language: "typescript",
        }),
      }),
    );
  });

  it("creates item with URL contentKind for link type", async () => {
    vi.mocked(prisma.itemType.findUnique).mockResolvedValue({ id: "type-link" } as never);

    await createItem("user-1", {
      typeSlug: "links",
      title: "My Link",
      description: null,
      content: null,
      url: "https://example.com",
      language: null,
      tags: [],
    });

    expect(prisma.item.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contentKind: "URL",
          url: "https://example.com",
        }),
      }),
    );
  });

  it("returns mapped item on success", async () => {
    const result = await createItem("user-1", {
      typeSlug: "snippets",
      title: "New Snippet",
      description: null,
      content: "console.log('new')",
      url: null,
      language: "typescript",
      tags: ["react"],
    });

    expect(result).toMatchObject({
      id: "item-new",
      title: "New Snippet",
      contentKind: "TEXT",
      typeName: "Snippet",
      typeSlug: "snippets",
      typeColor: "#3b82f6",
      tags: ["react"],
      collections: [],
    });
  });

  it("returns null and logs error on DB failure", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(prisma.item.create).mockRejectedValue(new Error("DB error"));

    const result = await createItem("user-1", {
      typeSlug: "snippets",
      title: "New Snippet",
      description: null,
      content: null,
      url: null,
      language: null,
      tags: [],
    });

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith("[createItem]", expect.any(Error));
    consoleSpy.mockRestore();
  });
});

describe("getItemCardsByType", () => {
  const mockCardItems = [
    {
      id: "item-1",
      title: "Test Snippet",
      description: "A test",
      isPinned: true,
      isFavorite: false,
      language: "typescript",
      lastUsedAt: new Date("2024-01-03"),
      itemType: { name: "Snippet", color: "#3b82f6", icon: "Code" },
      tags: [{ tag: { name: "react" } }],
    },
  ];

  it("returns mapped card items for a type with pagination args", async () => {
    vi.mocked(prisma.item.findMany).mockResolvedValue(mockCardItems as never);
    vi.mocked(prisma.item.count).mockResolvedValue(1);

    const result = await getItemCardsByType("user-1", "snippets", 1);

    expect(prisma.item.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1", itemType: { slug: "snippets" } },
        orderBy: [{ isPinned: "desc" }, { lastUsedAt: "desc" }, { createdAt: "desc" }],
        skip: 0,
        take: 21,
      }),
    );
    expect(result.totalCount).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      id: "item-1",
      title: "Test Snippet",
      typeName: "Snippet",
      typeColor: "#3b82f6",
      tags: ["react"],
      isPinned: true,
    });
  });

  it("applies skip offset for page 2", async () => {
    vi.mocked(prisma.item.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.item.count).mockResolvedValue(0);

    await getItemCardsByType("user-1", "snippets", 2);

    expect(prisma.item.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 21, take: 21 }),
    );
  });

  it("returns empty result on DB failure", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(prisma.item.findMany).mockRejectedValue(new Error("DB error"));

    const result = await getItemCardsByType("user-1", "snippets");

    expect(result).toEqual({ items: [], totalCount: 0 });
    consoleSpy.mockRestore();
  });
});

describe("getFavoriteItems", () => {
  const mockFavoriteItems = [
    {
      id: "item-1",
      title: "Favorited Snippet",
      description: "A test",
      content: "console.log('hi')",
      url: null,
      isPinned: false,
      isFavorite: true,
      language: "typescript",
      lastUsedAt: new Date("2024-01-03"),
      createdAt: new Date("2024-01-01"),
      fileUrl: null,
      fileName: null,
      fileSize: null,
      itemType: { name: "Snippet", slug: "snippets", color: "#3b82f6", icon: "Code" },
      tags: [{ tag: { name: "react" } }],
    },
  ];

  it("returns favorited items ordered by most recently updated", async () => {
    vi.mocked(prisma.item.findMany).mockResolvedValue(mockFavoriteItems as never);

    const result = await getFavoriteItems("user-1");

    expect(prisma.item.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1", isFavorite: true },
        orderBy: { updatedAt: "desc" },
      }),
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "item-1",
      title: "Favorited Snippet",
      typeName: "Snippet",
      isFavorite: true,
      tags: ["react"],
    });
  });

  it("returns empty array on DB failure", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(prisma.item.findMany).mockRejectedValue(new Error("DB error"));

    const result = await getFavoriteItems("user-1");

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith("[getFavoriteItems]", expect.any(Error));
    consoleSpy.mockRestore();
  });
});

describe("getSearchIndexItems", () => {
  const mockSearchItems = [
    {
      id: "item-1",
      title: "Test Snippet",
      description: "A test",
      content: "console.log('hi')",
      itemType: { slug: "snippets", color: "#3b82f6", icon: "Code" },
    },
    {
      id: "item-2",
      title: "No description",
      description: null,
      content: "fallback content",
      itemType: { slug: "notes", color: "#fde047", icon: "StickyNote" },
    },
  ];

  it("returns lightweight mapped items ordered by lastUsedAt", async () => {
    vi.mocked(prisma.item.findMany).mockResolvedValue(mockSearchItems as never);

    const result = await getSearchIndexItems("user-1");

    expect(prisma.item.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        orderBy: { lastUsedAt: "desc" },
      }),
    );
    expect(result).toEqual([
      {
        id: "item-1",
        title: "Test Snippet",
        preview: "A test",
        typeSlug: "snippets",
        typeColor: "#3b82f6",
        typeIconName: "Code",
      },
      {
        id: "item-2",
        title: "No description",
        preview: "fallback content",
        typeSlug: "notes",
        typeColor: "#fde047",
        typeIconName: "StickyNote",
      },
    ]);
  });

  it("returns empty array on DB failure", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(prisma.item.findMany).mockRejectedValue(new Error("DB error"));

    const result = await getSearchIndexItems("user-1");

    expect(result).toEqual([]);
    consoleSpy.mockRestore();
  });
});

describe("toggleItemFavorite", () => {
  it("returns true when a matching item is updated", async () => {
    vi.mocked(prisma.item.updateMany).mockResolvedValue({ count: 1 });

    const result = await toggleItemFavorite("user-1", "item-1", true);

    expect(prisma.item.updateMany).toHaveBeenCalledWith({
      where: { id: "item-1", userId: "user-1" },
      data: { isFavorite: true },
    });
    expect(result).toBe(true);
  });

  it("returns false when no matching item is found", async () => {
    vi.mocked(prisma.item.updateMany).mockResolvedValue({ count: 0 });

    const result = await toggleItemFavorite("user-1", "missing", false);

    expect(result).toBe(false);
  });

  it("returns false and logs error on DB failure", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(prisma.item.updateMany).mockRejectedValue(new Error("DB error"));

    const result = await toggleItemFavorite("user-1", "item-1", true);

    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith("[toggleItemFavorite]", expect.any(Error));
    consoleSpy.mockRestore();
  });
});

describe("getItemCardsByCollection", () => {
  const mockCardItems = [
    {
      id: "item-1",
      title: "Test Snippet",
      description: "A test",
      isPinned: true,
      isFavorite: false,
      language: "typescript",
      lastUsedAt: new Date("2024-01-03"),
      itemType: { name: "Snippet", color: "#3b82f6", icon: "Code" },
      tags: [{ tag: { name: "react" } }],
    },
  ];

  it("returns mapped card items belonging to a collection with pagination args", async () => {
    vi.mocked(prisma.item.findMany).mockResolvedValue(mockCardItems as never);
    vi.mocked(prisma.item.count).mockResolvedValue(1);

    const result = await getItemCardsByCollection("user-1", "col-1", 1);

    expect(prisma.item.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1", collections: { some: { collectionId: "col-1" } } },
        orderBy: [{ isPinned: "desc" }, { lastUsedAt: "desc" }, { createdAt: "desc" }],
        skip: 0,
        take: 21,
      }),
    );
    expect(result.totalCount).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      id: "item-1",
      title: "Test Snippet",
      typeName: "Snippet",
      tags: ["react"],
    });
  });

  it("returns empty result on DB failure", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(prisma.item.findMany).mockRejectedValue(new Error("DB error"));

    const result = await getItemCardsByCollection("user-1", "col-1");

    expect(result).toEqual({ items: [], totalCount: 0 });
    consoleSpy.mockRestore();
  });
});
