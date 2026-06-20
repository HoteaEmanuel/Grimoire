import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { generateAutoTags, generateDescription } from "@/actions/ai";
import type { GenerateAutoTagsInput, GenerateDescriptionInput } from "@/lib/schemas/ai";

export function useSuggestTags(onSuccess?: (tags: string[]) => void) {
  return useMutation({
    mutationFn: (input: GenerateAutoTagsInput) =>
      generateAutoTags(input).then((result) => {
        if (!result.success) throw new Error(result.error);
        return result.data.tags;
      }),
    onSuccess: (tags) => onSuccess?.(tags),
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to suggest tags");
    },
  });
}

export function useGenerateDescription(onSuccess?: (summary: string) => void) {
  return useMutation({
    mutationFn: (input: GenerateDescriptionInput) =>
      generateDescription(input).then((result) => {
        if (!result.success) throw new Error(result.error);
        return result.data.summary;
      }),
    onSuccess: (summary) => onSuccess?.(summary),
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to generate description");
    },
  });
}
