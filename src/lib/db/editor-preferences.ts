import { prisma } from "@/lib/prisma";
import {
  editorPreferencesSchema,
  DEFAULT_EDITOR_PREFERENCES,
  type EditorPreferences,
} from "@/lib/schemas/editor-preferences";

export async function getEditorPreferences(userId: string): Promise<EditorPreferences> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { editorPreferences: true },
    });

    const parsed = editorPreferencesSchema.safeParse(user?.editorPreferences);
    return parsed.success ? parsed.data : DEFAULT_EDITOR_PREFERENCES;
  } catch (err) {
    console.error("[getEditorPreferences]", err);
    return DEFAULT_EDITOR_PREFERENCES;
  }
}

export async function updateEditorPreferences(
  userId: string,
  preferences: EditorPreferences,
): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { editorPreferences: preferences },
    });
    return true;
  } catch (err) {
    console.error("[updateEditorPreferences]", err);
    return false;
  }
}
