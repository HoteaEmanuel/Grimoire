"use client";

import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { useDeleteCollection } from "@/lib/mutations/collections";

interface DeleteCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: string;
  collectionName: string;
  onDeleted?: () => void;
}

export function DeleteCollectionDialog({
  open,
  onOpenChange,
  collectionId,
  collectionName,
  onDeleted,
}: DeleteCollectionDialogProps) {
  const { mutate, isPending } = useDeleteCollection(() => {
    onOpenChange(false);
    onDeleted?.();
  });

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title={<>Delete &quot;{collectionName}&quot;?</>}
      description="This will permanently delete the collection. Items in this collection will not be deleted — they'll just no longer belong to it."
      isPending={isPending}
      onConfirm={() => mutate(collectionId)}
    />
  );
}
