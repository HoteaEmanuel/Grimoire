"use client";

import { useMemo, useState } from "react";
import { FavoriteItemRow } from "./FavoriteItemRow";
import { useFavoriteOverridesStore } from "@/lib/stores/favorite-overrides-store";
import type { ItemWithMeta } from "@/lib/db/items";

type SortKey = "date" | "name" | "type";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "date", label: "Date" },
  { value: "name", label: "Name" },
  { value: "type", label: "Type" },
];

function sortItems(items: ItemWithMeta[], sortKey: SortKey): ItemWithMeta[] {
  const sorted = [...items];
  if (sortKey === "name") {
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortKey === "type") {
    sorted.sort((a, b) => a.typeName.localeCompare(b.typeName) || a.title.localeCompare(b.title));
  } else {
    sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  return sorted;
}

export function FavoriteItemsSection({ items }: { items: ItemWithMeta[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const overrides = useFavoriteOverridesStore((s) => s.overrides);
  const visibleItems = useMemo(
    () => items.filter((item) => overrides[`item:${item.id}`] ?? item.isFavorite),
    [items, overrides],
  );
  const sorted = useMemo(() => sortItems(visibleItems, sortKey), [visibleItems, sortKey]);

  if (sorted.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Items ({sorted.length})
        </h2>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          aria-label="Sort items by"
          className="h-6 rounded border border-input bg-background px-1.5 text-[10px] uppercase tracking-wide text-muted-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring scheme-dark"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="border border-border/60 rounded-md divide-y divide-border/60">
        {sorted.map((item) => (
          <FavoriteItemRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
