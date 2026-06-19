"use client";

import { Star } from "lucide-react";
import { useItemDrawerStore } from "@/lib/stores/item-drawer-store";
import { ICON_MAP } from "@/lib/item-types";
import { formatDate } from "@/lib/utils";
import type { ItemWithMeta } from "@/lib/db/items";

export function FavoriteItemRow({ item }: { item: ItemWithMeta }) {
  const openDrawer = useItemDrawerStore((s) => s.openDrawer);
  const Icon = ICON_MAP[item.typeIconName];

  return (
    <button
      onClick={() => openDrawer(item.id)}
      className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/40 transition-colors cursor-pointer"
    >
      {Icon && <Icon className="size-3.5 shrink-0" style={{ color: item.typeColor }} />}
      <span className="flex-1 truncate">{item.title}</span>
      <span
        className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border shrink-0"
        style={{ color: item.typeColor, borderColor: `${item.typeColor}40` }}
      >
        {item.typeName}
      </span>
      <span className="text-xs text-muted-foreground shrink-0 w-20 text-right">
        {formatDate(item.createdAt)}
      </span>
      <Star
        className={`size-3.5 shrink-0 ${item.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"}`}
      />
    </button>
  );
}
