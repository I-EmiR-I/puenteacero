import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT = join(__dirname, 'weston-productos.json');

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SECRET = process.env.SUPABASE_SECRET_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const admin = createClient(SUPABASE_URL, SUPABASE_SECRET, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type WestonProduct = {
  codigo: string;
  nombre: string;
  marca: string;
  familia: string;
  subfamilia: string;
  grupo: string;
  precio: number;
  precio_lista: number | null;
  unidad: string;
  empaque: number;
  imagen: string;
  descripciones: string[];
};

const FAMILIA_TO_CATEGORIA: Record<string, string> = {
  FERRETERÍA: 'Ferretería',
  'HERR. MANUALES': 'Herramientas',
  PERFORACION: 'Herramientas',
  'TORNILLOS Y SUJETADORES': 'Ferretería',
  SEGURIDAD: 'Ferretería',
  'HERRAMIENTA ELÉCTRICA': 'Herramientas',
  'HERR. DE MEDICION Y TRAZADO': 'Herramientas',
  PINTURA: 'Ferretería',
  'ABRASIVOS FLEXIBLES': 'Ferretería',
  'ABRASIVOS SÓLIDOS Y DIAMANTADOS': 'Ferretería',
  LUBRICACION: 'Ferretería',
  KITS: 'Herramientas',
  SOLDADURA: 'Máquinas',
  NEUMÁTICO: 'Herramientas',
  'MANEJO DE MATERIALES': 'Máquinas',
  CONSTRUCCIÓN: 'Máquinas',
  'MANTENIMIENTO DE EXTERIORES': 'Máquinas',
};

const UNIDAD_TO_UNIT: Record<string, string> = {
  '': 'pieza',
  'PIEZA(S)': 'pieza',
  CAJA: 'caja',
  JUEGO: 'juego',
  PAR: 'par',
  PARES: 'par',
  BLISTERS: 'paquete',
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

async function main() {
  const productos: WestonProduct[] = JSON.parse(readFileSync(INPUT, 'utf8'));
  console.log(`Productos a importar: ${productos.length}`);

  const { data: cats } = await admin.from('categories').select('id, nombre, slug, parent_id');
  const { data: units } = await admin.from('units').select('id, slug');
  const catList = cats ?? [];
  const unitList = units ?? [];
  const unitBySlug = new Map(unitList.map((u) => [u.slug, u.id]));
  const catBySlug = new Map(catList.map((c) => [c.slug, c]));

  // Crear subcategorías (una por subfamilia) bajo su categoría top
  const subcatIdByKey = new Map<string, string>();
  for (const p of productos) {
    const top = FAMILIA_TO_CATEGORIA[p.familia] ?? 'Ferretería';
    const sub = p.subfamilia?.trim() ? p.subfamilia : p.familia;
    const key = `${top}|${sub}`;
    if (subcatIdByKey.has(key)) continue;

    const topCat = catList.find((c) => c.nombre === top);
    const slug = slugify(sub) || slugify(top);
    let existing = catBySlug.get(slug);
    if (!existing) {
      const { data, error } = await admin
        .from('categories')
        .insert({ nombre: sub, slug, parent_id: topCat?.id ?? null, orden: 0 })
        .select('id, slug')
        .single();
      if (error) {
        const { data: dup } = await admin
          .from('categories')
          .select('id')
          .eq('slug', slug)
          .single();
        if (dup) {
          existing = dup;
          catBySlug.set(slug, dup);
        } else {
          console.error('  ! categoría falló:', slug, error.message);
          continue;
        }
      } else {
        existing = data;
        catBySlug.set(slug, data);
      }
    }
    subcatIdByKey.set(key, existing.id);
  }
  console.log(`Subcategorías mapeadas: ${subcatIdByKey.size}`);

  // Construir filas
  const filas = productos
    .filter((p) => subcatIdByKey.has(`${FAMILIA_TO_CATEGORIA[p.familia] ?? 'Ferretería'}|${p.subfamilia?.trim() ? p.subfamilia : p.familia}`))
    .map((p) => {
      const top = FAMILIA_TO_CATEGORIA[p.familia] ?? 'Ferretería';
      const sub = p.subfamilia?.trim() ? p.subfamilia : p.familia;
      const costo = round2(p.precio);
      const venta = p.precio_lista != null ? round2(p.precio_lista) : round2(p.precio * 1.3);
      return {
        category_id: subcatIdByKey.get(`${top}|${sub}`)!,
        unit_id: unitBySlug.get(UNIDAD_TO_UNIT[p.unidad] ?? 'pieza'),
        sku: p.codigo,
        slug: slugify(p.codigo) || slugify(p.nombre),
        nombre: p.nombre,
        descripcion: (p.descripciones ?? []).filter(Boolean).join('\n').slice(0, 2000) || null,
        especificaciones: {
          marca: p.marca || null,
          costo,
          familia_weston: p.familia,
          subfamilia_weston: p.subfamilia || null,
          empaque: p.empaque,
          imagen_weston: p.imagen || null,
        },
        precio: venta,
        stock: 0,
        envio_nacional: true,
        activo: true,
      };
    });

  console.log(`Filas a insertar: ${filas.length} (${productos.length - filas.length} sin subcategoría)`);

  const BATCH = 500;
  let ok = 0;
  let errores = 0;
  for (let i = 0; i < filas.length; i += BATCH) {
    const lote = filas.slice(i, i + BATCH);
    const { error } = await admin
      .from('products')
      .upsert(lote, { onConflict: 'sku', ignoreDuplicates: true });
    if (error) {
      console.error(`  ! lote ${i}:`, error.message);
      errores++;
    } else {
      ok += lote.length;
    }
    if ((i / BATCH) % 4 === 0) console.log(`  ... ${i}/${filas.length}`);
  }

  console.log(`\nLISTO. Procesadas: ${ok}, lotes con error: ${errores}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
