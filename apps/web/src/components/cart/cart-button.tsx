'use client';

import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import { ShoppingCart } from 'lucide-react';

export function CartButton() {
  const { itemCount, setOpen } = useCart();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      aria-label="Abrir carrito"
      onClick={() => setOpen(true)}
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
          {itemCount}
        </span>
      ) : null}
    </Button>
  );
}
