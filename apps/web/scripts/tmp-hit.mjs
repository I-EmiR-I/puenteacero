const urls = [
  '/catalogo',
  '/catalogo?categoria=herramientas-manuales',
  '/catalogo?familia=ferreteria',
  '/catalogo?categoria=tornillos-y-sujetadores',
  '/catalogo?familia=soldadura',
  '/catalogo?categoria=perforacion',
];
const base = 'https://puenteacero.vercel.app';
// 1) llenar cache (una vez)
for (const u of urls) { await fetch(base + u, { redirect: 'follow' }).then(r => r.arrayBuffer()); }
// 2) medir hits
for (const u of urls) {
  const t0 = Date.now();
  const res = await fetch(base + u, { redirect: 'follow' });
  await res.arrayBuffer();
  console.log(`${String(Date.now() - t0).padStart(4)}ms  cache=${res.headers.get('x-vercel-cache')}  ${u}`);
}
