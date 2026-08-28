// Familias del catálogo Weston: nombres raw (del import) → nombre legible.
const FAMILIA_DISPLAY: Record<string, string> = {
  FERRETERÍA: 'Ferretería',
  'HERR. MANUALES': 'Herramientas Manuales',
  PERFORACION: 'Perforación',
  'TORNILLOS Y SUJETADORES': 'Tornillos y Sujetadores',
  SEGURIDAD: 'Seguridad',
  'HERRAMIENTA ELÉCTRICA': 'Herramienta Eléctrica',
  'HERR. DE MEDICION Y TRAZADO': 'Medición y Trazado',
  PINTURA: 'Pintura',
  'ABRASIVOS FLEXIBLES': 'Abrasivos Flexibles',
  'ABRASIVOS SÓLIDOS Y DIAMANTADOS': 'Abrasivos Sólidos y Diamantados',
  LUBRICACION: 'Lubricación',
  KITS: 'Kits',
  SOLDADURA: 'Soldadura',
  NEUMÁTICO: 'Neumático',
  'MANEJO DE MATERIALES': 'Manejo de Materiales',
  CONSTRUCCIÓN: 'Construcción',
  'MANTENIMIENTO DE EXTERIORES': 'Mantenimiento de Exteriores',
};

const titleCase = (value: string) =>
  value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export const familiaDisplayName = (raw: string): string =>
  FAMILIA_DISPLAY[raw] ?? titleCase(raw);

export const familiaSlug = (raw: string): string =>
  slugify(FAMILIA_DISPLAY[raw] ?? raw);

/** Nombres raw cuyo slug coincide (para filtrar por familia en la DB) */
export const familiaRawNamesForSlug = (slug: string): string[] => {
  const raws = Object.keys(FAMILIA_DISPLAY).filter(
    (raw) => familiaSlug(raw) === slug
  );
  if (raws.length === 0 && slug === 'otros') return [''];
  return raws;
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
