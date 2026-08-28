import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SESSION_FILE = join(__dirname, 'weston-session.json');

const BASE = 'https://productos.westontools.com.mx';

async function main() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    geolocation: { latitude: 25.6866, longitude: -100.3161 },
    permissions: ['geolocation'],
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  await page.goto(`${BASE}/Login.aspx`, { waitUntil: 'domcontentloaded' });
  console.log('>>> Abrí sesión en la ventana del navegador. Esperando...');

  const deadline = Date.now() + 5 * 60 * 1000;
  let authed = false;
  while (Date.now() < deadline) {
    await page.waitForTimeout(2000);
    try {
      const auth = await page.evaluate(() => document.body?.getAttribute('data-auth'));
      const url = page.url();
      if (auth === '1' || !url.toLowerCase().includes('login')) {
        // verificar en el home
        await page.goto(`${BASE}/Default.aspx`, { waitUntil: 'domcontentloaded' });
        const auth2 = await page.evaluate(() => document.body?.getAttribute('data-auth'));
        if (auth2 === '1') {
          authed = true;
          break;
        }
      }
    } catch {
      /* navegando */
    }
  }

  if (!authed) {
    console.log('>>> NO se detectó sesión (timeout). Intenta de nuevo.');
    await browser.close();
    process.exit(1);
  }

  await context.storageState({ path: SESSION_FILE });
  console.log(`>>> Sesión guardada en ${SESSION_FILE}`);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
