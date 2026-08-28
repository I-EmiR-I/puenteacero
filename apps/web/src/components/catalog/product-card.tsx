import type { CatalogProduct } from '@/data/anon/catalog';
import { Card, CardContent } from '@/components/ui/card';
import { formatPriceWithUnit } from '@/utils/format';
import Image from 'next/image';
import Link from 'next/link';

export function ProductCard({ product }: { product: CatalogProduct }) {
  const image = product.images?.[0]?.url;
  const sinStock = product.stock <= 0;

  return (
    <Link href={`/producto/${product.slug}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden border bg-card transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-lg">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image}
              alt={product.images?.[0]?.alt ?? product.nombre}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Sin imagen
            </div>
          )}
          {product.envio_nacional ? (
            <span className="absolute left-2 top-2 rounded-md bg-background/85 px-2 py-0.5 text-[11px] font-medium backdrop-blur">
              Envío nacional
            </span>
          ) : null}
        </div>
        <CardContent className="flex flex-1 flex-col gap-1 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {product.category?.nombre ?? '—'}
          </p>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
            {product.nombre}
          </h3>
          <div className="mt-auto flex items-end justify-between gap-2 pt-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                Precio
              </p>
              <p className="text-lg font-bold text-primary">
                {formatPriceWithUnit(product.precio, product.unit.simbolo)}
              </p>
            </div>
            <span
              className={
                sinStock
                  ? 'inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-500'
                  : 'inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-500'
              }
            >
              <span
                className={
                  sinStock
                    ? 'h-1.5 w-1.5 rounded-full bg-amber-500'
                    : 'h-1.5 w-1.5 rounded-full bg-emerald-500'
                }
              />
              {sinStock ? 'Por confirmar' : 'Disponible'}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
