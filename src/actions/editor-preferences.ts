"use server";

import { auth } from "@/auth";
import { updateEditorPreferences as dbUpdateEditorPreferences } from "@/lib/db/editor-preferences";
import { editorPreferencesSchema } from "@/lib/schemas/editor-preferences";

export type { EditorPreferences } from "@/lib/schemas/editor-preferences";

type UpdateEditorPreferencesResult = { success: true } | { success: false; error: string };

export async function updateEditorPreferences(
  preferences: unknown,
): Promise<UpdateEditorPreferencesResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = editorPreferencesSchema.safeParse(preferences);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { success: false, error: first?.message ?? "Invalid input" };
  }

  const updated = await dbUpdateEditorPreferences(session.user.id, parsed.data);
  if (!updated) {
    return { success: false, error: "Failed to save editor preferences" };
  }

  return { success: true };
}
