-- Conteos y familia por categoria en UNA consulta (sidebar instantaneo).
-- Creada manualmente: supabase db diff no detecto la funcion (2026-09-02).
CREATE OR REPLACE FUNCTION public.get_category_stats()
RETURNS TABLE(category_id uuid, count bigint, familia_weston text)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT
    p.category_id,
    count(*)::bigint,
    min(p.especificaciones->>'familia_weston') AS familia_weston
  FROM public.products p
  WHERE p.activo AND p.category_id IS NOT NULL
  GROUP BY p.category_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_category_stats() TO anon, authenticated;
