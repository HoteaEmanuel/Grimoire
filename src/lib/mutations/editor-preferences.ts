import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateEditorPreferences } from "@/actions/editor-preferences";
import type { EditorPreferences } from "@/lib/schemas/editor-preferences";

export function useUpdateEditorPreferences() {
  return useMutation({
    mutationFn: (preferences: EditorPreferences) =>
      updateEditorPreferences(preferences).then((result) => {
        if (!result.success) throw new Error(result.error);
      }),
    onSuccess: () => {
      toast.success("Editor preferences saved");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to save editor preferences");
    },
  });
}
