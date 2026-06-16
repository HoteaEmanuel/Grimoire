import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateItem, deleteItem, createItem } from "@/actions/items";
import type { UpdateItemInput, CreateItemInput } from "@/actions/items";
import type { ItemDetail } from "@/lib/db/items";

export function useCreateItem(onSuccess?: (data: ItemDetail) => void) {
  return useMutation({
    mutationFn: (data: CreateItemInput) =>
      createItem(data).then((result) => {
        if (!result.success) throw new Error(result.error);
        return result.data;
      }),
    onSuccess: (data) => {
      toast.success("Item created");
      onSuccess?.(data);
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to create item");
    },
  });
}

export function useUpdateItem(onSuccess?: (data: ItemDetail) => void) {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateItemInput }) =>
      updateItem(id, data).then((result) => {
        if (!result.success) throw new Error(result.error);
        return result.data;
      }),
    onSuccess: (data) => {
      toast.success("Item saved");
      onSuccess?.(data);
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to save item");
    },
  });
}

export function useDeleteItem(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (itemId: string) =>
      deleteItem(itemId).then((result) => {
        if (!result.success) throw new Error(result.error);
      }),
    onSuccess: () => {
      toast.success("Item deleted");
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to delete item");
    },
  });
}
