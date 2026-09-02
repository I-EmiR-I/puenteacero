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
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Sin imagen
            </div>
          )}
          {product.envio_nacional ? (
            <span className="absolute left-1.5 top-1.5 rounded-md bg-background/85 px-1.5 py-0.5 text-[10px] font-medium backdrop-blur sm:left-2 sm:top-2 sm:px-2 sm:text-[11px]">
              Envío nacional
            </span>
          ) : null}
        </div>
        <CardContent className="flex flex-1 flex-col gap-1 p-2.5 sm:p-4">
          <p className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:block">
            {product.category?.nombre ?? '—'}
          </p>
          <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug sm:text-sm">
            {product.nombre}
          </h3>
          <div className="mt-auto flex items-end justify-between gap-2 pt-2 sm:pt-3">
            <div className="min-w-0">
              <p className="hidden font-mono text-[10px] uppercase tracking-wide text-muted-foreground sm:block">
                Precio
              </p>
              <p className="truncate text-sm font-bold text-primary sm:text-lg">
                {formatPriceWithUnit(product.precio, product.unit.simbolo)}
              </p>
            </div>
            <span
              className={
                sinStock
                  ? 'inline-flex shrink-0 items-center gap-1 text-[10px] text-amber-600 sm:text-xs dark:text-amber-500'
                  : 'inline-flex shrink-0 items-center gap-1 text-[10px] text-emerald-600 sm:text-xs dark:text-emerald-500'
              }
            >
              <span
                className={
                  sinStock
                    ? 'h-1.5 w-1.5 rounded-full bg-amber-500'
                    : 'h-1.5 w-1.5 rounded-full bg-emerald-500'
                }
              />
              <span className="hidden sm:inline">
                {sinStock ? 'Por confirmar' : 'Disponible'}
              </span>
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
