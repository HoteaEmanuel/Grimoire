import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { generateAutoTags, generateDescription, explainCode, optimizePrompt } from "@/actions/ai";
import type {
  GenerateAutoTagsInput,
  GenerateDescriptionInput,
  ExplainCodeInput,
  OptimizePromptInput,
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

export function useOptimizePrompt(onSuccess?: (optimized: string) => void) {
  return useMutation({
    mutationFn: (input: OptimizePromptInput) =>
      optimizePrompt(input).then((result) => {
        if (!result.success) throw new Error(result.error);
        return result.data.optimized;
      }),
    onSuccess: (optimized) => onSuccess?.(optimized),
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to optimize prompt");
    },
  });
}
