"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { FavoriteStar } from "@/components/shared/FavoriteStar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditCollectionModal } from "@/components/collections/EditCollectionModal";
import { DeleteCollectionDialog } from "@/components/collections/DeleteCollectionDialog";

interface CollectionCardMenuProps {
  collection: { id: string; name: string; description: string | null; isFavorite: boolean };
  onToggleFavorite: () => void;
}

export function CollectionCardMenu({ collection, onToggleFavorite }: CollectionCardMenuProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div className="contents" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              className="absolute top-2.5 right-2.5 z-10 p-1 rounded-md opacity-0 group-hover:opacity-100 data-popup-open:opacity-100 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all duration-150"
              aria-label="Collection actions"
            />
          }
        >
          <MoreVertical size={14} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onToggleFavorite}>
            <FavoriteStar filled={collection.isFavorite} className="size-4" />
            {collection.isFavorite ? "Unfavorite" : "Favorite"}
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditCollectionModal open={editOpen} onOpenChange={setEditOpen} collection={collection} />
      <DeleteCollectionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        collectionId={collection.id}
        collectionName={collection.name}
        onDeleted={() => router.refresh()}
      />
    </div>
  );
}
