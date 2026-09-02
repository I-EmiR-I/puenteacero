import { connection } from 'next/server';
import { ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  activeFamilia,
  catalogHref,
  getCatalogNavData,
  type CatalogFilters,
} from './catalog-nav';

export async function CatalogSidebar({
  searchParams,
}: {
  searchParams: Promise<CatalogFilters>;
}) {
  await connection();
  const current = await searchParams;
  const lista = await getCatalogNavData();
  const active = activeFamilia(lista, current);

  const totalProducts = lista.reduce((a, f) => a + f.total, 0);
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
            const isActive = active?.slug === familia.slug;
            return (
              <li key={familia.slug}>
                <Link
                  href={catalogHref(current, {
                    categoria: undefined,
                    familia: familia.slug,
                  })}
                  className={
                    isActive
                      ? 'flex items-center justify-between rounded-md bg-accent px-2.5 py-1.5 font-medium text-accent-foreground'
                      : 'flex items-center justify-between rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground'
                  }
                >
                  <span className="flex items-center gap-1">
                    {familia.display}
                    {isActive && familia.subcats.length > 0 ? (
                      <ChevronRight className="h-3.5 w-3.5" />
                    ) : null}
                  </span>
                  <span className="font-mono text-[10px]">
                    {countLabel(familia.total)}
                  </span>
                </Link>
                {isActive && familia.subcats.length > 0 ? (
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
