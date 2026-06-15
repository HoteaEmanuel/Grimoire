import { Skeleton } from "@/components/ui/skeleton";
import { StatsCardSkeleton } from "@/components/dashboard/StatsCardSkeleton";
import { CollectionCardSkeleton } from "@/components/dashboard/CollectionCardSkeleton";
import { ItemCardSkeleton } from "@/components/dashboard/ItemCardSkeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <div className="flex gap-4 items-center">
          <Skeleton className="h-9 w-48 rounded" />
          <Skeleton className="w-7 h-7 rounded-full" />
        </div>
        <Skeleton className="h-4 w-64 rounded mt-2" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Recent Collections */}
      <section>
        <Skeleton className="h-4 w-36 rounded mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CollectionCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Recent Items */}
      <section>
        <Skeleton className="h-4 w-28 rounded mb-3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <ItemCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
