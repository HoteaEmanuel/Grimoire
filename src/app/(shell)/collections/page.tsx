export const dynamic = "force-dynamic";

import { Layers } from "lucide-react";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { getAllCollections } from "@/lib/db/collections";
import { getSession } from "@/lib/session";

export default async function CollectionsPage() {
  const session = await getSession();
  const userId = session?.user?.id ?? "";

  const collections = await getAllCollections(userId);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Collections</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {collections.length} {collections.length === 1 ? "collection" : "collections"}
        </p>
      </div>

      {collections.length > 0 ? (
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
            />
          ))}
        </div>
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
