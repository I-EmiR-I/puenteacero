import { chromium } from '@playwright/test';

const BASE = 'https://productos.westontools.com.mx';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    geolocation: { latitude: 25.6866, longitude: -100.3161 }, // Monterrey, NL
    permissions: ['geolocation'],
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  const captured: any[] = [];
  page.on('response', async (res) => {
    if (res.url().includes('/GetCatalog')) {
      try {
        const json = await res.json();
        captured.push(json?.d ?? json);
      } catch {
        /* ignore */
      }
    }
  });

  await page.goto(`${BASE}/Catalogo.aspx`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const data = captured.find((c) => c?.Familias);
  if (!data) {
    console.log('NO se capturó GetCatalog. Respuestas capturadas:', captured.length);
    console.log(JSON.stringify(captured, null, 2).slice(0, 500));
    await browser.close();
    return;
  }

  console.log('=== FAMILIAS (top-level) ===');
  for (const f of data.Familias ?? []) {
    console.log(`${f.Nombre}  (${f.Count} productos)`);
  }

  console.log('\n=== Total productos (sin filtro) ===');
  console.log(`TotalProductos: ${data.TotalProductos}, TotalPaginas: ${data.TotalPaginas}`);

  console.log('\n=== Primer producto (estructura) ===');
  if (data.Productos?.length) {
    const p = data.Productos[0];
    console.log(JSON.stringify(p, null, 2));
  }

  console.log('\n=== NextLevel (subfamilias raíz) ===');
  console.log(JSON.stringify(data.NextLevel, null, 2)?.slice(0, 1000));

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
