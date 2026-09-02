import { getProducts, type CatalogProduct } from '@/data/anon/catalog';
import { ProductCard } from '@/components/catalog/product-card';
import { connection } from 'next/server';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

/**
 * Fila horizontal de productos curados (búsqueda por término(s)).
 * El catálogo completo queda en /catalogo con el buscador global.
 */
export async function CuratedRow({
  eyebrow,
  title,
  terms,
  href,
}: {
  eyebrow: string;
  title: string;
  terms: string[];
  href: string;
}) {
  await connection();
  const seen = new Map<string, CatalogProduct>();
  for (const term of terms) {
    const { products } = await getProducts({ q: term, pageSize: 8 });
    for (const product of products) {
      if (!seen.has(product.id)) seen.set(product.id, product);
    }
  }
  const products = [...seen.values()].slice(0, 8);
  if (products.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
            {title}
          </h2>
        </div>
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Ver todos <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {products.map((product) => (
          <div key={product.id} className="w-40 shrink-0 sm:w-48">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
