'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/cart-context';
import { formatMoney, formatPriceWithUnit } from '@/utils/format';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import Link from 'next/link';

export function CartDrawer() {
  const {
    items,
    open,
    setOpen,
    updateQuantity,
    removeItem,
    clear,
    subtotal,
  } = useCart();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Carrito</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">Tu carrito está vacío</p>
            <p className="text-sm text-muted-foreground">
              Explora el catálogo y agrega productos.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto py-4">
              {items.map((item) => {
                const step = item.admiteDecimales ? 0.01 : 1;
                const min = item.admiteDecimales ? 0.01 : 1;
                return (
                  <div key={item.productId} className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {item.nombre}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatPriceWithUnit(item.precio, item.simbolo)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Eliminar"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Restar"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              round(item.quantity - (item.admiteDecimales ? 0.01 : 1))
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          min={min}
                          step={step}
                          onChange={(e) => {
                            const q = Number.parseFloat(e.target.value);
                            if (Number.isFinite(q)) {
                              updateQuantity(item.productId, q);
                            }
                          }}
                          className="h-8 w-20 text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Sumar"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              round(item.quantity + (item.admiteDecimales ? 0.01 : 1))
                            )
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatMoney(item.precio * item.quantity)}
                      </span>
                    </div>
                    <Separator />
                  </div>
                );
              })}
            </div>

            <SheetFooter className="flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-lg font-semibold">
                  {formatMoney(subtotal)}
                </span>
              </div>
              <Button className="w-full" asChild>
                <Link href="/checkout" onClick={() => setOpen(false)}>
                  Ir a pagar
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={clear}>
                Vaciar carrito
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
