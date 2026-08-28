/**
 * Estudio de rentabilidad POR TIPO (subfamilia Weston).
 * Cada subfamilia = un "tipo" de producto (pijas, rondanas, discos...).
 * Margen bruto = precio - costo - comisión (el flete es costo del pedido).
 * Salida: resumen en consola + rentabilidad-subfamilias.csv (una fila por tipo).
 *
 * Uso: node scripts/rentabilidad.ts
 */
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'node:fs';

const admin = createClient(
  'http://127.0.0.1:54321',
  'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const CANALES = {
  tienda: { pct: 0.03, fijo: 3 }, // Stripe aprox
  mercadolibre: { pct: 0.18, fijo: 10 },
};

const round2 = (n: number) => Math.round(n * 100) / 100;

async function fetchAllProducts() {
  const out: any[] = [];
  const PAGE = 1000;
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await admin
      .from('products')
      .select('sku, nombre, precio, especificaciones')
      .eq('activo', true)
      .range(offset, offset + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    out.push(...data);
  }
  return out;
}

async function main() {
  const productos = await fetchAllProducts();
  console.log(`Productos analizados: ${productos.length}`);

  const tipos = new Map<string, {
    familia: string;
    n: number;
    precio: number;
    costo: number;
    bruto: number;
    brutoML: number;
    sinMargen: number;
    ejemplo: string;
  }>();

  for (const p of productos) {
    const precio = Number(p.precio) || 0;
    const costo = Number(p.especificaciones?.costo) || 0;
    const familia = String(p.especificaciones?.familia_weston ?? '').trim();
    const sub = String(p.especificaciones?.subfamilia_weston ?? '').trim();
    const tipo = sub || familia || 'SIN TIPO';
    const key = `${familia}|${tipo}`;

    const comision = precio * CANALES.tienda.pct + CANALES.tienda.fijo;
    const comisionML = precio * CANALES.mercadolibre.pct + CANALES.mercadolibre.fijo;
    const bruto = round2(precio - costo - comision);
    const brutoML = round2(precio - costo - comisionML);

    if (!tipos.has(key)) {
      tipos.set(key, {
        familia,
        tipo,
        n: 0,
        precio: 0,
        costo: 0,
        bruto: 0,
        brutoML: 0,
        sinMargen: 0,
        ejemplo: p.nombre,
      });
    }
    const t = tipos.get(key)!;
    t.n++;
    t.precio += precio;
    t.costo += costo;
    t.bruto += bruto;
    t.brutoML += brutoML;
    if (bruto <= 0) t.sinMargen++;
  }

  const filas = [...tipos.values()].map((t) => {
    const promBruto = t.bruto / t.n;
    const promBrutoML = t.brutoML / t.n;
    const pctSinMargen = (t.sinMargen / t.n) * 100;
    // Clasificación del TIPO:
    //  MALO: margen promedio <= 0 o >50% de sus SKUs sin margen → quitar si o si
    //  PESADO: margen > 0 pero bajo (< $40) y/o mucho peso → retiro en tienda
    //  BUENO: rentable en pedidos
    const clasificacion =
      promBruto <= 0 || pctSinMargen > 50
        ? 'MALO'
        : promBruto < 40
          ? 'PESADO'
          : 'BUENO';
    return {
      familia: t.familia || 'SIN FAMILIA',
      tipo: t.tipo,
      skus: t.n,
      precio_prom: round2(t.precio / t.n),
      costo_prom: round2(t.costo / t.n),
      margen_bruto_prom: round2(promBruto),
      margen_bruto_ml_prom: round2(promBrutoML),
      pct_sin_margen: round2(pctSinMargen),
      margen_total_potencial: round2(t.bruto),
      clasificacion,
      ejemplo: t.ejemplo.slice(0, 60),
    };
  }).sort((a, b) => b.margen_bruto_prom - a.margen_bruto_prom);

  // CSV por tipo
  const header = Object.keys(filas[0]).join(',');
  const csv = [header, ...filas.map((f) =>
    Object.values(f).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
  )].join('\n');
  writeFileSync('rentabilidad-subfamilias.csv', '\uFEFF' + csv, 'utf8');

  const buenos = filas.filter((f) => f.clasificacion === 'BUENO');
  const pesados = filas.filter((f) => f.clasificacion === 'PESADO');
  const malos = filas.filter((f) => f.clasificacion === 'MALO');

  console.log(`\nTipos (subfamilias) analizados: ${filas.length}`);
  console.log(`  BUENOS: ${buenos.length} (${buenos.reduce((a, b) => a + b.skus, 0)} SKUs)`);
  console.log(`  PESADOS: ${pesados.length} (${pesados.reduce((a, b) => a + b.skus, 0)} SKUs)`);
  console.log(`  MALOS (quitar si o si): ${malos.length} (${malos.reduce((a, b) => a + b.skus, 0)} SKUs)`);

  console.log('\n=== TIPOS MALOS — QUITAR SI O SI (ordenados por SKUs afectados) ===');
  for (const f of [...malos].sort((a, b) => b.skus - a.skus)) {
    console.log(`  ${String(f.skus).padStart(4)} SKUs | bruto prom $${f.margen_bruto_prom.toFixed(0).padStart(5)} | ${f.tipo.padEnd(40)} (${f.familia})`);
  }

  console.log('\n=== TIPOS PESADOS (retiro en tienda / solo pedidos grandes, top 15 por SKUs) ===');
  for (const f of [...pesados].sort((a, b) => b.skus - a.skus).slice(0, 15)) {
    console.log(`  ${String(f.skus).padStart(4)} SKUs | bruto prom $${f.margen_bruto_prom.toFixed(0).padStart(5)} | ${f.tipo.padEnd(40)} (${f.familia})`);
  }

  console.log('\n=== EJEMPLOS DE TIPOS BUENOS (top 10 por margen) ===');
  for (const f of buenos.slice(0, 10)) {
    console.log(`  $${f.margen_bruto_prom.toFixed(0).padStart(6)} bruto prom | ${f.tipo.padEnd(40)} (${f.familia})`);
  }

  console.log(`\nCSV por tipo → rentabilidad-subfamilias.csv (${filas.length} filas)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
