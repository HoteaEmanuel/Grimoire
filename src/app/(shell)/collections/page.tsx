export const dynamic = "force-dynamic";

import { Layers } from "lucide-react";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { getCollections } from "@/lib/db/collections";
import { getSession } from "@/lib/session";
import { COLLECTIONS_PER_PAGE } from "@/lib/constants";
import { PaginationControls } from "@/components/shared/PaginationControls";

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const session = await getSession();
  const userId = session?.user?.id ?? "";

  const { collections, totalCount } = await getCollections(userId, page);
  const totalPages = Math.max(1, Math.ceil(totalCount / COLLECTIONS_PER_PAGE));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Collections</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {totalCount} {totalCount === 1 ? "collection" : "collections"}
        </p>
      </div>

      {collections.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {collections.map((col) => (
              <CollectionCard
                key={col.id}
                id={col.id}
                name={col.name}
                description={col.description}
                itemCount={col.itemCount}
                dominantTypeColor={col.dominantTypeColor}
                typeIcons={col.typeIcons}
                isFavorite={col.isFavorite}
              />
            ))}
          </div>
          <PaginationControls currentPage={page} totalPages={totalPages} basePath="/collections" />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, oklch(0.6 0.15 290 / 0.25), oklch(0.6 0.15 290 / 0.05))",
              boxShadow: "0 0 32px -4px oklch(0.6 0.15 290 / 0.4)",
            }}
          >
            <Layers size={28} className="text-primary" />
          </div>
          <div className="space-y-1">
            <p
              className="text-lg font-semibold tracking-wide"
              style={{ fontFamily: "var(--font-display)" }}
            >
              No collections yet
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Create a collection to start grouping your items.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
