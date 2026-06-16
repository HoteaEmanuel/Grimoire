import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getItemById, getItemCardsByType } from "./items";

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

  it("returns mapped card items for a type", async () => {
    vi.mocked(prisma.item.findMany).mockResolvedValue(mockCardItems as never);

    const result = await getItemCardsByType("user-1", "snippets");

    expect(prisma.item.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1", itemType: { slug: "snippets" } },
        orderBy: [{ isPinned: "desc" }, { lastUsedAt: "desc" }, { createdAt: "desc" }],
      }),
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "item-1",
      title: "Test Snippet",
      typeName: "Snippet",
      typeColor: "#3b82f6",
      tags: ["react"],
      isPinned: true,
    });
  });

  it("returns empty array on DB failure", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(prisma.item.findMany).mockRejectedValue(new Error("DB error"));

    const result = await getItemCardsByType("user-1", "snippets");

    expect(result).toEqual([]);
    consoleSpy.mockRestore();
  });
});
