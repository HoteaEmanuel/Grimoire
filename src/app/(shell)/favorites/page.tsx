export const dynamic = "force-dynamic";

import { Star } from "lucide-react";
import { getFavoriteItems } from "@/lib/db/items";
import { getFavoriteCollections } from "@/lib/db/collections";
import { getSession } from "@/lib/session";
import { FavoriteItemRow } from "@/components/favorites/FavoriteItemRow";
import { FavoriteCollectionRow } from "@/components/favorites/FavoriteCollectionRow";

export default async function FavoritesPage() {
  const session = await getSession();
  const userId = session?.user?.id ?? "";

  const [items, collections] = await Promise.all([
    getFavoriteItems(userId),
    getFavoriteCollections(userId),
  ]);

  const isEmpty = items.length === 0 && collections.length === 0;

  return (
    <div className="p-6 font-mono max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Favorites</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {items.length + collections.length} favorited
        </p>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <Star size={28} className="text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-base font-medium">No favorites yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Star items and collections to find them here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {items.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Items ({items.length})
              </h2>
              <div className="border border-border/60 rounded-md divide-y divide-border/60">
                {items.map((item) => (
                  <FavoriteItemRow key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {collections.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Collections ({collections.length})
              </h2>
              <div className="border border-border/60 rounded-md divide-y divide-border/60">
                {collections.map((col) => (
                  <FavoriteCollectionRow key={col.id} collection={col} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
