import { CollectionCardSkeleton } from "@/components/dashboard/CollectionCardSkeleton";

export default function CollectionsLoading() {
  return (
    <div className="p-6">
      <div className="mb-6 space-y-2">
        <div className="h-7 w-40 rounded bg-white/5 animate-pulse" />
        <div className="h-4 w-24 rounded bg-white/5 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CollectionCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
