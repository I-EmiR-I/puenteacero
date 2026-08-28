import { redirect } from 'next/navigation';

// Redirect puro: no hay shell estático que prerenderizar
export const instant = false;

export default function HomePage() {
  // Canal de ventas: la primera vista es el catálogo
  redirect('/catalogo');
}
