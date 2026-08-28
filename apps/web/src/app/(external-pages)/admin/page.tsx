import {
  getAdminCategories,
  getAdminCoupons,
  getAdminOrders,
  getAdminProducts,
} from '@/data/admin/queries';
import { connection } from 'next/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Tags, TicketPercent } from 'lucide-react';
import Link from 'next/link';

export const instant = false;

export default async function AdminDashboardPage() {
  // request-time: evita Date.now() durante prerender (Supabase __loadSession)
  await connection();
  const [products, categories, coupons, orders] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
    getAdminCoupons(),
    getAdminOrders(),
  ]);

  const stats = [
    { label: 'Productos', value: products.length, href: '/admin/productos', icon: Package },
    { label: 'Categorías', value: categories.length, href: '/admin/categorias', icon: Tags },
    { label: 'Cupones', value: coupons.length, href: '/admin/cupones', icon: TicketPercent },
    { label: 'Órdenes', value: orders.length, href: '/admin/ordenes', icon: ShoppingCart },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Link key={stat.label} href={stat.href}>
          <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
