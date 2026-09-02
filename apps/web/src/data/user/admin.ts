'use server';
import { authActionClient } from '@/lib/safe-action';
import { createSupabaseClient } from '@/supabase-clients/server';
import { revalidatePath, updateTag } from 'next/cache';
import { z } from 'zod';

export async function isAdmin(): Promise<boolean> {
  const supabase = await createSupabaseClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return false;
  const { data: profile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', userId)
    .maybeSingle();
  return profile?.rol === 'admin';
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// =============================================================================
// Productos
// =============================================================================

const productSchema = z.object({
  id: z.string().uuid().optional(),
  nombre: z.string().min(2),
  sku: z.string().optional().or(z.literal('')),
  slug: z.string().optional().or(z.literal('')),
  descripcion: z.string().optional().or(z.literal('')),
  category_id: z.string().uuid(),
  unit_id: z.string().uuid(),
  precio: z.coerce.number().min(0),
  stock: z.coerce.number().min(0).default(0),
  envio_nacional: z.boolean().default(false),
  activo: z.boolean().default(true),
});

export const createProductAction = authActionClient
  .schema(productSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createSupabaseClient();
    const slug = parsedInput.slug || slugify(parsedInput.nombre);
    const { error } = await supabase.from('products').insert({
      nombre: parsedInput.nombre,
      sku: parsedInput.sku || null,
      slug,
      descripcion: parsedInput.descripcion || null,
      category_id: parsedInput.category_id,
      unit_id: parsedInput.unit_id,
      precio: parsedInput.precio,
      stock: parsedInput.stock,
      envio_nacional: parsedInput.envio_nacional,
      activo: parsedInput.activo,
    });
    if (error) throw new Error(error.message);
    revalidatePath('/admin/productos');
    revalidatePath('/catalogo');
    updateTag('catalog');
  });

export const updateProductAction = authActionClient
  .schema(productSchema)
  .action(async ({ parsedInput }) => {
    if (!parsedInput.id) throw new Error('Falta id');
    const supabase = await createSupabaseClient();
    const { error } = await supabase
      .from('products')
      .update({
        nombre: parsedInput.nombre,
        sku: parsedInput.sku || null,
        slug: parsedInput.slug || slugify(parsedInput.nombre),
        descripcion: parsedInput.descripcion || null,
        category_id: parsedInput.category_id,
        unit_id: parsedInput.unit_id,
        precio: parsedInput.precio,
        stock: parsedInput.stock,
        envio_nacional: parsedInput.envio_nacional,
        activo: parsedInput.activo,
      })
      .eq('id', parsedInput.id);
    if (error) throw new Error(error.message);
    revalidatePath('/admin/productos');
    revalidatePath('/catalogo');
    updateTag('catalog');
  });

const deleteSchema = z.object({ id: z.string().uuid() });

export const deleteProductAction = authActionClient
  .schema(deleteSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createSupabaseClient();
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', parsedInput.id);
    if (error) throw new Error(error.message);
    revalidatePath('/admin/productos');
    revalidatePath('/catalogo');
    updateTag('catalog');
  });

// =============================================================================
// CategorÃ­as
// =============================================================================

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  nombre: z.string().min(2),
  slug: z.string().optional().or(z.literal('')),
  parent_id: z.string().uuid().nullable().optional(),
  orden: z.coerce.number().int().default(0),
});

export const createCategoryAction = authActionClient
  .schema(categorySchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createSupabaseClient();
    const { error } = await supabase.from('categories').insert({
      nombre: parsedInput.nombre,
      slug: parsedInput.slug || slugify(parsedInput.nombre),
      parent_id: parsedInput.parent_id ?? null,
      orden: parsedInput.orden,
    });
    if (error) throw new Error(error.message);
    revalidatePath('/admin/categorias');
    revalidatePath('/catalogo');
    updateTag('catalog');
  });

export const updateCategoryAction = authActionClient
  .schema(categorySchema)
  .action(async ({ parsedInput }) => {
    if (!parsedInput.id) throw new Error('Falta id');
    const supabase = await createSupabaseClient();
    const { error } = await supabase
      .from('categories')
      .update({
        nombre: parsedInput.nombre,
        slug: parsedInput.slug || slugify(parsedInput.nombre),
        parent_id: parsedInput.parent_id ?? null,
        orden: parsedInput.orden,
      })
      .eq('id', parsedInput.id);
    if (error) throw new Error(error.message);
    revalidatePath('/admin/categorias');
    revalidatePath('/catalogo');
    updateTag('catalog');
  });

export const deleteCategoryAction = authActionClient
  .schema(deleteSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createSupabaseClient();
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', parsedInput.id);
    if (error) throw new Error(error.message);
    revalidatePath('/admin/categorias');
    revalidatePath('/catalogo');
    updateTag('catalog');
  });

// =============================================================================
// Cupones
// =============================================================================

const couponSchema = z.object({
  id: z.string().uuid().optional(),
  codigo: z.string().min(2),
  tipo: z.enum(['percentage', 'fixed']),
  valor: z.coerce.number().positive(),
  activo: z.boolean().default(true),
  uso_maximo: z.coerce.number().int().min(0).nullable().optional(),
  valid_until: z.string().optional().or(z.literal('')),
});

export const createCouponAction = authActionClient
  .schema(couponSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createSupabaseClient();
    const { error } = await supabase.from('coupons').insert({
      codigo: parsedInput.codigo.trim().toUpperCase(),
      tipo: parsedInput.tipo,
      valor: parsedInput.valor,
      activo: parsedInput.activo,
      uso_maximo: parsedInput.uso_maximo ?? null,
      valid_until: parsedInput.valid_until || null,
    });
    if (error) throw new Error(error.message);
    revalidatePath('/admin/cupones');
  });

export const updateCouponAction = authActionClient
  .schema(couponSchema)
  .action(async ({ parsedInput }) => {
    if (!parsedInput.id) throw new Error('Falta id');
    const supabase = await createSupabaseClient();
    const { error } = await supabase
      .from('coupons')
      .update({
        codigo: parsedInput.codigo.trim().toUpperCase(),
        tipo: parsedInput.tipo,
        valor: parsedInput.valor,
        activo: parsedInput.activo,
        uso_maximo: parsedInput.uso_maximo ?? null,
        valid_until: parsedInput.valid_until || null,
      })
      .eq('id', parsedInput.id);
    if (error) throw new Error(error.message);
    revalidatePath('/admin/cupones');
  });

export const deleteCouponAction = authActionClient
  .schema(deleteSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createSupabaseClient();
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', parsedInput.id);
    if (error) throw new Error(error.message);
    revalidatePath('/admin/cupones');
  });

// =============================================================================
// Ã“rdenes
// =============================================================================

const orderStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum([
    'pending',
    'approved',
    'rejected',
    'cancelled',
    'expired',
    'refunded',
    'error',
  ]),
});

export const updateOrderStatusAction = authActionClient
  .schema(orderStatusSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createSupabaseClient();
    const { error } = await supabase
      .from('orders')
      .update({ status: parsedInput.status })
      .eq('id', parsedInput.id);
    if (error) throw new Error(error.message);
    revalidatePath('/admin/ordenes');
  });
