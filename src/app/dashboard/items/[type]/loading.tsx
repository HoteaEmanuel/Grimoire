import { ItemCardSkeleton } from "@/components/dashboard/ItemCardSkeleton";

export default function ItemTypeLoading() {
  return (
    <div className="p-6">
      <div className="mb-6 space-y-2">
        <div className="h-7 w-32 rounded bg-white/5 animate-pulse" />
        <div className="h-4 w-20 rounded bg-white/5 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ItemCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
