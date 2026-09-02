import { Suspense } from 'react';
import { HomeFamilias } from './home-familias';
import { HomeHero } from './home-hero';
import { CuratedRow } from './curated-row';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HomeHero />

      <div className="container mx-auto max-w-screen-2xl space-y-10 px-4 pb-14">
        <Suspense fallback={null}>
          <HomeFamilias />
        </Suspense>

        <Suspense fallback={<RowSkeleton />}>
          <CuratedRow
            eyebrow="Lo más pedido"
            title="Inversores de soldadura"
            terms={['inversor']}
            href="/catalogo?q=inversor"
          />
        </Suspense>

        <Suspense fallback={<RowSkeleton />}>
          <CuratedRow
            eyebrow="Limpieza a presión"
            title="Hidrolavadoras"
            terms={['hidrolavadora']}
            href="/catalogo?q=hidrolavadora"
          />
        </Suspense>

        <Suspense fallback={<RowSkeleton />}>
          <CuratedRow
            eyebrow="Acabados"
            title="Pulidoras y esmeriladoras"
            terms={['pulidor', 'esmeriladora']}
            href="/catalogo?q=esmeriladora"
          />
        </Suspense>

        <Suspense fallback={<RowSkeleton />}>
          <CuratedRow
            eyebrow="Perforación"
            title="Taladros y rotomartillos"
            terms={['taladro', 'rotomartillo']}
            href="/catalogo?q=taladro"
          />
        </Suspense>
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-5 w-56 animate-pulse rounded-md bg-muted" />
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-64 w-40 shrink-0 animate-pulse rounded-xl bg-muted sm:w-48"
          />
        ))}
      </div>
    </div>
  );
}
