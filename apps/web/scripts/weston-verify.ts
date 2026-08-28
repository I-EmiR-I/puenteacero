import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SESSION_FILE = join(__dirname, 'weston-session.json');
const BASE = 'https://productos.westontools.com.mx';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: JSON.parse(readFileSync(SESSION_FILE, 'utf8')),
    geolocation: { latitude: 25.6866, longitude: -100.3161 },
    permissions: ['geolocation'],
  });
  const page = await context.newPage();

  let captured: any = null;
  page.on('response', async (res) => {
    if (res.url().includes('/GetCatalog')) {
      try {
        captured = (await res.json())?.d;
      } catch {}
    }
  });

  await page.goto(`${BASE}/Catalogo.aspx?familia=FERRETER%C3%8DA`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const data = captured;
  if (!data) {
    console.log('NO DATA');
    await browser.close();
    return;
  }
  console.log('IsAuthenticated:', data.IsAuthenticated);
  console.log('PerfilPrecios:', data.PerfilPrecios);
  console.log('TotalProductos (FERRETERÍA):', data.TotalProductos);
  const conPrecio = (data.Productos ?? []).filter((p: any) => p.Precio > 0).length;
  console.log('Con precio > 0:', conPrecio, '/', data.Productos?.length);
  if (data.Productos?.length) {
    const p = data.Productos[0];
    console.log('Ejemplo:', p.Codigo, p.Nombre, 'Precio:', p.Precio, 'Lista:', p.PrecioAnterior, 'UM:', p.UnidadMedida, 'Emp:', p.Empaque);
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
