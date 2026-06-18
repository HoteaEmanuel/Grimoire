import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  createCollection,
  getCollections,
  getCollectionDetail,
  getSearchIndexCollections,
  updateCollection,
  deleteCollection,
} from "./collections";

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

describe("getCollections", () => {
  it("maps collections with dominant type color and icons, paginated", async () => {
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
    vi.mocked(prisma.collection.count).mockResolvedValue(1);

    const result = await getCollections("user-1", 1);

    expect(prisma.collection.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" }, skip: 0, take: 21 }),
    );
    expect(result.totalCount).toBe(1);
    expect(result.collections).toEqual([
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

  it("applies skip offset for page 2", async () => {
    vi.mocked(prisma.collection.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.collection.count).mockResolvedValue(0);

    await getCollections("user-1", 2);

    expect(prisma.collection.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 21, take: 21 }),
    );
  });

  it("returns empty result when prisma throws", async () => {
    vi.mocked(prisma.collection.findMany).mockRejectedValue(new Error("db error"));

    const result = await getCollections("user-1");

    expect(result).toEqual({ collections: [], totalCount: 0 });
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

describe("getSearchIndexCollections", () => {
  it("returns lightweight mapped collections ordered by name", async () => {
    vi.mocked(prisma.collection.findMany).mockResolvedValue([
      { id: "col-1", name: "React Patterns", _count: { items: 4 } },
      { id: "col-2", name: "Python Snippets", _count: { items: 0 } },
    ] as never);

    const result = await getSearchIndexCollections("user-1");

    expect(prisma.collection.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" }, orderBy: { name: "asc" } }),
    );
    expect(result).toEqual([
      { id: "col-1", name: "React Patterns", itemCount: 4 },
      { id: "col-2", name: "Python Snippets", itemCount: 0 },
    ]);
  });

  it("returns empty array when prisma throws", async () => {
    vi.mocked(prisma.collection.findMany).mockRejectedValue(new Error("db error"));

    const result = await getSearchIndexCollections("user-1");

    expect(result).toEqual([]);
  });
});

describe("updateCollection", () => {
  it("updates the collection scoped to the owning user and returns fresh detail", async () => {
    vi.mocked(prisma.collection.updateMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.collection.findFirst).mockResolvedValue({
      id: "col-1",
      name: "Updated Name",
      description: "Updated description",
      isFavorite: false,
      _count: { items: 3 },
    } as never);

    const result = await updateCollection("user-1", "col-1", {
      name: "Updated Name",
      description: "Updated description",
    });

    expect(prisma.collection.updateMany).toHaveBeenCalledWith({
      where: { id: "col-1", userId: "user-1" },
      data: { name: "Updated Name", description: "Updated description" },
    });
    expect(result).toEqual({
      id: "col-1",
      name: "Updated Name",
      description: "Updated description",
      isFavorite: false,
      itemCount: 3,
    });
  });

  it("returns null when no matching collection is updated", async () => {
    vi.mocked(prisma.collection.updateMany).mockResolvedValue({ count: 0 });

    const result = await updateCollection("user-1", "missing", {
      name: "Name",
      description: null,
    });

    expect(result).toBeNull();
    expect(prisma.collection.findFirst).not.toHaveBeenCalled();
  });

  it("returns null when prisma throws", async () => {
    vi.mocked(prisma.collection.updateMany).mockRejectedValue(new Error("db error"));

    const result = await updateCollection("user-1", "col-1", { name: "Name", description: null });

    expect(result).toBeNull();
  });
});

describe("deleteCollection", () => {
  it("returns true when a matching collection is deleted", async () => {
    vi.mocked(prisma.collection.deleteMany).mockResolvedValue({ count: 1 });

    const result = await deleteCollection("user-1", "col-1");

    expect(prisma.collection.deleteMany).toHaveBeenCalledWith({
      where: { id: "col-1", userId: "user-1" },
    });
    expect(result).toBe(true);
  });

  it("returns false when no matching collection is found", async () => {
    vi.mocked(prisma.collection.deleteMany).mockResolvedValue({ count: 0 });

    const result = await deleteCollection("user-1", "missing");

    expect(result).toBe(false);
  });

  it("returns false when prisma throws", async () => {
    vi.mocked(prisma.collection.deleteMany).mockRejectedValue(new Error("db error"));

    const result = await deleteCollection("user-1", "col-1");

    expect(result).toBe(false);
  });
});
