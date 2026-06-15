import { Skeleton } from "@/components/ui/skeleton";

export function StatsCardSkeleton() {
  return (
    <div className="tome-card rounded-lg p-5 flex items-center gap-5">
      <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-12 rounded" />
        <Skeleton className="h-4 w-24 rounded" />
      </div>
    </div>
  );
}
