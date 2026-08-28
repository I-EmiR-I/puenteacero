'use server';
import { authActionClient } from '@/lib/safe-action';
import { createSupabaseClient } from '@/supabase-clients/server';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

const orderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive(),
});

const shippingSchema = z.object({
  nombre: z.string().min(2),
  telefono: z.string().min(7),
  calle: z.string().min(2),
  colonia: z.string().optional(),
  ciudad: z.string().min(2),
  estado: z.string().min(2),
  codigo_postal: z.string().min(4),
  notas: z.string().optional(),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  shipping: shippingSchema,
  metodo_envio: z.enum(['local', 'nacional']),
  couponCode: z.string().optional(),
});

const ENVIO_COSTOS: Record<'local' | 'nacional', number> = {
  local: 0,
  nacional: 199,
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export const createOrderAction = authActionClient
  .schema(createOrderSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseClient();

    // 1. Recalcular precios desde la DB (nunca confiar en el cliente)
    const productIds = parsedInput.items.map((i) => i.productId);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, nombre, sku, precio, envio_nacional, unit:units(simbolo, slug)')
      .in('id', productIds)
      .eq('activo', true);
    if (productsError) throw new Error(productsError.message);
    if (!products || products.length !== new Set(productIds).size) {
      throw new Error('Algunos productos no están disponibles');
    }

    const byId = new Map<string, (typeof products)[number]>();
    for (const p of products) byId.set(p.id, p);

    if (parsedInput.metodo_envio === 'nacional') {
      const todosNacional = parsedInput.items.every(
        (i) => byId.get(i.productId)?.envio_nacional === true
      );
      if (!todosNacional) {
        throw new Error(
          'Algunos productos no tienen envío nacional disponible'
        );
      }
    }

    let subtotal = 0;
    const orderItems = parsedInput.items.map((item) => {
      const product = byId.get(item.productId)!;
      const lineSubtotal = round2(product.precio * item.quantity);
      subtotal += lineSubtotal;
      return {
        product_id: product.id,
        nombre: product.nombre,
        sku: product.sku,
        unidad: product.unit?.simbolo ?? product.unit?.slug ?? '',
        precio_unitario: product.precio,
        quantity: item.quantity,
        subtotal: round2(lineSubtotal),
      };
    });
    subtotal = round2(subtotal);

    // 2. Cupón (validación + uso atómico en la DB vía RPC security definer)
    let descuento = 0;
    let couponId: string | null = null;
    if (parsedInput.couponCode) {
      const code = parsedInput.couponCode.trim().toUpperCase();
      const { data: cuponData, error: cuponError } = await supabase.rpc(
        'aplicar_cupon',
        { p_codigo: code, p_subtotal: subtotal }
      );
      if (cuponError) throw new Error(cuponError.message);
      const cupon = cuponData as unknown as {
        descuento: number;
        coupon_id: string;
      } | null;
      descuento = round2(Number(cupon?.descuento ?? 0));
      couponId = cupon?.coupon_id ?? null;
    }

    // 3. Envío + total
    const envioCosto = ENVIO_COSTOS[parsedInput.metodo_envio];
    const total = round2(subtotal - descuento + envioCosto);

    // 4. Crear orden + items (RLS: el usuario crea su propia orden)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: ctx.userId,
        coupon_id: couponId,
        status: 'pending',
        subtotal,
        descuento,
        envio_costo: envioCosto,
        total,
        moneda: 'mxn',
        metodo_envio: parsedInput.metodo_envio,
        shipping_address: parsedInput.shipping,
        provider: 'whatsapp',
        external_reference: randomUUID(),
      })
      .select('id')
      .single();
    if (orderError || !order) {
      throw new Error(orderError?.message ?? 'No se pudo crear la orden');
    }

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));
    if (itemsError) throw new Error(itemsError.message);

    // 5. Sin pago en línea: el pedido se confirma manualmente por WhatsApp
    revalidatePath('/cuenta');
    return { orderId: order.id };
  });

export const getUserOrders = async () => {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export type OrderWithItems = Awaited<ReturnType<typeof getUserOrders>>[number];

export const getOrderById = async (id: string): Promise<OrderWithItems | null> => {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as OrderWithItems | null) ?? null;
};
