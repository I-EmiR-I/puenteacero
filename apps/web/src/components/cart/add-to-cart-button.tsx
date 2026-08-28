'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/cart-context';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export type AddToCartProduct = {
  id: string;
  nombre: string;
  slug: string;
  precio: number;
  simbolo: string | null;
  admiteDecimales: boolean;
  imagen?: string | null;
  stock: number;
};

export function AddToCartButton({ product }: { product: AddToCartProduct }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState<string>('1');
  const step = product.admiteDecimales ? '0.01' : '1';
  const min = product.admiteDecimales ? '0.01' : '1';
  const sinStock = product.stock <= 0;

  const handleAdd = () => {
    const qty = Number.parseFloat(quantity);
    if (!Number.isFinite(qty) || qty <= 0) return;
    addItem({
      productId: product.id,
      quantity: qty,
      nombre: product.nombre,
      slug: product.slug,
      precio: product.precio,
      simbolo: product.simbolo,
      admiteDecimales: product.admiteDecimales,
      imagen: product.imagen,
    });
    toast.success(
      sinStock
        ? 'Agregado al carrito (disponibilidad por confirmar)'
        : 'Agregado al carrito'
    );
  };

  return (
    <div className="flex w-full items-center gap-2 sm:w-auto">
      <Input
        type="number"
        value={quantity}
        min={min}
        step={step}
        onChange={(e) => setQuantity(e.target.value)}
        className="w-24"
        aria-label="Cantidad"
      />
      <Button className="flex-1 sm:flex-none" onClick={handleAdd}>
        <ShoppingCart className="mr-2 h-4 w-4" />
        {sinStock ? 'Agregar (confirmar)' : 'Agregar al carrito'}
      </Button>
    </div>
  );
}
