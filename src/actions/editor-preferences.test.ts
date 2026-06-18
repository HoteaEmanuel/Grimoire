import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "@/auth";
import { updateEditorPreferences } from "./editor-preferences";

vi.mock("@/lib/db/editor-preferences", () => ({
  updateEditorPreferences: vi.fn(),
}));

import { updateEditorPreferences as dbUpdateEditorPreferences } from "@/lib/db/editor-preferences";

const mockSession = { user: { id: "user-1" } };

const validPreferences = {
  fontSize: 14,
  tabSize: 4,
  wordWrap: true,
  minimap: false,
  theme: "vs-dark",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateEditorPreferences action", () => {
  it("returns Unauthorized when no session", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const result = await updateEditorPreferences(validPreferences);

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(dbUpdateEditorPreferences).not.toHaveBeenCalled();
  });

  it("returns a validation error for an invalid theme", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);

    const result = await updateEditorPreferences({ ...validPreferences, theme: "solarized" });

    expect(result.success).toBe(false);
    expect(dbUpdateEditorPreferences).not.toHaveBeenCalled();
  });

  it("returns a validation error for an unsupported font size", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);

    const result = await updateEditorPreferences({ ...validPreferences, fontSize: 11 });

    expect(result.success).toBe(false);
    expect(dbUpdateEditorPreferences).not.toHaveBeenCalled();
  });

  it("saves valid preferences and returns success", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(dbUpdateEditorPreferences).mockResolvedValue(true);

    const result = await updateEditorPreferences(validPreferences);

    expect(dbUpdateEditorPreferences).toHaveBeenCalledWith("user-1", validPreferences);
    expect(result).toEqual({ success: true });
  });

  it("returns an error when the DB write fails", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(dbUpdateEditorPreferences).mockResolvedValue(false);

    const result = await updateEditorPreferences(validPreferences);

    expect(result).toEqual({ success: false, error: "Failed to save editor preferences" });
  });
});
