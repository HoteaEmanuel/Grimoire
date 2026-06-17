import { PackageOpen } from "lucide-react";
import type { ItemWithMeta } from "@/lib/db/items";
import { ItemGridWithDrawer } from "@/components/items/ItemGridWithDrawer";
import { ImageGridWithDrawer } from "@/components/items/ImageGridWithDrawer";
import { FileListWithDrawer } from "@/components/items/FileListWithDrawer";

interface ItemsGridProps {
  items: ItemWithMeta[];
  typeName: string;
  typeColor: string;
  typeSlug: string;
}

export function ItemsGrid({ items, typeName, typeColor, typeSlug }: ItemsGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${typeColor}28, ${typeColor}0a)`,
            boxShadow: `0 0 32px -4px ${typeColor}50`,
          }}
        >
          <PackageOpen size={28} style={{ color: typeColor }} />
        </div>
        <div className="space-y-1">
          <p
            className="text-lg font-semibold tracking-wide"
            style={{ fontFamily: "var(--font-display)" }}
          >
            No {typeName}s yet
          </p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Your {typeName.toLowerCase()}s will appear here once you add them.
          </p>
        </div>
      </div>
    );
  }

  if (typeSlug === "images") {
    return <ImageGridWithDrawer items={items} />;
  }

  if (typeSlug === "files") {
    return <FileListWithDrawer items={items} />;
  }

  return (
    <ItemGridWithDrawer
      items={items}
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
    />
  );
}
