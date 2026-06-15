import { Skeleton } from "@/components/ui/skeleton";

export function ItemCardSkeleton() {
  return (
    <div className="tome-card relative rounded-lg overflow-hidden">
      {/* left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-0.75 rounded-l-lg bg-white/10" />

      <div className="pl-5 pr-4 py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-5 w-3/4 rounded" />
            <Skeleton className="h-3 w-full rounded" />
          </div>
        </div>
        <div className="flex gap-1 mt-3">
          <Skeleton className="h-4 w-12 rounded" />
          <Skeleton className="h-4 w-14 rounded" />
          <Skeleton className="h-4 w-10 rounded" />
        </div>
      </div>
    </div>
  );
}
