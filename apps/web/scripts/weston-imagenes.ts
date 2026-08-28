/**
 * Descarga las imágenes del catálogo de Weston y las sube a Supabase Storage.
 *
 * Pipeline: weston-login → weston-scrape-full → weston-import → weston-imagenes
 *
 * Uso:
 *   pnpm tsx scripts/weston-imagenes.ts [limite] [concurrencia]
 *   - limite: 0 = todos los productos sin imagen (default)
 *   - concurrencia: downloads paralelos (default 10)
 *
 * Comportamiento:
 *   - Idempotente: salta productos que ya tienen imagen en product_images.
 *   - Usa la imagen principal (especificaciones.imagen_weston) + las
 *     variantes extra de weston-productos.json (orden 1..n).
 *   - Envía headers de navegador + cookies de sesión (weston-session.json)
 *     porque Weston bloquea descargas sin contexto de distribuidor.
 *   - Dedupe inicial de product_images (mismo producto+url) por si hubo
 *     ejecuciones previas.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SESSION_FILE = join(__dirname, 'weston-session.json');
const PRODUCTOS_FILE = join(__dirname, 'weston-productos.json');
const BASE = 'https://productos.westontools.com.mx';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SECRET =
  process.env.SUPABASE_SECRET_KEY ||
  'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const admin = createClient(SUPABASE_URL, SUPABASE_SECRET, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const LIMIT = process.argv[2] ? Number(process.argv[2]) : 0; // 0 = todos
const CONCURRENCY = process.argv[3] ? Number(process.argv[3]) : 10;
const BUCKET = 'productos';
const PAGE = 1000;
const TIMEOUT_MS = 30_000;

function safeName(sku: string): string {
  return sku.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/** Cookies de la sesión de distribuidor (Playwright storageState) */
function sessionCookies(): string {
  if (!existsSync(SESSION_FILE)) return '';
  try {
    const state = JSON.parse(readFileSync(SESSION_FILE, 'utf8'));
    const cookies = (state.cookies ?? [])
      .filter((c: any) => c.domain?.includes('westontools.com.mx'))
      .map((c: any) => `${c.name}=${c.value}`);
    return cookies.join('; ');
  } catch {
    return '';
  }
}

const COOKIES = sessionCookies();
const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  Referer: `${BASE}/Catalogo.aspx`,
  Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
  'Accept-Language': 'es-MX,es;q=0.9',
  ...(COOKIES ? { Cookie: COOKIES } : {}),
};

/** Variantes extra (no repetir la principal ni las miniaturas redimensionadas) */
function extraImages(imagenes: string[] | undefined, main: string): string[] {
  if (!Array.isArray(imagenes)) return [];
  const seen = new Set<string>([main]);
  const extras: string[] = [];
  for (const url of imagenes) {
    if (!url || seen.has(url)) continue;
    const base = url.split('/').pop() ?? '';
    if (/^(500x500|250x250)_/i.test(base)) continue; // thumbnails
    seen.add(url);
    extras.push(url);
  }
  return extras.slice(0, 3);
}

/** Descarga con headers de navegador + timeout */
async function download(url: string): Promise<{ buf: Buffer; ext: string }> {
  const resp = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  if (buf.length < 100) throw new Error('respuesta vacía');
  const ext = (url.split('.').pop() || 'jpg').split('?')[0].toLowerCase();
  return { buf, ext };
}

