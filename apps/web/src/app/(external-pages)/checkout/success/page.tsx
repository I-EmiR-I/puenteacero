import { Suspense } from 'react';
import { connection } from 'next/server';
import { getOrderById } from '@/data/user/orders';
import { whatsappHref } from '@/utils/whatsapp';
import { formatMoney } from '@/utils/format';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import Link from 'next/link';

function waOrderText(order: Awaited<ReturnType<typeof getOrderById>>): string {
  if (!order) return '';
  const s = (order.shipping_address ?? {}) as Record<string, string>;
  const lineas = [
    '*Nuevo pedido PuenteAcero*',
    `Pedido: ${order.id.slice(0, 8).toUpperCase()}`,
    '',
    '*Productos:*',
    ...order.items.map(
      (item) =>
        `- ${item.nombre} (${item.sku}) x${item.quantity} = ${formatMoney(item.subtotal)}`
    ),
    '',
    `Subtotal: ${formatMoney(order.subtotal)}`,
    order.descuento > 0 ? `Descuento: -${formatMoney(order.descuento)}` : '',
    `Envío (${order.metodo_envio}): ${formatMoney(order.envio_costo)}`,
    `*Total: ${formatMoney(order.total)}*`,
    '',
    '*Cliente:*',
    s.nombre ?? '',
    `Tel: ${s.telefono ?? ''}`,
    `${s.calle ?? ''}${s.colonia ? `, ${s.colonia}` : ''}`,
    `${s.ciudad ?? ''}, ${s.estado ?? ''} CP ${s.codigo_postal ?? ''}`,
    s.notas ? `Notas: ${s.notas}` : '',
  ].filter(Boolean);
  return lineas.join('\n');
}

async function SuccessContent({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  await connection();
  const { order: orderId } = await searchParams;
  const order = orderId ? await getOrderById(orderId) : null;
  const wa = whatsappHref(waOrderText(order) || 'Hola, acabo de hacer un pedido en PuenteAcero.');

  return (
    <>
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <CheckCircle2 className="h-8 w-8" />
      </span>
      <h1 className="text-2xl font-bold tracking-tight">¡Pedido recibido!</h1>
      <p className="text-muted-foreground">
        Envíanos tu pedido por WhatsApp para confirmarlo. Te responderemos con
        disponibilidad, flete y forma de pago.
      </p>

      {order ? (
        <div className="w-full rounded-xl border bg-card p-5 text-left">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Pedido {order.id.slice(0, 8).toUpperCase()} ·{' '}
            {order.items.length} artículo{order.items.length === 1 ? '' : 's'}
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-2">
                <span className="truncate">
                  {item.nombre}{' '}
                  <span className="text-muted-foreground">
                    x{item.quantity}
                  </span>
                </span>
                <span className="whitespace-nowrap">
                  {formatMoney(item.subtotal)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatMoney(order.subtotal)}</span>
            </div>
            {order.descuento > 0 ? (
              <div className="flex justify-between text-green-600">
                <span>Descuento</span>
                <span>-{formatMoney(order.descuento)}</span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span>{formatMoney(order.envio_costo)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatMoney(order.total)}</span>
            </div>
          </div>
        </div>
      ) : null}

      {wa ? (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 w-full max-w-sm items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <MessageCircle className="h-5 w-5" />
          Enviar pedido por WhatsApp
        </a>
      ) : null}

      <p className="text-xs text-muted-foreground">
        También puedes ver tu pedido en tu cuenta. Te notificaremos cuando esté
        confirmado.
      </p>
      <div className="flex gap-3">
        <Link
          href="/cuenta"
          className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Ver mis pedidos
        </Link>
        <Link
          href="/catalogo"
          className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Seguir comprando
        </Link>
      </div>
    </>
  );
}

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  return (
    <div className="container mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-16 text-center">
      <Suspense fallback={null}>
        <SuccessContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
