"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FavoriteStar } from "@/components/shared/FavoriteStar";
import { EditCollectionModal } from "@/components/collections/EditCollectionModal";
import { DeleteCollectionDialog } from "@/components/collections/DeleteCollectionDialog";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { toggleCollectionFavorite } from "@/actions/collections";

interface CollectionDetailActionsProps {
  collection: { id: string; name: string; description: string | null; isFavorite: boolean };
}

export function CollectionDetailActions({ collection }: CollectionDetailActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { value: isFavorite, toggle: toggleFavorite } = useOptimisticToggle(
    `collection:${collection.id}`,
    collection.isFavorite,
    (next) => toggleCollectionFavorite(collection.id, next),
  );

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="size-4" />
          Edit
        </Button>
        <Button variant="outline" size="sm" onClick={toggleFavorite}>
          <FavoriteStar filled={isFavorite} className="size-4" />
          {isFavorite ? "Unfavorite" : "Favorite"}
        </Button>
        <Button variant="outline" className="text-red-500" size="sm" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>

      <EditCollectionModal open={editOpen} onOpenChange={setEditOpen} collection={collection} />
      <DeleteCollectionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        collectionId={collection.id}
        collectionName={collection.name}
        onDeleted={() => router.push("/collections")}
      />
    </>
  );
}
