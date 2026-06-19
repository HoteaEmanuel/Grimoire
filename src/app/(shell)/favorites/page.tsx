export const dynamic = "force-dynamic";

import { Star } from "lucide-react";
import { getFavoriteItems } from "@/lib/db/items";
import { getFavoriteCollections } from "@/lib/db/collections";
import { getSession } from "@/lib/session";
import { FavoriteItemsSection } from "@/components/favorites/FavoriteItemsSection";
import { FavoriteCollectionsSection } from "@/components/favorites/FavoriteCollectionsSection";
import { FavoritesCount } from "@/components/favorites/FavoritesCount";

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
        <FavoritesCount items={items} collections={collections} />
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
          {items.length > 0 && <FavoriteItemsSection items={items} />}
          {collections.length > 0 && <FavoriteCollectionsSection collections={collections} />}
        </div>
      )}
    </div>
  );
}
