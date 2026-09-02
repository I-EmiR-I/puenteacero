import { connection } from 'next/server';
import Link from 'next/link';
import {
  activeFamilia,
  catalogHref,
  getCatalogNavData,
  type CatalogFilters,
} from './catalog-nav';

/**
 * Navegación móvil estilo marketplace: chips horizontales de familias y
 * subcategorías. Reemplaza al sidebar en pantallas < md.
 */
export async function MobileCatalogNav({
  searchParams,
}: {
  searchParams: Promise<CatalogFilters>;
}) {
  await connection();
  const current = await searchParams;
  const familias = await getCatalogNavData();
  const active = activeFamilia(familias, current);

  const chip = (label: string, href: string, isActive: boolean) => (
    <Link
      href={href}
      className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        isActive
          ? 'border-transparent bg-primary font-medium text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="mb-4 space-y-2 md:hidden">
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5">
        {chip(
          'Todos',
          catalogHref(current, {
            categoria: undefined,
            familia: undefined,
            unidad: undefined,
          }),
          !current.categoria && !current.familia
        )}
        {familias.map((familia) =>
          chip(
            familia.display,
            catalogHref(current, {
              categoria: undefined,
              familia: familia.slug,
            }),
            active?.slug === familia.slug
          )
        )}
      </div>
      {active && active.subcats.length > 0 ? (
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5">
          {active.subcats.map((subcat) =>
            chip(
              subcat.nombre,
              catalogHref(current, { categoria: subcat.slug }),
              current.categoria === subcat.slug
            )
          )}
        </div>
      ) : null}
    </div>
  );
}
