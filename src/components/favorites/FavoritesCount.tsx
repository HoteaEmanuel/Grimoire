"use client";

import { useMemo } from "react";
import { useFavoriteOverridesStore } from "@/lib/stores/favorite-overrides-store";
import type { ItemWithMeta } from "@/lib/db/items";
import type { CollectionWithMeta } from "@/lib/db/collections";

interface FavoritesCountProps {
  items: ItemWithMeta[];
  collections: CollectionWithMeta[];
}

export function FavoritesCount({ items, collections }: FavoritesCountProps) {
  const overrides = useFavoriteOverridesStore((s) => s.overrides);

  const count = useMemo(() => {
    const itemCount = items.filter((item) => overrides[`item:${item.id}`] ?? item.isFavorite).length;
    const collectionCount = collections.filter(
      (col) => overrides[`collection:${col.id}`] ?? col.isFavorite,
    ).length;
    return itemCount + collectionCount;
  }, [items, collections, overrides]);

  return <p className="text-sm text-muted-foreground mt-1">{count} favorited</p>;
}
