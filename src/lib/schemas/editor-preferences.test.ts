import { describe, it, expect } from "vitest";
import { editorPreferencesSchema, DEFAULT_EDITOR_PREFERENCES } from "./editor-preferences";

describe("editorPreferencesSchema", () => {
  it("accepts the default preferences", () => {
    const result = editorPreferencesSchema.safeParse(DEFAULT_EDITOR_PREFERENCES);
    expect(result.success).toBe(true);
  });

  it("accepts every supported font size, tab size, and theme", () => {
    for (const fontSize of [12, 13, 14, 16, 18, 20]) {
      expect(editorPreferencesSchema.safeParse({ ...DEFAULT_EDITOR_PREFERENCES, fontSize }).success).toBe(true);
    }
    for (const tabSize of [2, 4, 8]) {
      expect(editorPreferencesSchema.safeParse({ ...DEFAULT_EDITOR_PREFERENCES, tabSize }).success).toBe(true);
    }
    for (const theme of ["vs-dark", "monokai", "github-dark"]) {
      expect(editorPreferencesSchema.safeParse({ ...DEFAULT_EDITOR_PREFERENCES, theme }).success).toBe(true);
    }
  });

  it("rejects an unsupported font size", () => {
    const result = editorPreferencesSchema.safeParse({ ...DEFAULT_EDITOR_PREFERENCES, fontSize: 15 });
    expect(result.success).toBe(false);
  });

  it("rejects an unsupported tab size", () => {
    const result = editorPreferencesSchema.safeParse({ ...DEFAULT_EDITOR_PREFERENCES, tabSize: 3 });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown theme", () => {
    const result = editorPreferencesSchema.safeParse({ ...DEFAULT_EDITOR_PREFERENCES, theme: "solarized" });
    expect(result.success).toBe(false);
  });

  it("rejects non-boolean wordWrap/minimap", () => {
    const result = editorPreferencesSchema.safeParse({ ...DEFAULT_EDITOR_PREFERENCES, wordWrap: "on" });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = editorPreferencesSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
