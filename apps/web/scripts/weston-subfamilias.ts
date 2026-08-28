import { chromium } from '@playwright/test';

const BASE = 'https://productos.westontools.com.mx';

// Familias candidatas a ferretería (a explorar subfamilias)
const FAMILIAS = [
  'FERRETERÍA',
  'HERR. MANUALES',
  'SEGURIDAD',
  'PERFORACION',
  'TORNILLOS Y SUJETADORES',
  'HERRAMIENTA ELÉCTRICA',
  'HERR. DE MEDICION Y TRAZADO',
  'CONSTRUCCIÓN',
  'PINTURA',
  'ABRASIVOS FLEXIBLES',
  'ABRASIVOS SÓLIDOS Y DIAMANTADOS',
  'LUBRICACION',
  'MANTENIMIENTO DE EXTERIORES',
  'PULIDO Y ACABADO',
  'KITS',
  'SOLDADURA',
  'NEUMÁTICO',
  'MANEJO DE MATERIALES',
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    geolocation: { latitude: 25.6866, longitude: -100.3161 },
    permissions: ['geolocation'],
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  });
  const page = await context.newPage();

  let captured: any = null;
  page.on('response', async (res) => {
    if (res.url().includes('/GetCatalog')) {
      try {
        captured = (await res.json())?.d;
      } catch {
        /* ignore */
      }
    }
  });

  for (const familia of FAMILIAS) {
    captured = null;
    const url = `${BASE}/Catalogo.aspx?familia=${encodeURIComponent(familia)}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const data = captured;
    if (!data) {
      console.log(`\n### ${familia} — SIN DATOS`);
      continue;
    }
    console.log(`\n### ${familia} (${data.TotalProductos} productos)`);
    const sub = data.NextLevel ?? [];
    if (sub.length === 0) {
      console.log('   (sin subfamilias)');
    } else {
      for (const s of sub) {
        console.log(`   - ${s.Nombre} (${s.Count})`);
      }
    }
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
