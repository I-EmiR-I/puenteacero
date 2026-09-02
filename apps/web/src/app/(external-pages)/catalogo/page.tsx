import { Suspense } from 'react';
import { CatalogGrid } from './catalog-grid';
import { CatalogSidebar } from './catalog-sidebar';
import { CatalogSkeleton } from './catalog-skeleton';
import { MobileCatalogNav } from './mobile-catalog-nav';
import { SidebarSkeleton } from './sidebar-skeleton';
import type { CatalogFilters } from './catalog-nav';

export type { CatalogFilters };

export const PAGE_SIZE = 24;

export default function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<CatalogFilters>;
}) {
  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-4 md:py-8">
      <div className="mb-4 md:mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
          Productos
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Catálogo
        </h1>
      </div>
      <Suspense fallback={null}>
        <MobileCatalogNav searchParams={searchParams} />
      </Suspense>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
        <div className="hidden md:block">
          <Suspense fallback={<SidebarSkeleton />}>
            <CatalogSidebar searchParams={searchParams} />
          </Suspense>
        </div>
        <Suspense fallback={<CatalogSkeleton />}>
          <CatalogGrid searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
