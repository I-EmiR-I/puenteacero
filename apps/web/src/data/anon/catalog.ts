import { cacheTag } from 'next/cache';
import { createAdminClient } from '@/supabase-clients/admin';
import { familiaRawNamesForSlug } from './familias';
import { Table } from '@/types';

export type CatalogProduct = Table<'products'> & {
  category: Table<'categories'> | null;
  unit: Table<'units'>;
  images: Table<'product_images'>[];
};

export type ProductPage = {
  products: CatalogProduct[];
  total: number;
};

// Categorías fuera del catálogo público (se venden mejor en local, no por envío)
const HIDDEN_CATEGORY_SLUGS = ['acero'];

const collectDescendantIds = (
  categories: Table<'categories'>[],
  rootId: string
): string[] => {
  const result: string[] = [];
  const stack = [rootId];
  while (stack.length > 0) {
    const current = stack.pop()!;
    result.push(current);
    for (const category of categories) {
      if (category.parent_id === current) {
        stack.push(category.id);
      }
    }
  }
  return result;
};

const hiddenCategoryIds = (categories: Table<'categories'>[]): Set<string> => {
  const hidden = new Set<string>();
  for (const category of categories) {
    if (HIDDEN_CATEGORY_SLUGS.includes(category.slug)) {
      for (const id of collectDescendantIds(categories, category.id)) {
        hidden.add(id);
      }
    }
  }
  return hidden;
};

/**
 * Datos del catálogo cacheados ('use cache', 15 min).
 * Se invalidan con updateTag('catalog') cuando el admin muta productos/
 * categorías (data/user/admin.ts). Client admin (sin cookies) = cacheable.
 */

export const getCategories = async (): Promise<Table<'categories'>[]> => {
  'use cache';
  cacheTag('catalog');
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('orden', { ascending: true });
  if (error) throw error;
  const all = (data ?? []) as Table<'categories'>[];
  const hidden = hiddenCategoryIds(all);
  return all.filter((category) => !hidden.has(category.id));
};

export const getUnits = async (): Promise<Table<'units'>[]> => {
  'use cache';
  cacheTag('catalog');
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .order('nombre', { ascending: true });
  if (error) throw error;
  return data;
};

export type CategoryStats = {
  /** Productos activos por categoría */
  counts: Record<string, number>;
  /** categoria_id → familia_weston (raw) del primer producto */
  familiaByCategory: Record<string, string>;
};

export const getCategoryStats = async (): Promise<CategoryStats> => {
  'use cache';
  cacheTag('catalog');
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('get_category_stats');
  if (error) throw error;
  const counts: Record<string, number> = {};
  const familiaByCategory: Record<string, string> = {};
  for (const row of (data ?? []) as Array<{
    category_id: string;
    count: number;
    familia_weston: string | null;
  }>) {
    counts[row.category_id] = Number(row.count);
    if (row.familia_weston && !familiaByCategory[row.category_id]) {
      familiaByCategory[row.category_id] = row.familia_weston;
    }
  }
  return { counts, familiaByCategory };
};

/** Conteo de una categoría incluyendo sus descendientes */
export const countCategorySubtree = (
  categories: Table<'categories'>[],
  counts: Record<string, number>,
  rootId: string
): number => {
  let total = 0;
  const stack = [rootId];
  while (stack.length > 0) {
    const current = stack.pop()!;
    total += counts[current] ?? 0;
    for (const category of categories) {
      if (category.parent_id === current) {
        stack.push(category.id);
      }
    }
  }
  return total;
};

type ProductFilters = {
  category?: string;
  q?: string;
  unit?: string;
  familia?: string;
};

