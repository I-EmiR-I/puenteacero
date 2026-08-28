import { createSupabaseClient } from '@/supabase-clients/server';

export type CategoryStats = {
  /** Productos activos por categoría */
  counts: Record<string, number>;
  /** categoria_id → familia_weston (raw) del primer producto */
  familiaByCategory: Record<string, string>;
};

/**
 * Agregados del catálogo (conteos + familia por categoría) en una sola
 * pasada paginada (PostgREST limita a 1,000 filas por request).
 */
export const getCategoryStats = async (): Promise<CategoryStats> => {
  const supabase = await createSupabaseClient();
  const counts: Record<string, number> = {};
  const familiaByCategory: Record<string, string> = {};
  const PAGE = 1000;
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await supabase
      .from('products')
      .select('category_id, especificaciones->>familia_weston')
      .eq('activo', true)
      .range(offset, offset + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const row of data as Array<{
      category_id: string | null;
      familia_weston: string | null;
    }>) {
      if (!row.category_id) continue;
      counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
      if (row.familia_weston && !familiaByCategory[row.category_id]) {
        familiaByCategory[row.category_id] = row.familia_weston;
      }
    }
  }
  return { counts, familiaByCategory };
};
