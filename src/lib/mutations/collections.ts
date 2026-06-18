import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createCollection, updateCollection, deleteCollection } from "@/actions/collections";
import type { CreateCollectionInput } from "@/actions/collections";
import type { CollectionWithMeta, CollectionDetail } from "@/lib/db/collections";

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

export function useUpdateCollection(onSuccess?: (data: CollectionDetail) => void) {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateCollectionInput }) =>
      updateCollection(id, data).then((result) => {
        if (!result.success) throw new Error(result.error);
        return result.data;
      }),
    onSuccess: (data) => {
      toast.success("Collection updated");
      onSuccess?.(data);
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to update collection");
    },
  });
}

export function useDeleteCollection(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (collectionId: string) =>
      deleteCollection(collectionId).then((result) => {
        if (!result.success) throw new Error(result.error);
      }),
    onSuccess: () => {
      toast.success("Collection deleted");
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to delete collection");
    },
  });
}
