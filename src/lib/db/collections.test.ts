import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { createCollection, getAllCollections, getCollectionDetail } from "./collections";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createCollection", () => {
  it("creates a collection scoped to the user and returns default meta", async () => {
    vi.mocked(prisma.collection.create).mockResolvedValue({
      id: "col-1",
      name: "React Patterns",
      description: "Reusable hooks and patterns",
      isFavorite: false,
      createdAt: new Date("2024-01-01"),
    } as never);

    const result = await createCollection("user-1", {
      name: "React Patterns",
      description: "Reusable hooks and patterns",
    });

    expect(prisma.collection.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        name: "React Patterns",
        description: "Reusable hooks and patterns",
      },
      select: {
        id: true,
        name: true,
        description: true,
        isFavorite: true,
        createdAt: true,
      },
    });

    expect(result).toEqual({
      id: "col-1",
      name: "React Patterns",
      description: "Reusable hooks and patterns",
      isFavorite: false,
      itemCount: 0,
      dominantTypeColor: "#6b7280",
      typeIcons: [],
      createdAt: new Date("2024-01-01"),
    });
  });

  it("returns null when prisma throws", async () => {
    vi.mocked(prisma.collection.create).mockRejectedValue(new Error("db error"));

    const result = await createCollection("user-1", { name: "Broken", description: null });

    expect(result).toBeNull();
  });
});

describe("getAllCollections", () => {
  it("maps collections with dominant type color and icons", async () => {
    vi.mocked(prisma.collection.findMany).mockResolvedValue([
      {
        id: "col-1",
        name: "React Patterns",
        description: null,
        isFavorite: false,
        createdAt: new Date("2024-01-01"),
        _count: { items: 2 },
        items: [
          { item: { itemType: { id: "type-1", color: "#3b82f6", icon: "Code" } } },
          { item: { itemType: { id: "type-1", color: "#3b82f6", icon: "Code" } } },
        ],
      },
    ] as never);

    const result = await getAllCollections("user-1");

    expect(prisma.collection.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" } }),
    );
    expect(result).toEqual([
      {
        id: "col-1",
        name: "React Patterns",
        description: null,
        isFavorite: false,
        itemCount: 2,
        dominantTypeColor: "#3b82f6",
        typeIcons: [{ iconName: "Code", color: "#3b82f6" }],
        createdAt: new Date("2024-01-01"),
      },
    ]);
  });

  it("returns empty array when prisma throws", async () => {
    vi.mocked(prisma.collection.findMany).mockRejectedValue(new Error("db error"));

    const result = await getAllCollections("user-1");

    expect(result).toEqual([]);
  });
});

describe("getCollectionDetail", () => {
  it("returns collection scoped to the owning user", async () => {
    vi.mocked(prisma.collection.findFirst).mockResolvedValue({
      id: "col-1",
      name: "React Patterns",
      description: "Hooks",
      isFavorite: true,
      _count: { items: 5 },
    } as never);

    const result = await getCollectionDetail("user-1", "col-1");

    expect(prisma.collection.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "col-1", userId: "user-1" } }),
    );
    expect(result).toEqual({
      id: "col-1",
      name: "React Patterns",
      description: "Hooks",
      isFavorite: true,
      itemCount: 5,
    });
  });

  it("returns null when collection is not found", async () => {
    vi.mocked(prisma.collection.findFirst).mockResolvedValue(null);

    const result = await getCollectionDetail("user-1", "missing");

    expect(result).toBeNull();
  });

  it("returns null when prisma throws", async () => {
    vi.mocked(prisma.collection.findFirst).mockRejectedValue(new Error("db error"));

    const result = await getCollectionDetail("user-1", "col-1");

    expect(result).toBeNull();
  });
});
