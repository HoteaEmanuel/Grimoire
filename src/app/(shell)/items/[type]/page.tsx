import { notFound } from "next/navigation";
import { SYSTEM_ITEM_TYPES } from "@/lib/item-types";
import { getItemCardsByType } from "@/lib/db/items";
import { getSession } from "@/lib/session";
import { ItemsGrid } from "@/components/items/ItemsGrid";

export default async function ItemTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const typeDef = SYSTEM_ITEM_TYPES.find((t) => t.slug === type);
  if (!typeDef) notFound();

  const session = await getSession();
  const userId = session?.user?.id ?? "";

  const items = await getItemCardsByType(userId, type);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{typeDef.name}s</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {items.length} {items.length === 1 ? typeDef.name.toLowerCase() : typeDef.name.toLowerCase() + "s"}
        </p>
      </div>
      <ItemsGrid items={items} typeName={typeDef.name} typeColor={typeDef.color} typeSlug={type} />
    </div>
  );
}
