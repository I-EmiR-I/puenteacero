import { createClient } from '@supabase/supabase-js';
const admin = createClient('http://127.0.0.1:54321', 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz', { auth: { autoRefreshToken: false, persistSession: false } });
let total = 0, n = 0;
for (let offset = 0; offset < 100000; offset += 1000) {
  const { data, error } = await admin.storage.from('productos').list('', { limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } });
  if (error) { console.log('error:', error.message); break; }
  if (!data || data.length === 0) break;
  for (const o of data) { if (!o.id) continue; total += o.metadata?.size ?? 0; n++; }
}
console.log('archivos:', n);
console.log('total MB:', (total / 1024 / 1024).toFixed(0));
