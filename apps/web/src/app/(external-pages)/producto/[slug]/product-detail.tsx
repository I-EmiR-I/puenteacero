import { getProductBySlug } from '@/data/anon/catalog';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPriceWithUnit } from '@/utils/format';
import { whatsappHref } from '@/utils/whatsapp';
import { connection } from 'next/server';
import { MessageCircle, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Keys internas de especificaciones que no deben mostrarse al cliente
const HIDDEN_SPEC_KEYS = new Set([
  'imagen_weston',
  'costo',
  'familia_weston',
  'subfamilia_weston',
  'empaque',
]);

export async function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const specs = Object.entries(product.especificaciones ?? {}).filter(
    ([key, value]) =>
      !HIDDEN_SPEC_KEYS.has(key) &&
      value !== null &&
      value !== undefined &&
      value !== ''
  );
  const sinStock = product.stock <= 0;
  const wa = whatsappHref(
    `Hola, me interesa este producto: ${product.nombre} (SKU ${product.sku ?? '-'}). ¿Está disponible?`
  );

  return (
    <>
      <nav className="mb-6 flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
        <Link href="/catalogo" className="transition-colors hover:text-foreground">
          Catálogo
        </Link>
        {product.category ? (
          <>
            <span className="text-muted-foreground/50">/</span>
            <span>{product.category.nombre}</span>
          </>
        ) : null}
        <span className="text-muted-foreground/50">/</span>
        <span className="max-w-[16rem] truncate text-foreground">
          {product.nombre}
        </span>
      </nav>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl border bg-muted">
          {product.images?.[0]?.url ? (
            <Image
              src={product.images[0].url}
              alt={product.images[0].alt ?? product.nombre}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Sin imagen
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
              {product.category?.nombre ?? 'Producto'}
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              {product.nombre}
            </h1>
            {product.sku ? (
              <p className="font-mono text-xs text-muted-foreground">
                SKU: {product.sku}
              </p>
            ) : null}
          </div>

          <div className="flex items-end gap-3">
            <p className="text-4xl font-bold tracking-tight text-primary">
              {formatPriceWithUnit(product.precio, product.unit.simbolo)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {product.envio_nacional ? (
              <Badge variant="outline" className="gap-1.5">
                <Truck className="h-3.5 w-3.5" /> Envío nacional
              </Badge>
            ) : (
              <Badge variant="outline">Solo envío local</Badge>
            )}
            <Badge
              variant={sinStock ? 'secondary' : 'secondary'}
              className={
                sinStock
                  ? 'gap-1.5 bg-amber-500/15 text-amber-600 dark:text-amber-500'
                  : 'gap-1.5'
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
            </Badge>
          </div>

          {product.descripcion ? (
            <p className="text-muted-foreground">{product.descripcion}</p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <AddToCartButton
              product={{
                id: product.id,
                nombre: product.nombre,
                slug: product.slug,
                precio: product.precio,
                simbolo: product.unit.simbolo,
                admiteDecimales: product.unit.admite_decimales,
                imagen: product.images?.[0]?.url ?? null,
                stock: product.stock,
              }}
            />
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <MessageCircle className="h-4 w-4" /> Cotizar por WhatsApp
              </a>
            ) : null}
          </div>

          {specs.length > 0 ? (
            <>
              <Separator />
              <div>
                <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Especificaciones
                </h2>
                <dl className="overflow-hidden rounded-xl border">
                  {specs.map(([key, value], index) => (
                    <div
                      key={key}
                      className={`flex justify-between gap-4 px-4 py-2.5 text-sm ${
                        index % 2 === 0 ? 'bg-muted/50' : ''
                      }`}
                    >
                      <dt className="text-muted-foreground capitalize">
                        {key}
                      </dt>
                      <dd className="font-medium">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
