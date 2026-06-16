import { PackageOpen } from "lucide-react";
import type { ItemFull } from "@/lib/db/items";
import { ItemCard } from "@/components/dashboard/ItemCard";

interface ItemsGridProps {
  items: ItemFull[];
  typeName: string;
  typeColor: string;
}

export function ItemsGrid({ items, typeName, typeColor }: ItemsGridProps) {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          title={item.title}
          description={item.description}
          typeName={item.typeName}
          typeColor={item.typeColor}
          tags={item.tags}
          isPinned={item.isPinned}
          language={item.language}
        />
      ))}
    </div>
  );
}
