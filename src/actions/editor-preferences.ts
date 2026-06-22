"use server";

import { updateEditorPreferences as dbUpdateEditorPreferences } from "@/lib/db/editor-preferences";
import { editorPreferencesSchema } from "@/lib/schemas/editor-preferences";
import { requireUserId, parseOrError } from "@/lib/auth-helpers";

export type { EditorPreferences } from "@/lib/schemas/editor-preferences";

type UpdateEditorPreferencesResult = { success: true } | { success: false; error: string };

export async function updateEditorPreferences(
  preferences: unknown,
): Promise<UpdateEditorPreferencesResult> {
  const auth = await requireUserId();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const parsed = parseOrError(editorPreferencesSchema, preferences);
  if (!parsed.ok) {
    return { success: false, error: parsed.error };
  }

  const updated = await dbUpdateEditorPreferences(auth.userId, parsed.data);
  if (!updated) {
    return { success: false, error: "Failed to save editor preferences" };
  }

  return { success: true };
}
