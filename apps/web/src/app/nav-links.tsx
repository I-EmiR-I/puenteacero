'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/about', label: 'Nosotros' },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 text-sm lg:flex">
      {navLinks.map((link) => {
        const active =
          link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              active
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function NavLinksFallback() {
  return (
    <nav className="hidden items-center gap-1 text-sm lg:flex" aria-hidden>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          tabIndex={-1}
          className="rounded-md px-3 py-1.5 font-medium text-muted-foreground"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