async function upload(sku: string, url: string, orden: number) {
  const { buf, ext } = await download(url);
  const path = orden === 0 ? `${safeName(sku)}.${ext}` : `${safeName(sku)}__${orden + 1}.${ext}`;
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(path, buf, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;
  return admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function main() {
  // 1. Bucket público
  const { data: buckets } = await admin.storage.listBuckets();
  if (!buckets?.find((b) => b.name === BUCKET)) {
    await admin.storage.createBucket(BUCKET, { public: true });
    console.log('Bucket creado:', BUCKET);
  }

  // 2. Dedupe product_images (mismo producto + misma url, conserva el primer id)
  const seen = new Map<string, string>(); // `${product_id}|${url}` → id a conservar
  const toDelete: string[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data: rows, error } = await admin
      .from('product_images')
      .select('id, product_id, url')
      .order('created_at', { ascending: true })
      .range(offset, offset + PAGE - 1);
    if (error) throw error;
    if (!rows || rows.length === 0) break;
    for (const row of rows as any[]) {
      const key = `${row.product_id}|${row.url}`;
      if (seen.has(key)) toDelete.push(row.id);
      else seen.set(key, row.id);
    }
  }
  if (toDelete.length > 0) {
    for (let i = 0; i < toDelete.length; i += PAGE) {
      await admin.from('product_images').delete().in('id', toDelete.slice(i, i + PAGE));
    }
    console.log(`Duplicados eliminados de product_images: ${toDelete.length}`);
  } else {
    console.log('product_images sin duplicados');
  }

  // 3. Imágenes extra desde el JSON scrapeado (sku → urls)
  const extraBySku = new Map<string, string[]>();
  if (existsSync(PRODUCTOS_FILE)) {
    const productos: any[] = JSON.parse(readFileSync(PRODUCTOS_FILE, 'utf8'));
    for (const p of productos) {
      extraBySku.set(p.codigo, extraImages(p.imagenes, p.imagen ?? ''));
    }
    console.log(`Variantes extra cargadas: ${extraBySku.size} productos`);
  } else {
    console.log('weston-productos.json no existe — solo imagen principal');
  }

  // 4. Productos que YA tienen imagen (para no repetirlos)
  const { data: existing } = await admin
    .from('product_images')
    .select('product_id');
  const haveImage = new Set((existing ?? []).map((r: any) => r.product_id));
  console.log(`Productos con imagen previa: ${haveImage.size}`);

  // 5. Productos pendientes (con imagen_weston y sin fila en product_images)
  const { count } = await admin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .not('especificaciones->>imagen_weston', 'is', null);
  const candidates = Math.max(0, (count ?? 0) - haveImage.size);
  const total = LIMIT > 0 ? Math.min(LIMIT, candidates) : candidates;
  console.log(`A procesar: ${total} productos (candidatos ${count ?? 0}, ya hechos ${haveImage.size})`);

  let ok = 0;
  let fail = 0;
  let lastLog = 0;
  const failList: Array<{ sku: string; error: string }> = [];
  const start = Date.now();

  for (let offset = 0; offset < count!; offset += PAGE) {
    const { data: products } = await admin
      .from('products')
      .select('id, sku, especificaciones')
      .not('especificaciones->>imagen_weston', 'is', null)
      .order('sku', { ascending: true })
      .range(offset, offset + PAGE - 1);

    const pendientes = (products ?? []).filter((p: any) => !haveImage.has(p.id));
    if (pendientes.length === 0) continue;

    for (let i = 0; i < pendientes.length && ok + fail < total; i += CONCURRENCY) {
      const chunk = pendientes.slice(i, i + CONCURRENCY);
      await Promise.all(
        chunk.map(async (p: any) => {
          if (ok + fail >= total) return;
          try {
            const urls = [p.especificaciones?.imagen_weston, ...(extraBySku.get(p.sku) ?? [])].filter(Boolean);
            const rows: Array<{ product_id: string; url: string; orden: number }> = [];
            for (let orden = 0; orden < urls.length; orden++) {
              try {
                const url = await upload(p.sku, urls[orden], orden);
                rows.push({ product_id: p.id, url, orden });
              } catch (err) {
                if (orden === 0) throw err; // falla principal = producto fallido
              }
            }
            if (rows.length > 0) {
              const { error } = await admin.from('product_images').insert(rows);
              if (error) throw error;
            }
            ok++;
          } catch (err: any) {
            fail++;
            failList.push({ sku: p.sku, error: String(err?.message ?? err).slice(0, 120) });
          }
        })
      );
      const done = ok + fail;
      if (done - lastLog >= 100 || done >= total) {
        lastLog = done;
        const elapsed = ((Date.now() - start) / 1000).toFixed(0);
        console.log(`  ${Math.min(done, total)}/${total} (ok ${ok}, fail ${fail}, ${elapsed}s)`);
      }
    }
  }

  console.log(`\nDONE. ok=${ok} fail=${fail} en ${((Date.now() - start) / 1000).toFixed(0)}s`);
  if (failList.length > 0) {
    console.log('Fallidos (re-ejecuta el script para reintentar):');
    for (const f of failList.slice(0, 20)) {
      console.log(`  ${f.sku}: ${f.error}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
