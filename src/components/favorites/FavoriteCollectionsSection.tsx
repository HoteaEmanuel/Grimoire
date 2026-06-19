"use client";

import { useMemo, useState } from "react";
import { FavoriteCollectionRow } from "./FavoriteCollectionRow";
import { useToggleOverridesStore } from "@/lib/stores/toggle-overrides-store";
import type { CollectionWithMeta } from "@/lib/db/collections";

type SortKey = "date" | "name";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "date", label: "Date" },
  { value: "name", label: "Name" },
];

function sortCollections(collections: CollectionWithMeta[], sortKey: SortKey): CollectionWithMeta[] {
  const sorted = [...collections];
  if (sortKey === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  return sorted;
}

export function FavoriteCollectionsSection({ collections }: { collections: CollectionWithMeta[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const overrides = useToggleOverridesStore((s) => s.overrides);
  const visibleCollections = useMemo(
    () => collections.filter((col) => overrides[`collection:${col.id}`] ?? col.isFavorite),
    [collections, overrides],
  );
  const sorted = useMemo(() => sortCollections(visibleCollections, sortKey), [visibleCollections, sortKey]);

  if (sorted.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Collections ({sorted.length})
        </h2>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          aria-label="Sort collections by"
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
        {sorted.map((col) => (
          <FavoriteCollectionRow key={col.id} collection={col} />
        ))}
      </div>
    </section>
  );
}
