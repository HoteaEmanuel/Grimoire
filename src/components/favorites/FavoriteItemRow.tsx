"use client";

import { FavoriteStar } from "@/components/shared/FavoriteStar";
import { useItemDrawerStore } from "@/lib/stores/item-drawer-store";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { toggleItemFavorite } from "@/actions/items";
import { Button } from "@/components/ui/button";
import { ICON_MAP } from "@/lib/item-types";
import { formatDate } from "@/lib/utils";
import type { ItemWithMeta } from "@/lib/db/items";

export function FavoriteItemRow({ item }: { item: ItemWithMeta }) {
  const openDrawer = useItemDrawerStore((s) => s.openDrawer);
  const Icon = ICON_MAP[item.typeIconName];
  const { value: isFavorite, toggle: toggleFavorite } = useOptimisticToggle(
    `item:${item.id}`,
    item.isFavorite,
    (next) => toggleItemFavorite(item.id, next),
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openDrawer(item.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter") openDrawer(item.id);
      }}
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
        <FavoriteStar filled={isFavorite} className="size-3.5" emptyClassName="text-muted-foreground/40" />
      </Button>
    </div>
  );
}
