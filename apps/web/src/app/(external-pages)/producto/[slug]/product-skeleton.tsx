import { Skeleton } from '@/components/ui/skeleton';

export function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-9 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-10 w-48" />
      </div>
    </div>
  );
}
