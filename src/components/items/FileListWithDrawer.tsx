"use client";

import { useItemDrawerStore } from "@/lib/stores/item-drawer-store";
import { FileListRow } from "@/components/items/FileListRow";
import type { ItemWithMeta } from "@/lib/db/items";

interface FileListWithDrawerProps {
  items: ItemWithMeta[];
}

export function FileListWithDrawer({ items }: FileListWithDrawerProps) {
  const openDrawer = useItemDrawerStore((s) => s.openDrawer);

  return (
    <div className="flex flex-col gap-1">
      {items.map((item) => (
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
      ))}
    </div>
  );
}
