import { type NextRequest, NextResponse } from 'next/server';
import { match } from 'path-to-regexp';
import { updateSession } from './supabase-clients/middleware';

const apiRoutes = ['/api{/*path}'];

// Portada y catálogo: públicos e idénticos para todos (el carrito es
// client-side) → se cachean en el CDN de Vercel 3 min por URL. El admin
// invalida el 'use cache' de datos; el CDN refresca solo (swr).
const CDN_CACHEABLE = (pathname: string) =>
  pathname === '/' || pathname === '/catalogo';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // API routes bypass the proxy for this project.
  if (apiRoutes.some((route) => match(route)(pathname))) {
    return null;
  }

  if (CDN_CACHEABLE(pathname)) {
    const response = NextResponse.next();
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=180, stale-while-revalidate=60'
    );
    return response;
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static assets and the Next.js image pipeline.
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
