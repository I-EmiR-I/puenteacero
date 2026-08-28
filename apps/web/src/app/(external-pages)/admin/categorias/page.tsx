import { getAdminCategories } from '@/data/admin/queries';
import { connection } from 'next/server';
import { CategoriesAdmin } from './categories-admin';

export const instant = false;

export default async function AdminCategoriasPage() {
  // request-time: evita Date.now() durante prerender (Supabase __loadSession)
  await connection();
  const categories = await getAdminCategories();
  return <CategoriesAdmin categories={categories} />;
}
