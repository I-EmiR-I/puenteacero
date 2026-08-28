import 'server-only';
import { createAdminClient } from '@/supabase-clients/admin';
import type { Table } from '@/types';

export type AdminProduct = Table<'products'> & {
  category: Pick<Table<'categories'>, 'nombre'> | null;
  unit: Pick<Table<'units'>, 'nombre' | 'simbolo'>;
};

export type AdminOrder = Table<'orders'> & {
  items: Table<'order_items'>[];
  email: string | null;
};

export const getAdminProducts = async (): Promise<AdminProduct[]> => {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('products')
    .select('*, category:categories(nombre), unit:units(nombre, simbolo)')
    .order('nombre', { ascending: true });
  if (error) throw error;
  return (data as AdminProduct[]) ?? [];
};

export const getAdminCategories = async (): Promise<Table<'categories'>[]> => {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('categories')
    .select('*')
    .order('orden', { ascending: true });
  if (error) throw error;
  return data ?? [];
};

export const getAdminCoupons = async (): Promise<Table<'coupons'>[]> => {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const getAdminOrders = async (): Promise<AdminOrder[]> => {
  const admin = createAdminClient();
  const { data: orders, error } = await admin
    .from('orders')
    .select('*, items:order_items(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;

  const userIds = [...new Set((orders ?? []).map((o) => o.user_id))];
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, email')
    .in('id', userIds);
  const emailById = new Map(
    (profiles ?? []).map((p) => [p.id, p.email as string | null])
  );

  return (orders ?? []).map((o) => ({
    ...o,
    email: emailById.get(o.user_id) ?? null,
  }));
};
