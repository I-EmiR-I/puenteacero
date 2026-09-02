import Link from 'next/link';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { CartButton } from '@/components/cart/cart-button';
import { BrandWordmark } from '@/components/brand/logo';
import { NavLinks, NavLinksFallback } from './nav-links';
import { Search } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="bg-primary text-primary-foreground">
        <p className="container mx-auto max-w-screen-2xl px-4 py-1.5 text-center font-mono text-[11px] uppercase tracking-[0.16em]">
          Ferretería en línea · Envío a todo México · Venta al mayoreo y
          menudeo
        </p>
      </div>
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-screen-2xl items-center gap-3 px-4">
          <div className="flex min-w-0 flex-1 items-center gap-6">
            <BrandWordmark />
            <Suspense fallback={<NavLinksFallback />}>
              <NavLinks />
            </Suspense>
          </div>

          <form
            action="/catalogo"
            method="get"
            className="relative hidden max-w-xs flex-1 md:block"
            role="search"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              name="q"
              placeholder="Buscar producto, marca, SKU…"
              className="h-9 w-full rounded-md border bg-muted/50 pl-9 pr-3 text-sm transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:ring-[3px] focus:ring-ring/50"
            />
          </form>

          <div className="flex items-center gap-1.5">
            <CartButton />
            <ModeToggle />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/sign-up">Registrarse</Link>
            </Button>
          </div>
        </div>
        {/* Buscador móvil estilo marketplace */}
        <div className="container mx-auto max-w-screen-2xl px-4 pb-3 md:hidden">
          <form action="/catalogo" method="get" role="search" className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              name="q"
              placeholder="Buscar producto, marca, SKU…"
              className="h-10 w-full rounded-lg border bg-muted/50 pl-9 pr-3 text-sm transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:ring-[3px] focus:ring-ring/50"
            />
          </form>
        </div>
      </div>
    </header>
  );
}
