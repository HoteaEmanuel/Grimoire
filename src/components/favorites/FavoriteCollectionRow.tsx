"use client";

import { useRouter } from "next/navigation";
import { Folder, Star } from "lucide-react";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { toggleCollectionFavorite } from "@/actions/collections";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { CollectionWithMeta } from "@/lib/db/collections";

export function FavoriteCollectionRow({ collection }: { collection: CollectionWithMeta }) {
  const router = useRouter();
  const { value: isFavorite, toggle: toggleFavorite } = useOptimisticToggle(
    `collection:${collection.id}`,
    collection.isFavorite,
    (next) => toggleCollectionFavorite(collection.id, next),
  );

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/collections/${collection.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(`/collections/${collection.id}`);
      }}
      className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/40 transition-colors cursor-pointer"
    >
      <Folder className="size-3.5 shrink-0" style={{ color: collection.dominantTypeColor }} />
      <span className="flex-1 truncate">{collection.name}</span>
      <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border shrink-0 text-muted-foreground border-border/60">
        Collection · {collection.itemCount}
      </span>
      <span className="text-xs text-muted-foreground shrink-0 w-20 text-right">
        {formatDate(collection.createdAt)}
      </span>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite();
        }}
        aria-label={isFavorite ? "Unfavorite" : "Favorite"}
        className="shrink-0"
      >
        <Star
          className={`size-3.5 ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"}`}
        />
      </Button>
    </div>
  );
}
