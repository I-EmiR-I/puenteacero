'use client';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AdminOrder } from '@/data/admin/queries';
import { updateOrderStatusAction } from '@/data/user/admin';
import { formatMoney } from '@/utils/format';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';

const STATUSES = [
  'pending',
  'approved',
  'rejected',
  'cancelled',
  'expired',
  'refunded',
  'error',
] as const;

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
  expired: 'Expirado',
  refunded: 'Reembolsado',
  error: 'Error',
};

export function OrdersAdmin({ orders }: { orders: AdminOrder[] }) {
  const { execute } = useAction(updateOrderStatusAction, {
    onSuccess: () => toast.success('Estado actualizado'),
    onError: ({ error }) => toast.error(error.serverError ?? 'Error'),
  });

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
        No hay órdenes todavía
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Productos</TableHead>
          <TableHead>Envío</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="whitespace-nowrap">
              {new Date(order.created_at).toLocaleDateString('es-MX')}
            </TableCell>
            <TableCell>{order.email ?? order.user_id.slice(0, 8)}</TableCell>
            <TableCell>
              <div className="space-y-0.5 text-sm">
                {order.items.map((item) => (
                  <div key={item.id} className="text-muted-foreground">
                    {item.nombre} × {item.quantity}
                  </div>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{order.metodo_envio}</Badge>
            </TableCell>
            <TableCell className="font-medium">{formatMoney(order.total)}</TableCell>
            <TableCell>
              <select
                className="h-8 rounded-md border bg-transparent px-2 text-sm"
                value={order.status}
                onChange={(e) =>
                  execute({ id: order.id, status: e.target.value as (typeof STATUSES)[number] })
                }
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
