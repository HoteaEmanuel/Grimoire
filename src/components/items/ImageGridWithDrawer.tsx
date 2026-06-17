"use client";

import { useItemDrawerStore } from "@/lib/stores/item-drawer-store";
import { ImageThumbnailCard } from "@/components/items/ImageThumbnailCard";
import type { ItemWithMeta } from "@/lib/db/items";

interface ImageGridWithDrawerProps {
  items: ItemWithMeta[];
}

export function ImageGridWithDrawer({ items }: ImageGridWithDrawerProps) {
  const openDrawer = useItemDrawerStore((s) => s.openDrawer);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((item) => (
        <ImageThumbnailCard
          key={item.id}
          id={item.id}
          title={item.title}
          fileUrl={item.fileUrl}
          isPinned={item.isPinned}
          createdAt={item.createdAt}
          onClick={openDrawer}
        />
      ))}
    </div>
  );
}
