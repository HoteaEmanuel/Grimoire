import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createCollection } from "@/actions/collections";
import type { CreateCollectionInput } from "@/actions/collections";
import type { CollectionWithMeta } from "@/lib/db/collections";

export function useCreateCollection(onSuccess?: (data: CollectionWithMeta) => void) {
  return useMutation({
    mutationFn: (data: CreateCollectionInput) =>
      createCollection(data).then((result) => {
        if (!result.success) throw new Error(result.error);
        return result.data;
      }),
    onSuccess: (data) => {
      toast.success("Collection created");
      onSuccess?.(data);
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to create collection");
    },
  });
}
