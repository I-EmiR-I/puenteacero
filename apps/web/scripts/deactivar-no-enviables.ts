/**
 * Desactiva materiales a granel imposibles de enviar por paquetería:
 *  - Subfamilias 100% a granel: VARILLAS ROSCADAS, ALAMBRES GALVANIZADOS,
 *    CADENAS VÍCTOR, CABLE DE USO RUDO
 *  - En subfamilias mixtas: solo los productos ROLLO/CADENA (cable de acero,
 *    cadenas), dejando accesorios y herramientas
 * Guarda registro en deactivados-envio.csv. Reversible (activo=false).
 *
 * Uso: node scripts/deactivar-no-enviables.ts [--yes]
 */
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'node:fs';

const admin = createClient(
  'http://127.0.0.1:54321',
  'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Subfamilias 100% material a granel
const SUBFAMILIAS_GRANEL = [
  'VARILLAS ROSCADAS',
  'ALAMBRES GALVANIZADOS',
  'CADENAS VÍCTOR',
  'CABLE DE USO RUDO',
];

// Subfamilias mixtas: solo si el nombre indica rollo/granel
const SUBFAMILIAS_MIXTAS = [
  'CABLE DE ACERO Y ACCESORIOS',
  'CADENAS, GANCHO P/CADENAS Y TENSORES',
  'CADENA DE BOLA',
];

function esGranel(nombre: string): boolean {
  const n = nombre.toUpperCase();
  // Rollos y tramos largos de material
  if (n.includes('ROLLO')) return true;
  if (n.includes('POR METRO') || n.includes('POR M.')) return true;
  if (n.includes('CADENA')) return true;
  return false;
}

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

  const marcados = out.filter((p) => {
    const sub = String(p.especificaciones?.subfamilia_weston ?? '').trim();
    const nombre = String(p.nombre ?? '');
    if (SUBFAMILIAS_GRANEL.some((s) => sub === s)) return true;
    if (SUBFAMILIAS_MIXTAS.some((s) => sub === s)) return esGranel(nombre);
    return false;
  });

  const porSub = new Map<string, number>();
  for (const p of marcados) {
    const sub = String(p.especificaciones?.subfamilia_weston ?? 'SIN SUB');
    porSub.set(sub, (porSub.get(sub) ?? 0) + 1);
  }
  const valor = marcados.reduce((a, p) => a + (Number(p.precio) || 0), 0);

  console.log(`\nA desactivar: ${marcados.length} productos · valor total $${Math.round(valor).toLocaleString('es-MX')}`);
  console.log('Por subcategoría:');
  for (const [sub, n] of [...porSub.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(4)}  ${sub}`);
  }
  console.log('\nEjemplos:');
  marcados.slice(0, 12).forEach((p) => {
    console.log(`  ${p.sku} · ${p.nombre.slice(0, 65)}  [$${Number(p.precio).toLocaleString('es-MX')}]`);
  });

  if (!process.argv.includes('--yes')) {
    console.log('\nRe-ejecuta con --yes: node scripts/deactivar-no-enviables.ts --yes');
    return;
  }

  const csv = [
    'sku,nombre,precio,subfamilia',
    ...marcados.map((p) =>
      `"${p.sku}","${p.nombre.replace(/"/g, '""')}",${p.precio},"${p.especificaciones?.subfamilia_weston ?? ''}"`
    ),
  ].join('\n');
  writeFileSync('deactivados-envio.csv', '\uFEFF' + csv, 'utf8');

  const BATCH = 50;
  let ok = 0;
  for (let i = 0; i < marcados.length; i += BATCH) {
    const ids = marcados.slice(i, i + BATCH).map((p) => p.id);
    const { error } = await admin
      .from('products')
      .update({ activo: false, updated_at: new Date().toISOString() })
      .in('id', ids);
    if (error) {
      console.error(`  ! lote ${i}: ${error.message}`);
    } else {
      ok += ids.length;
    }
  }
  console.log(`\nLISTO. Desactivados: ${ok}/${marcados.length}`);
  console.log('Registro: deactivados-envio.csv');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
