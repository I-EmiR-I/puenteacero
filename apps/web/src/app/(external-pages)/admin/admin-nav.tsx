'use client';

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  TicketPercent,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Resumen', icon: LayoutDashboard },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/categorias', label: 'Categorías', icon: Tags },
  { href: '/admin/cupones', label: 'Cupones', icon: TicketPercent },
  { href: '/admin/ordenes', label: 'Órdenes', icon: ShoppingCart },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 text-sm">
      {navItems.map((item) => {
        const active =
          item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium transition-colors ${
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
