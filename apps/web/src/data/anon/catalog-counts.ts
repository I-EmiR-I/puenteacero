import { createSupabaseClient } from '@/supabase-clients/server';

export type CategoryStats = {
  /** Productos activos por categoría */
  counts: Record<string, number>;
  /** categoria_id → familia_weston (raw) del primer producto */
  familiaByCategory: Record<string, string>;
};

/**
 * Conteos + familia por categoría en UNA consulta SQL (RPC get_category_stats).
 * Antes se paginaban 13k filas en ~14 requests — ahora es un solo round-trip.
 */
export const getCategoryStats = async (): Promise<CategoryStats> => {
  const supabase = await createSupabaseClient();
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
