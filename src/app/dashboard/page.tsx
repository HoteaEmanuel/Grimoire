export const dynamic = "force-dynamic";

import { Layers, Star, BookMarked, Hash } from "lucide-react";
import { AnimatedWand } from "@/components/dashboard/AnimatedWand";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { getRecentCollections, getCollectionStats } from "@/lib/db/collections";
import { getPinnedItems, getRecentItems, getItemStats } from "@/lib/db/items";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  const [
    recentCollections,
    collectionStats,
    pinnedItems,
    recentItems,
    itemStats,
  ] = await Promise.all([
    getRecentCollections(userId),
    getCollectionStats(userId),
    getPinnedItems(userId),
    getRecentItems(userId, 10),
    getItemStats(userId),
  ]);


  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <div className="flex gap-4 items-center">
          <h1
            className="text-3xl font-bold tracking-wide text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Welcome Back
          </h1>
          <AnimatedWand />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s what&apos;s been going on in your grimoire.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Items"
          value={itemStats.totalItems}
          icon={Hash}
          iconColor="#3b82f6"
        />
        <StatsCard
          label="Collections"
          value={collectionStats.totalCollections}
          icon={Layers}
          iconColor="#8b5cf6"
        />
        <StatsCard
          label="Favorite Items"
          value={itemStats.favoriteItems}
          icon={Star}
          iconColor="#f59e0b"
        />
        <StatsCard
          label="Favorite Collections"
          value={collectionStats.favoriteCollections}
          icon={BookMarked}
          iconColor="#10b981"
        />
      </div>

      {/* Recent Collections */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Recent Collections
        </h2>
        {recentCollections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentCollections.map((col) => (
              <CollectionCard
                key={col.id}
                id={col.id}
                name={col.name}
                description={col.description}
                itemCount={col.itemCount}
                dominantTypeColor={col.dominantTypeColor}
                typeIcons={col.typeIcons}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground/60">
            No collections yet. Create one to start organizing your items.
          </p>
        )}
      </section>

      {/* Pinned Items */}
      {pinnedItems.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Pinned Items
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pinnedItems.map((item) => (
              <ItemCard
                key={item.id}
                title={item.title}
                description={item.description}
                typeName={item.typeName}
                typeColor={item.typeColor}
                tags={item.tags}
                isPinned
                language={item.language}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Items */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Recent Items
        </h2>
        {recentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentItems.map((item) => (
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
        ) : (
          <p className="text-sm text-muted-foreground/60">
            No items yet. Add your first snippet, prompt, or note to get
            started.
          </p>
        )}
      </section>
    </div>
  );
}
