import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SESSION_FILE = join(__dirname, 'weston-session.json');
const OUTPUT_FILE = join(__dirname, 'weston-productos.json');
const BASE = 'https://productos.westontools.com.mx';

// Familias a importar (ferretería). Ajustable.
const FAMILIAS = [
  'FERRETERÍA',
  'HERR. MANUALES',
  'PERFORACION',
  'TORNILLOS Y SUJETADORES',
  'SEGURIDAD',
  'HERRAMIENTA ELÉCTRICA',
  'HERR. DE MEDICION Y TRAZADO',
  'PINTURA',
  'ABRASIVOS FLEXIBLES',
  'ABRASIVOS SÓLIDOS Y DIAMANTADOS',
  'LUBRICACION',
  'KITS',
  'SOLDADURA',
  'NEUMÁTICO',
  'MANEJO DE MATERIALES',
  'CONSTRUCCIÓN',
  'MANTENIMIENTO DE EXTERIORES',
];

const PAGE_SIZE = 72;

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: JSON.parse(readFileSync(SESSION_FILE, 'utf8')),
    geolocation: { latitude: 25.6866, longitude: -100.3161 },
    permissions: ['geolocation'],
  });
  const page = await context.newPage();

  // Establecer contexto de sesión cargando el catálogo una vez
  await page.goto(`${BASE}/Catalogo.aspx`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const getCatalog = (familia: string, pagina: number) =>
    page.evaluate(
      async ({ familia, pagina }) => {
        const res = await fetch('/Catalogo.aspx/GetCatalog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({
            Busqueda: '',
            Familia: familia,
            SubFamilia: '',
            Grupo: '',
            SubGrupo: '',
            SubSubGrupo: '',
            Marca: '',
            Disponibilidad: '',
            Tipo: '',
            PrecioMin: null,
            PrecioMax: null,
            Orden: '',
            Pagina: pagina,
            PageSize: 72,
          }),
        });
        const json = await res.json();
        return json.d;
      },
      { familia, pagina }
    );

  const all: any[] = [];
  for (const familia of FAMILIAS) {
    let pagina = 1;
    let totalPaginas = 1;
    let familiaCount = 0;
    do {
      const data: any = await getCatalog(familia, pagina);
      totalPaginas = data.TotalPaginas || 1;
      const productos = data.Productos ?? [];
      familiaCount += productos.length;
      for (const p of productos) {
        all.push({
          codigo: p.Codigo,
          nombre: p.Nombre,
          marca: p.Marca,
          familia: p.Familia,
          subfamilia: p.SubFamilia || '',
          grupo: p.Grupo || '',
          precio: p.Precio != null ? Number(p.Precio) : 0,
          precio_lista: p.PrecioAnterior != null ? Number(p.PrecioAnterior) : null,
          unidad: p.UnidadMedida || '',
          empaque: p.Empaque || 1,
          imagen: p.ImageUrl || '',
          imagenes: p.Imagenes ?? [],
          descripciones: p.Descripciones ?? [],
        });
      }
      console.log(`  ${familia} — pág ${pagina}/${totalPaginas} (acum ${familiaCount})`);
      pagina++;
      await page.waitForTimeout(300); // pausa para no saturar el servidor
    } while (pagina <= totalPaginas);
    console.log(`✓ ${familia}: ${familiaCount} productos`);
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(all, null, 2), 'utf8');
  console.log(`\nTOTAL: ${all.length} productos → ${OUTPUT_FILE}`);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
