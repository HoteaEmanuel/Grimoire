"use client";

import { useMemo } from "react";
import { ItemGridWithDrawer } from "@/components/items/ItemGridWithDrawer";
import { useToggleOverridesStore } from "@/lib/stores/toggle-overrides-store";
import type { ItemWithMeta } from "@/lib/db/items";

export function PinnedItemsSection({ items }: { items: ItemWithMeta[] }) {
  const overrides = useToggleOverridesStore((s) => s.overrides);
  const visibleItems = useMemo(
    () => items.filter((item) => overrides[`item-pin:${item.id}`] ?? item.isPinned),
    [items, overrides],
  );

  if (visibleItems.length === 0) return null;

  return (
    <section>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Pinned Items
      </h2>
      <ItemGridWithDrawer items={visibleItems} />
    </section>
  );
}
