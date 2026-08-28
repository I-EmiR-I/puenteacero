'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type CartItem = {
  productId: string;
  quantity: number;
  nombre: string;
  slug: string;
  precio: number;
  simbolo: string | null;
  admiteDecimales: boolean;
  imagen?: string | null;
};

type AddItemInput = Omit<CartItem, 'quantity'> & { quantity?: number };

type CartContextValue = {
  items: CartItem[];
  addItem: (item: AddItemInput) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  itemCount: number;
  subtotal: number;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const STORAGE_KEY = 'puenteacero-cart';

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // ignorar carrito corrupto
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage lleno o no disponible
    }
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const addItem = (item: AddItemInput) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === item.productId);
        const quantity = item.quantity ?? 1;
        if (existing) {
          return prev.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [...prev, { ...item, quantity }];
      });
      setOpen(true);
    };

    const updateQuantity = (productId: string, quantity: number) => {
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((i) => i.productId !== productId)
          : prev.map((i) =>
              i.productId === productId ? { ...i, quantity } : i
            )
      );
    };

    const removeItem = (productId: string) => {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    };

    const clear = () => setItems([]);

    const itemCount = items.length;
    const subtotal = items.reduce(
      (sum, i) => sum + i.precio * i.quantity,
      0
    );

    return {
      items,
      addItem,
      updateQuantity,
      removeItem,
      clear,
      itemCount,
      subtotal,
      open,
      setOpen,
    };
  }, [items, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart debe usarse dentro de <CartProvider>');
  }
  return ctx;
}
