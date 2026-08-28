import { Skeleton } from '@/components/ui/skeleton';

export function SidebarSkeleton() {
  return (
    <aside className="space-y-6">
      <Skeleton className="h-9 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </aside>
  );
}
