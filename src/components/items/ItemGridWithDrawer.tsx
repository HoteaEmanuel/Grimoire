"use client";

import { ItemCard } from "@/components/dashboard/ItemCard";
import { ImageThumbnailCard } from "@/components/items/ImageThumbnailCard";
import { FileListRow } from "@/components/items/FileListRow";
import { useItemDrawerStore } from "@/lib/stores/item-drawer-store";
import type { ItemWithMeta } from "@/lib/db/items";

interface ItemGridWithDrawerProps {
  items: ItemWithMeta[];
  className?: string;
}

export function ItemGridWithDrawer({ items, className }: ItemGridWithDrawerProps) {
  const openDrawer = useItemDrawerStore((s) => s.openDrawer);

  return (
    <div className={className ?? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"}>
      {items.map((item) => {
        if (item.typeSlug === "images") {
          return (
            <ImageThumbnailCard
              key={item.id}
              id={item.id}
              title={item.title}
              fileUrl={item.fileUrl}
              isPinned={item.isPinned}
              isFavorite={item.isFavorite}
              createdAt={item.createdAt}
              onClick={openDrawer}
              compact
            />
          );
        }

        if (item.typeSlug === "files") {
          return (
            <FileListRow
              key={item.id}
              id={item.id}
              title={item.title}
              fileName={item.fileName}
              fileSize={item.fileSize}
              fileUrl={item.fileUrl}
              isPinned={item.isPinned}
              isFavorite={item.isFavorite}
              createdAt={item.createdAt}
              onClick={openDrawer}
            />
          );
        }

        return (
          <ItemCard
            key={item.id}
            id={item.id}
            title={item.title}
            description={item.description}
            typeName={item.typeName}
            typeColor={item.typeColor}
            tags={item.tags}
            isPinned={item.isPinned}
            isFavorite={item.isFavorite}
            language={item.language}
            content={item.content}
            url={item.url}
            onClick={openDrawer}
          />
        );
      })}
    </div>
  );
}
