import { z } from "zod";

export const EDITOR_FONT_SIZES = [12, 13, 14, 16, 18, 20] as const;
export const EDITOR_TAB_SIZES = [2, 4, 8] as const;
export const EDITOR_THEMES = ["vs-dark", "monokai", "github-dark"] as const;

export const editorPreferencesSchema = z.object({
  fontSize: z.union(EDITOR_FONT_SIZES.map((size) => z.literal(size))),
  tabSize: z.union(EDITOR_TAB_SIZES.map((size) => z.literal(size))),
  wordWrap: z.boolean(),
  minimap: z.boolean(),
  theme: z.enum(EDITOR_THEMES),
});

export type EditorPreferences = z.infer<typeof editorPreferencesSchema>;
export type EditorTheme = (typeof EDITOR_THEMES)[number];

export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  fontSize: 13,
  tabSize: 2,
  wordWrap: true,
  minimap: false,
  theme: "vs-dark",
};
