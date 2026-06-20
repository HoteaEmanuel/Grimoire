import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { generateAutoTags, generateDescription, explainCode } from "@/actions/ai";
import type {
  GenerateAutoTagsInput,
  GenerateDescriptionInput,
  ExplainCodeInput,
} from "@/lib/schemas/ai";

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

export function useExplainCode(onSuccess?: (explanation: string) => void) {
  return useMutation({
    mutationFn: (input: ExplainCodeInput) =>
      explainCode(input).then((result) => {
        if (!result.success) throw new Error(result.error);
        return result.data.explanation;
      }),
    onSuccess: (explanation) => onSuccess?.(explanation),
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to explain code");
    },
  });
}
