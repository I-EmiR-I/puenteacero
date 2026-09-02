import { connection } from 'next/server';
import Link from 'next/link';
import { getCatalogNavData } from './catalogo/catalog-nav';

/** Chips de las familias con más productos (atajo al catálogo) */
export async function HomeFamilias() {
  await connection();
  const familias = await getCatalogNavData();
  if (familias.length === 0) return null;
  const top = familias.slice(0, 12);

  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pt-6">
      <Link
        href="/catalogo"
        className="whitespace-nowrap rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
      >
        Catálogo completo
      </Link>
      {top.map((familia) => (
        <Link
          key={familia.slug}
          href={`/catalogo?familia=${familia.slug}`}
          className="whitespace-nowrap rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {familia.display}
        </Link>
      ))}
    </div>
  );
}