async function resolveFilters(supabase: any, opts: ProductFilters) {
  const { data: categories } = await supabase.from('categories').select('*');
  const all = (categories ?? []) as Table<'categories'>[];
  const hidden = hiddenCategoryIds(all);

  let categoryIds: string[] | undefined;
  let forceEmpty = false;
  if (opts.category) {
    const selected = all.find((c) => c.slug === opts.category);
    if (selected) {
      categoryIds = collectDescendantIds(all, selected.id).filter(
        (id) => !hidden.has(id)
      );
      if (categoryIds.length === 0) {
        categoryIds = undefined;
        forceEmpty = true;
      }
    }
  } else if (opts.familia) {
    const rawNames = familiaRawNamesForSlug(opts.familia);
    if (rawNames.length > 0) {
      const ids = new Set<string>();
      const PAGE = 1000;
      for (let offset = 0; ; offset += PAGE) {
        const { data } = await supabase
          .from('products')
          .select('category_id')
          .eq('activo', true)
          .in('especificaciones->>familia_weston', rawNames)
          .range(offset, offset + PAGE - 1);
        if (!data || data.length === 0) break;
        for (const row of data as Array<{ category_id: string | null }>) {
          if (row.category_id) ids.add(row.category_id);
        }
      }
      categoryIds = [...ids].filter((id) => !hidden.has(id));
      if (categoryIds.length === 0) forceEmpty = true;
    }
  }

  let unitId: string | undefined;
  if (opts.unit) {
    const { data: unit } = await supabase
      .from('units')
      .select('id')
      .eq('slug', opts.unit)
      .maybeSingle();
    if (unit) unitId = unit.id;
  }

  return { categoryIds, excludedIds: [...hidden], forceEmpty, unitId };
}

function applyFilters(
  query: any,
  opts: ProductFilters,
  filters: {
    categoryIds?: string[];
    excludedIds: string[];
    forceEmpty: boolean;
    unitId?: string;
  }
) {
  let q = query.eq('activo', true);
  if (filters.excludedIds.length > 0) {
    q = q.not('category_id', 'in', `(${filters.excludedIds.join(',')})`);
  }
  if (filters.forceEmpty) {
    q = q.eq('category_id', '00000000-0000-4000-8000-000000000000');
  } else if (filters.categoryIds) {
    q = q.in('category_id', filters.categoryIds);
  }
  if (filters.unitId) q = q.eq('unit_id', filters.unitId);
  if (opts.q) {
    const term = opts.q.trim();
    q = q.or(`nombre.ilike.%${term}%,descripcion.ilike.%${term}%,sku.ilike.%${term}%`);
  }
  return q;
}

export const getProducts = async (
  opts: ProductFilters & { page?: number; pageSize?: number }
): Promise<ProductPage> => {
  'use cache';
  cacheTag('catalog');
  const supabase = createAdminClient();
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 24;
  const filters = await resolveFilters(supabase, opts);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  // Una sola query: datos + conteo exacto (sin request de count aparte)
  const { data, error, count } = await applyFilters(
    supabase
      .from('products')
      .select(
        'id, sku, slug, nombre, precio, stock, envio_nacional, activo, category:categories(nombre, slug, parent_id), unit:units(simbolo, slug, admite_decimales), images:product_images(url, alt)',
        { count: 'exact' }
      ),
    opts,
    filters
  )
    .order('nombre', { ascending: true })
    .range(from, to);

  if (error) throw error;
  return { products: (data as CatalogProduct[]) ?? [], total: count ?? 0 };
};

export const getProductBySlug = async (
  slug: string
): Promise<CatalogProduct | null> => {
  'use cache';
  cacheTag('catalog');
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), unit:units(*), images:product_images(*)')
    .eq('slug', slug)
    .eq('activo', true)
    .maybeSingle();
  if (error) throw error;
  const product = (data as CatalogProduct | null) ?? null;
  if (!product?.category) return product;
  const { data: categories } = await supabase.from('categories').select('*');
  const hidden = hiddenCategoryIds((categories ?? []) as Table<'categories'>[]);
  if (hidden.has(product.category.id)) return null;
  return product;
};
