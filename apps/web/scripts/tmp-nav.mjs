const urls = [
  '/catalogo',
  '/catalogo?categoria=herramientas-manuales',
  '/catalogo?familia=ferreteria',
  '/catalogo?categoria=tornillos-y-sujetadores',
  '/catalogo?familia=soldadura',
  '/catalogo?categoria=herramientas-manuales',
  '/catalogo?familia=perforacion',
];
const base = 'https://puenteacero.vercel.app';
for (const u of urls) {
  const t0 = Date.now();
  const res = await fetch(base + u, { redirect: 'follow' });
  const text = await res.text();
  const ms = Date.now() - t0;
  console.log(`${ms}ms  ${res.status}  ${u}  (${(text.length/1024).toFixed(0)}KB)`);
}
