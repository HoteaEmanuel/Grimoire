import { notFound } from "next/navigation";
import { getCollectionDetail } from "@/lib/db/collections";
import { getItemCardsByCollection } from "@/lib/db/items";
import { getSession } from "@/lib/session";
import { ItemGridWithDrawer } from "@/components/items/ItemGridWithDrawer";
import { ImageGridWithDrawer } from "@/components/items/ImageGridWithDrawer";
import { FileListWithDrawer } from "@/components/items/FileListWithDrawer";
import { PackageOpen } from "lucide-react";

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const userId = session?.user?.id ?? "";

  const collection = await getCollectionDetail(userId, id);
  if (!collection) notFound();

  const items = await getItemCardsByCollection(userId, id);
  const otherItems = items.filter((i) => i.typeSlug !== "images" && i.typeSlug !== "files");
  const imageItems = items.filter((i) => i.typeSlug === "images");
  const fileItems = items.filter((i) => i.typeSlug === "files");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{collection.name}</h1>
        {collection.description && (
          <p className="text-sm text-muted-foreground mt-1">{collection.description}</p>
        )}
        <p className="text-sm text-muted-foreground/60 mt-1">
          {items.length} {items.length === 1 ? "item" : "items"}
        </p>
      </div>

      {items.length > 0 ? (
        <div className="space-y-8">
          {otherItems.length > 0 && (
            <ItemGridWithDrawer items={otherItems} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" />
          )}

          {imageItems.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Images
              </h2>
              <ImageGridWithDrawer items={imageItems} />
            </section>
          )}

          {fileItems.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Files
              </h2>
              <FileListWithDrawer items={fileItems} />
            </section>
          )}
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
            <PackageOpen size={28} className="text-primary" />
          </div>
          <div className="space-y-1">
            <p
              className="text-lg font-semibold tracking-wide"
              style={{ fontFamily: "var(--font-display)" }}
            >
              No items in this collection yet
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Add items to this collection from the item create or edit form.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
