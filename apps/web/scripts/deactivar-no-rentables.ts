/**
 * Desactiva (activo=false) los productos con margen bruto <= 0.
 * Margen bruto = precio - costo - comisión (3% + $3, Stripe aprox).
 * No borra datos; reversible desde el admin. Guarda la lista en deactivados.csv.
 *
 * Uso: node scripts/deactivar-no-rentables.ts
 */
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'node:fs';

const admin = createClient(
  'http://127.0.0.1:54321',
  'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const round2 = (n: number) => Math.round(n * 100) / 100;

async function main() {
  const out: any[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await admin
      .from('products')
      .select('id, sku, nombre, precio, especificaciones')
      .eq('activo', true)
      .range(offset, offset + 999);
    if (error) throw error;
    if (!data || data.length === 0) break;
    out.push(...data);
  }
  console.log(`Productos activos: ${out.length}`);

  const malos = out
    .map((p) => {
      const precio = Number(p.precio) || 0;
      const costo = Number(p.especificaciones?.costo) || 0;
      const bruto = round2(precio - costo - (precio * 0.03 + 3));
      return { ...p, bruto };
    })
    .filter((p) => p.bruto <= 0);

  console.log(`A desactivar: ${malos.length}`);

  // Guardar registro
  const csv = [
    'sku,nombre,precio,costo,margen_bruto',
    ...malos.map((p) =>
      `"${p.sku}","${p.nombre.replace(/"/g, '""')}",${p.precio},${p.especificaciones?.costo ?? ''},${p.bruto}`
    ),
  ].join('\n');
  writeFileSync('deactivados.csv', '\uFEFF' + csv, 'utf8');

  // Desactivar por lotes (UUIDs largos → lotes chicos para no exceder URI)
  const BATCH = 50;
  let ok = 0;
  let errores = 0;
  for (let i = 0; i < malos.length; i += BATCH) {
    const ids = malos.slice(i, i + BATCH).map((p) => p.id);
    const { error } = await admin
      .from('products')
      .update({ activo: false, updated_at: new Date().toISOString() })
      .in('id', ids);
    if (error) {
      console.error(`  ! lote ${i}: ${error.message}`);
      errores += ids.length;
    } else {
      ok += ids.length;
    }
  }

  console.log(`\nLISTO. Desactivados: ${ok}/${malos.length}${errores ? ` (errores ${errores})` : ''}`);
  console.log('Registro guardado en deactivados.csv');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
