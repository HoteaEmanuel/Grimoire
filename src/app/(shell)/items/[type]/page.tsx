import { notFound } from "next/navigation";
import { SYSTEM_ITEM_TYPES } from "@/lib/item-types";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { getItemCardsByType } from "@/lib/db/items";
import { getSession } from "@/lib/session";
import { ItemsGrid } from "@/components/items/ItemsGrid";
import { PaginationControls } from "@/components/shared/PaginationControls";

export default async function ItemTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { type } = await params;
  const { page: pageParam } = await searchParams;
  const typeDef = SYSTEM_ITEM_TYPES.find((t) => t.slug === type);
  if (!typeDef) notFound();

  const page = Math.max(1, Number(pageParam) || 1);

  const session = await getSession();
  const userId = session?.user?.id ?? "";

  const { items, totalCount } = await getItemCardsByType(userId, type, page);
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{typeDef.name}s</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {totalCount} {totalCount === 1 ? typeDef.name.toLowerCase() : typeDef.name.toLowerCase() + "s"}
        </p>
      </div>
      <ItemsGrid items={items} typeName={typeDef.name} typeColor={typeDef.color} typeSlug={type} />
      <PaginationControls currentPage={page} totalPages={totalPages} basePath={`/items/${type}`} />
    </div>
  );
}
