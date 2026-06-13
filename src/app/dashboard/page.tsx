import { Layers, Star, BookMarked, Hash } from "lucide-react";
import { AnimatedWand } from "@/components/dashboard/AnimatedWand";
import { mockItems, mockCollections, mockItemTypes } from "@/lib/mock-data";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { ItemCard } from "@/components/dashboard/ItemCard";

function getTypeMeta(typeId: string) {
  const type = mockItemTypes.find((t) => t.id === typeId);
  return { name: type?.name ?? "Item", color: type?.color ?? "#6b7280" };
}

export default function DashboardPage() {
  const totalItems = mockItems.length;
  const totalCollections = mockCollections.length;
  const favoriteItems = mockItems.filter((i) => i.isFavorite).length;
  const favoriteCollections = mockCollections.filter(
    (c) => c.isFavorite,
  ).length;

  const recentCollections = [...mockCollections]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6);

  const pinnedItems = mockItems.filter((i) => i.isPinned);

  const recentItems = [...mockItems]
    .sort(
      (a, b) =>
        new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime(),
    )
    .slice(0, 10);

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
          value={totalItems}
          icon={Hash}
          iconColor="#3b82f6"
        />
        <StatsCard
          label="Collections"
          value={totalCollections}
          icon={Layers}
          iconColor="#8b5cf6"
        />
        <StatsCard
          label="Favorite Items"
          value={favoriteItems}
          icon={Star}
          iconColor="#f59e0b"
        />
        <StatsCard
          label="Favorite Collections"
          value={favoriteCollections}
          icon={BookMarked}
          iconColor="#10b981"
        />
      </div>

      {/* Recent Collections */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Recent Collections
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentCollections.map((col) => (
            <CollectionCard
              key={col.id}
              id={col.id}
              name={col.name}
              description={col.description}
              itemCount={col.itemCount}
              dominantTypeColor={col.dominantTypeColor}
              isFavorite={col.isFavorite}
            />
          ))}
        </div>
      </section>

      {/* Pinned Items */}
      {pinnedItems.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Pinned Items
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pinnedItems.map((item) => {
              const { name, color } = getTypeMeta(item.itemTypeId);
              return (
                <ItemCard
                  key={item.id}
                  title={item.title}
                  description={item.description}
                  typeName={name}
                  typeColor={color}
                  tags={item.tags}
                  isPinned
                  language={item.language}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Items */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Recent Items
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentItems.map((item) => {
            const { name, color } = getTypeMeta(item.itemTypeId);
            return (
              <ItemCard
                key={item.id}
                title={item.title}
                description={item.description}
                typeName={name}
                typeColor={color}
                tags={item.tags}
                isPinned={item.isPinned}
                language={item.language}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
