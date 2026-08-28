import { getAdminCoupons } from '@/data/admin/queries';
import { connection } from 'next/server';
import { CouponsAdmin } from './coupons-admin';

export const instant = false;

export default async function AdminCuponesPage() {
  // request-time: evita Date.now() durante prerender (Supabase __loadSession)
  await connection();
  const coupons = await getAdminCoupons();
  return <CouponsAdmin coupons={coupons} />;
}
