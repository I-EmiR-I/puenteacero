import { getAdminOrders } from '@/data/admin/queries';
import { connection } from 'next/server';
import { OrdersAdmin } from './orders-admin';

export const instant = false;

export default async function AdminOrdenesPage() {
  // request-time: evita Date.now() durante prerender (Supabase __loadSession)
  await connection();
  const orders = await getAdminOrders();
  return <OrdersAdmin orders={orders} />;
}
