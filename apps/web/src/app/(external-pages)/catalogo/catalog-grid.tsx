import { getProducts } from '@/data/anon/catalog';
import { connection } from 'next/server';
import { ProductCard } from '@/components/catalog/product-card';
import { PackageSearch } from 'lucide-react';
import Link from 'next/link';
import type { CatalogFilters } from './page';
import { PAGE_SIZE } from './page';

function paginationHref(current: CatalogFilters, page: number): string {
  const merged: Record<string, string> = {};
  for (const [key, value] of Object.entries(current)) {
    if (value && key !== 'pagina') merged[key] = value;
  }
  if (page > 1) merged.pagina = String(page);
  const qs = new URLSearchParams(merged).toString();
  return qs ? `/catalogo?${qs}` : '/catalogo';
}

export async function CatalogGrid({
  searchParams,
}: {
  searchParams: Promise<CatalogFilters>;
}) {
  await connection();
  const current = await searchParams;
  const page = Number(current.pagina) || 1;
  const { products, total } = await getProducts({
    category: current.categoria,
    q: current.q,
    unit: current.unidad,
    page,
    pageSize: PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-24 text-center">
        <PackageSearch className="h-10 w-10 text-muted-foreground/50" />
        <div>
          <p className="text-lg font-medium">No hay productos</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Intenta con otra búsqueda o categoría.
          </p>
        </div>
      </div>
    );
  }

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div>
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {total} producto{total === 1 ? '' : 's'}
        {total > PAGE_SIZE ? ` · mostrando ${from}–${to}` : ''}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-3">
          {page > 1 ? (
            <Link
              href={paginationHref(current, page - 1)}
              className="rounded-lg border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              ← Anterior
            </Link>
          ) : null}
          <span className="font-mono text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={paginationHref(current, page + 1)}
              className="rounded-lg border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Siguiente →
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
