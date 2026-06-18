import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getEditorPreferences, updateEditorPreferences } from "./editor-preferences";
import { DEFAULT_EDITOR_PREFERENCES } from "@/lib/schemas/editor-preferences";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getEditorPreferences", () => {
  it("returns defaults when the user has no stored preferences", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ editorPreferences: null } as never);

    const result = await getEditorPreferences("user-1");

    expect(result).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it("returns stored preferences when valid", async () => {
    const stored = { fontSize: 16, tabSize: 4, wordWrap: false, minimap: true, theme: "monokai" };
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ editorPreferences: stored } as never);

    const result = await getEditorPreferences("user-1");

    expect(result).toEqual(stored);
  });

  it("returns defaults when stored preferences fail validation", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      editorPreferences: { fontSize: 999 },
    } as never);

    const result = await getEditorPreferences("user-1");

    expect(result).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it("returns defaults when the DB call fails", async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error("db down"));

    const result = await getEditorPreferences("user-1");

    expect(result).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });
});

describe("updateEditorPreferences", () => {
  it("writes preferences and returns true on success", async () => {
    vi.mocked(prisma.user.update).mockResolvedValue({} as never);

    const result = await updateEditorPreferences("user-1", DEFAULT_EDITOR_PREFERENCES);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { editorPreferences: DEFAULT_EDITOR_PREFERENCES },
    });
    expect(result).toBe(true);
  });

  it("returns false when the DB call fails", async () => {
    vi.mocked(prisma.user.update).mockRejectedValue(new Error("db down"));

    const result = await updateEditorPreferences("user-1", DEFAULT_EDITOR_PREFERENCES);

    expect(result).toBe(false);
  });
});
