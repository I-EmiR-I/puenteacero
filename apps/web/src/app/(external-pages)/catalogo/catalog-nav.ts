import {
  countCategorySubtree,
  getCategories,
  getCategoryStats,
  type CategoryStats,
} from '@/data/anon/catalog';
import { familiaDisplayName, familiaSlug } from '@/data/anon/familias';
import { Table } from '@/types';

export type CatalogFilters = {
  categoria?: string;
  q?: string;
  unidad?: string;
  pagina?: string;
  familia?: string;
};

export function catalogHref(
  current: CatalogFilters,
  overrides: Partial<CatalogFilters>
): string {
  const merged: Record<string, string> = {};
  const next = { ...current, ...overrides };
  for (const [key, value] of Object.entries(next)) {
    if (value && key !== 'pagina') merged[key] = value;
  }
  const qs = new URLSearchParams(merged).toString();
  return qs ? `/catalogo?${qs}` : '/catalogo';
}

export type SubcatNav = {
  id: string;
  nombre: string;
  slug: string;
  count: number;
};

export type FamiliaNav = {
  display: string;
  slug: string;
  total: number;
  subcats: SubcatNav[];
};

const titleCase = (value: string) =>
  value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

/** Agrupa subcategorías (con productos) por familia Weston, ordenadas por tamaño */
export function buildFamilias(
  categories: Table<'categories'>[],
  stats: CategoryStats
): FamiliaNav[] {
  const map = new Map<string, FamiliaNav>();
  for (const cat of categories) {
    if (!cat.parent_id) continue;
    const count = stats.counts[cat.id] ?? 0;
    if (count === 0) continue;
    const raw = stats.familiaByCategory[cat.id] ?? '';
    const key = raw || '__otros__';
    if (!map.has(key)) {
      map.set(key, {
        display: familiaDisplayName(raw) || 'Otros',
        slug: familiaSlug(raw) || 'otros',
        total: 0,
        subcats: [],
      });
    }
    const familia = map.get(key)!;
    familia.total += count;
    familia.subcats.push({
      id: cat.id,
      nombre: titleCase(cat.nombre),
      slug: cat.slug,
      count,
    });
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

/** Familia activa (por ?familia o porque la subcategoría pertenece a ella) */
export function activeFamilia(
  familias: FamiliaNav[],
  current: CatalogFilters
): FamiliaNav | undefined {
  return (
    familias.find((f) => f.slug === current.familia) ??
    familias.find((f) =>
      f.subcats.some((c) => c.slug === current.categoria)
    )
  );
}

/** Datos compartidos del nav del catálogo (cacheados) */
export async function getCatalogNavData() {
  const [categories, stats] = await Promise.all([
    getCategories(),
    getCategoryStats(),
  ]);
  return buildFamilias(categories, stats);
}

export { countCategorySubtree };
