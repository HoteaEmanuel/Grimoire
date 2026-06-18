import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { createCollection } from "./collections";

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
