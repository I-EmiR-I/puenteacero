import { getUserOrders } from '@/data/user/orders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { connection } from 'next/server';
import { formatMoney } from '@/utils/format';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
  expired: 'Expirado',
  refunded: 'Reembolsado',
  error: 'Error',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-600 dark:text-amber-500',
  approved: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-500',
  rejected: 'bg-red-500/15 text-red-600 dark:text-red-500',
  cancelled: 'bg-red-500/15 text-red-600 dark:text-red-500',
  expired: 'bg-muted text-muted-foreground',
  refunded: 'bg-muted text-muted-foreground',
  error: 'bg-red-500/15 text-red-600 dark:text-red-500',
};

export async function OrdersList() {
  await connection();
  const orders = await getUserOrders();

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
        <p className="text-lg font-medium">Aún no tienes pedidos</p>
        <p className="text-sm text-muted-foreground">
          Explora el catálogo y haz tu primer pedido.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">
              Pedido ·{' '}
              {new Date(order.created_at).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </CardTitle>
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[order.status] ?? 'bg-muted text-muted-foreground'}`}
            >
              {STATUS_LABEL[order.status] ?? order.status}
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-2 text-sm"
                >
                  <span className="truncate">
                    {item.nombre}{' '}
                    <span className="text-muted-foreground">
                      × {item.quantity} {item.unidad}
                    </span>
                  </span>
                  <span className="whitespace-nowrap">
                    {formatMoney(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-1 text-sm">
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
