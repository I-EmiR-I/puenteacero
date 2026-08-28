import { getCategories } from '@/data/anon/catalog';
import { getCategoryStats } from '@/data/anon/catalog-counts';
import {
  familiaDisplayName,
  familiaSlug,
} from '@/data/anon/familias';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { connection } from 'next/server';
import { ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';
import type { CatalogFilters } from './page';

function catalogHref(
  current: CatalogFilters,
  overrides: Partial<CatalogFilters>
): string {
  const merged: Record<string, string> = {};
  const next = { ...current, ...overrides };
  for (const [key, value] of Object.entries(next)) {
    if (value && key !== 'pagina') merged[key] = value;
  }
  const qs = new URLSearchParams(merged).toString();
  return qs ? `/catalogo?${qs}` : '/catalogo';
}

type Familia = {
  display: string;
  slug: string;
  total: number;
  subcats: Array<{ id: string; nombre: string; slug: string; count: number }>;
};

export async function CatalogSidebar({
  searchParams,
}: {
  searchParams: Promise<CatalogFilters>;
}) {
  await connection();
  const current = await searchParams;
  const [categories, stats] = await Promise.all([
    getCategories(),
    getCategoryStats(),
  ]);

  // Agrupar subcategorías por familia (Weston), ocultando vacías
  const familias = new Map<string, Familia>();
  for (const cat of categories) {
    if (!cat.parent_id) continue;
    const count = stats.counts[cat.id] ?? 0;
    if (count === 0) continue;
    const raw = stats.familiaByCategory[cat.id] ?? '';
    const key = raw || '__otros__';
    if (!familias.has(key)) {
      familias.set(key, {
        display: familiaDisplayName(raw) || 'Otros',
        slug: familiaSlug(raw) || 'otros',
        total: 0,
        subcats: [],
      });
    }
    const familia = familias.get(key)!;
    familia.total += count;
    familia.subcats.push({ id: cat.id, nombre: cat.nombre, slug: cat.slug, count });
  }
  const lista = [...familias.values()].sort((a, b) => b.total - a.total);

  const totalProducts = Object.values(stats.counts).reduce((a, b) => a + b, 0);

  // Familia activa (por ?familia o porque el producto está en una subcat suya)
  const activeFamilia =
    lista.find((f) => f.slug === current.familia) ??
    lista.find((f) =>
      f.subcats.some((c) => c.slug === current.categoria)
    );

  const countLabel = (n: number) => n.toLocaleString('es-MX');

  return (
    <aside className="space-y-6">
      <form action="/catalogo" method="get" className="flex gap-2">
        {current.categoria ? (
          <input type="hidden" name="categoria" value={current.categoria} />
        ) : null}
        {current.familia ? (
          <input type="hidden" name="familia" value={current.familia} />
        ) : null}
        <Input
          type="search"
          name="q"
          defaultValue={current.q ?? ''}
          placeholder="Buscar productos…"
        />
        <Button type="submit" variant="secondary" size="icon" aria-label="Buscar">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      <div>
        <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Familias
        </h3>
        <ul className="space-y-0.5 text-sm">
          <li>
            <Link
              href={catalogHref(current, {
                categoria: undefined,
                familia: undefined,
                unidad: undefined,
              })}
              className={
                !current.categoria && !current.familia
                  ? 'flex items-center justify-between rounded-md bg-accent px-2.5 py-1.5 font-medium text-accent-foreground'
                  : 'flex items-center justify-between rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground'
              }
            >
              <span>Todos los productos</span>
              <span className="font-mono text-[10px]">
                {countLabel(totalProducts)}
              </span>
            </Link>
          </li>
          {lista.map((familia) => {
            const active = activeFamilia?.slug === familia.slug;
            return (
              <li key={familia.slug}>
                <Link
                  href={catalogHref(current, {
                    categoria: undefined,
                    familia: familia.slug,
                  })}
                  className={
                    active
                      ? 'flex items-center justify-between rounded-md bg-accent px-2.5 py-1.5 font-medium text-accent-foreground'
                      : 'flex items-center justify-between rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground'
                  }
                >
                  <span className="flex items-center gap-1">
                    {familia.display}
                    {active && familia.subcats.length > 0 ? (
                      <ChevronRight className="h-3.5 w-3.5" />
                    ) : null}
                  </span>
                  <span className="font-mono text-[10px]">
                    {countLabel(familia.total)}
                  </span>
                </Link>
                {active && familia.subcats.length > 0 ? (
                  <ul className="ml-3 mt-0.5 space-y-0.5 border-l pl-2">
                    {familia.subcats.map((subcat) => (
                      <li key={subcat.id}>
                        <Link
                          href={catalogHref(current, {
                            categoria: subcat.slug,
                          })}
                          className={
                            current.categoria === subcat.slug
                              ? 'flex items-center justify-between rounded-md bg-accent px-2.5 py-1.5 font-medium text-accent-foreground'
                              : 'flex items-center justify-between rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground'
                          }
                        >
                          <span>{subcat.nombre}</span>
                          <span className="font-mono text-[10px]">
                            {countLabel(subcat.count)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
