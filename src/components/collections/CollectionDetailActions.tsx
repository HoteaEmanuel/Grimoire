"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditCollectionModal } from "@/components/collections/EditCollectionModal";
import { DeleteCollectionDialog } from "@/components/collections/DeleteCollectionDialog";

interface CollectionDetailActionsProps {
  collection: { id: string; name: string; description: string | null; isFavorite: boolean };
}

export function CollectionDetailActions({ collection }: CollectionDetailActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="size-4" />
          Edit
        </Button>
        <Button variant="outline" size="sm" disabled>
          <Star className="size-4" />
          Favorite
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
