import {
  getAdminCategories,
  getAdminProducts,
} from '@/data/admin/queries';
import { getUnits } from '@/data/anon/catalog';
import { connection } from 'next/server';
import { ProductsAdmin } from './products-admin';

export const instant = false;

export default async function AdminProductosPage() {
  // request-time: evita Date.now() durante prerender (Supabase __loadSession)
  await connection();
  const [products, categories, units] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
    getUnits(),
  ]);

  return (
    <ProductsAdmin
      products={products}
      categories={categories}
      units={units}
    />
  );
}
