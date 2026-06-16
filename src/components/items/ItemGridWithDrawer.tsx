"use client";

import { ItemCard } from "@/components/dashboard/ItemCard";
import { useItemDrawerStore } from "@/lib/stores/item-drawer-store";
import type { ItemWithMeta } from "@/lib/db/items";

interface ItemGridWithDrawerProps {
  items: ItemWithMeta[];
  className?: string;
}

export function ItemGridWithDrawer({ items, className }: ItemGridWithDrawerProps) {
  const openDrawer = useItemDrawerStore((s) => s.openDrawer);

  return (
    <>
      <div className={className ?? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"}>
        {items.map((item) => (
          <ItemCard
            key={item.id}
            id={item.id}
            title={item.title}
            description={item.description}
            typeName={item.typeName}
            typeColor={item.typeColor}
            tags={item.tags}
            isPinned={item.isPinned}
            language={item.language}
            onClick={openDrawer}
          />
        ))}
      </div>
    </>
  );
}
