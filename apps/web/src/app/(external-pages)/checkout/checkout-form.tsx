'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { createOrderAction } from '@/data/user/orders';
import { useCart } from '@/contexts/cart-context';
import { formatMoney, formatPriceWithUnit } from '@/utils/format';
import { useAction } from 'next-safe-action/hooks';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ENVIO_LOCAL = 0;
const ENVIO_NACIONAL = 199;

type Shipping = {
  nombre: string;
  telefono: string;
  calle: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  notas: string;
};

const emptyShipping: Shipping = {
  nombre: '',
  telefono: '',
  calle: '',
  colonia: '',
  ciudad: '',
  estado: '',
  codigo_postal: '',
  notas: '',
};

function SectionCard({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary font-mono text-xs font-bold text-primary-foreground">
            {step}
          </span>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function CheckoutForm() {
  const { items, subtotal } = useCart();
  const router = useRouter();
  const [shipping, setShipping] = useState<Shipping>(emptyShipping);
  const [metodoEnvio, setMetodoEnvio] = useState<'local' | 'nacional'>('local');
  const [couponCode, setCouponCode] = useState('');

  const { execute, status } = useAction(createOrderAction, {
    onSuccess: ({ data }) => {
      if (data?.orderId) {
        router.push(`/checkout/success?order=${data.orderId}`);
      }
    },
    onError: ({ error }) => {
      console.error(error.serverError ?? error.validationErrors);
    },
  });

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
        <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
        <div>
          <p className="text-lg font-medium">Tu carrito está vacío</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Agrega productos del catálogo para continuar.
          </p>
        </div>
        <Link
          href="/catalogo"
          className="mt-2 text-sm font-semibold text-primary hover:underline"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  const envioCosto = metodoEnvio === 'nacional' ? ENVIO_NACIONAL : ENVIO_LOCAL;

  const set = (field: keyof Shipping) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setShipping((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    execute({
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
      shipping,
      metodo_envio: metodoEnvio,
      couponCode: couponCode || undefined,
    });
  };

  const radioClasses = (selected: boolean) =>
    `flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
      selected
        ? 'border-primary bg-primary/5 ring-1 ring-primary'
        : 'hover:bg-accent/50'
    }`;

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <SectionCard step="1" title="Datos de envío">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input id="nombre" required value={shipping.nombre} onChange={set('nombre')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" required value={shipping.telefono} onChange={set('telefono')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="codigo_postal">Código postal</Label>
              <Input id="codigo_postal" required value={shipping.codigo_postal} onChange={set('codigo_postal')} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="calle">Calle y número</Label>
              <Input id="calle" required value={shipping.calle} onChange={set('calle')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="colonia">Colonia</Label>
              <Input id="colonia" value={shipping.colonia} onChange={set('colonia')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input id="ciudad" required value={shipping.ciudad} onChange={set('ciudad')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="estado">Estado</Label>
              <Input id="estado" required value={shipping.estado} onChange={set('estado')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="notas">Notas (opcional)</Label>
              <Input id="notas" value={shipping.notas} onChange={set('notas')} />
            </div>
          </div>
        </SectionCard>

        <SectionCard step="2" title="Método de envío">
          <div className="space-y-2">
            <label className={radioClasses(metodoEnvio === 'local')}>
              <input
                type="radio"
                name="envio"
                checked={metodoEnvio === 'local'}
                onChange={() => setMetodoEnvio('local')}
                className="accent-primary"
              />
              <div>
                <p className="text-sm font-medium">Local</p>
                <p className="text-xs text-muted-foreground">Gratis</p>
              </div>
            </label>
            <label className={radioClasses(metodoEnvio === 'nacional')}>
              <input
                type="radio"
                name="envio"
                checked={metodoEnvio === 'nacional'}
                onChange={() => setMetodoEnvio('nacional')}
                className="accent-primary"
              />
              <div>
                <p className="text-sm font-medium">Nacional (México)</p>
                <p className="text-xs text-muted-foreground">
                  {formatMoney(ENVIO_NACIONAL)} — solo productos con envío nacional
                </p>
              </div>
            </label>
          </div>
        </SectionCard>

        <SectionCard step="3" title="Cupón">
          <Input
            placeholder="Código de cupón (opcional)"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
        </SectionCard>
      </div>

      <aside className="h-fit space-y-4 rounded-xl border bg-card p-5 lg:sticky lg:top-28">
        <h2 className="text-base font-bold">Resumen del pedido</h2>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between gap-2 text-sm">
              <span className="truncate">
                {item.nombre}{' '}
                <span className="text-muted-foreground">× {item.quantity}</span>
              </span>
              <span className="whitespace-nowrap">
                {formatPriceWithUnit(item.precio, item.simbolo)}
              </span>
            </div>
          ))}
        </div>
        <Separator />
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Envío</span>
            <span>{formatMoney(envioCosto)}</span>
          </div>
        </div>
        <Separator />
        <p className="text-xs text-muted-foreground">
          Al confirmar recibirás tu pedido por WhatsApp con el detalle de
          productos, total y datos de envío. Te confirmamos disponibilidad y
          flete antes de pagar.
        </p>
        <Button type="submit" className="w-full" disabled={status === 'executing'}>
          {status === 'executing' ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Enviando pedido…
            </>
          ) : (
            'Confirmar pedido'
          )}
        </Button>
        <p className="text-center font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
          Sin pago en línea · Confirmación por WhatsApp
        </p>
      </aside>
    </form>
  );
}
