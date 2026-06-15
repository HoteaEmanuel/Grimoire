import { Skeleton } from "@/components/ui/skeleton";

export function CollectionCardSkeleton() {
  return (
    <div className="tome-card rounded-lg p-4 h-full">
      <Skeleton className="w-8 h-8 rounded-md mb-3" />
      <Skeleton className="h-5 w-3/4 rounded mb-2" />
      <Skeleton className="h-3 w-full rounded mb-1" />
      <Skeleton className="h-3 w-2/3 rounded" />
      <div className="flex items-center justify-between mt-3">
        <Skeleton className="h-3 w-12 rounded" />
        <div className="flex gap-1">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="w-5 h-5 rounded" />
        </div>
      </div>
    </div>
  );
}
