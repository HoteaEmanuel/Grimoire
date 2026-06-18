import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "@/auth";
import { createCollection } from "./collections";

vi.mock("@/lib/db/collections", () => ({
  createCollection: vi.fn(),
}));

import { createCollection as dbCreateCollection } from "@/lib/db/collections";

const mockSession = { user: { id: "user-1" } };

const mockCollection = {
  id: "col-1",
  name: "React Patterns",
  description: "Reusable hooks and patterns",
  isFavorite: false,
  itemCount: 0,
  dominantTypeColor: "#6b7280",
  typeIcons: [],
  createdAt: new Date("2024-01-01"),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createCollection", () => {
  it("returns Unauthorized when no session", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const result = await createCollection({ name: "React Patterns" });

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(dbCreateCollection).not.toHaveBeenCalled();
  });

  it("returns validation error when name is missing", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);

    const result = await createCollection({ name: "" });

    expect(result.success).toBe(false);
    expect(dbCreateCollection).not.toHaveBeenCalled();
  });

  it("creates the collection and returns it on success", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(dbCreateCollection).mockResolvedValue(mockCollection);

    const result = await createCollection({
      name: "React Patterns",
      description: "Reusable hooks and patterns",
    });

    expect(dbCreateCollection).toHaveBeenCalledWith("user-1", {
      name: "React Patterns",
      description: "Reusable hooks and patterns",
    });
    expect(result).toEqual({ success: true, data: mockCollection });
  });

  it("defaults description to null when omitted", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(dbCreateCollection).mockResolvedValue(mockCollection);

    await createCollection({ name: "React Patterns" });

    expect(dbCreateCollection).toHaveBeenCalledWith("user-1", {
      name: "React Patterns",
      description: null,
    });
  });

  it("returns an error when the DB function fails", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(dbCreateCollection).mockResolvedValue(null);

    const result = await createCollection({ name: "React Patterns" });

    expect(result).toEqual({ success: false, error: "Failed to create collection" });
  });
});
