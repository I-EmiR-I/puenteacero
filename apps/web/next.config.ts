import { loadEnvConfig } from '@next/env';
import path from 'node:path';
import type { NextConfig } from 'next';

// Monorepo: los .env viven en la raíz del repo (convención nextbase).
// Next 16 no soporta envDir → se cargan acá con @next/env (proceso gana a .env).
loadEnvConfig(path.resolve(__dirname, '../..'), process.env.NODE_ENV === 'development');

const config: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Turbopack ejecuta server actions y 'use cache' en workers que no heredan
  // process.env de loadEnvConfig → inlinear las vars no-públicas que usa el server
  env: {
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY ?? '',
  },
  images: {
    // Supabase local corre en 127.0.0.1 → se desactiva el bloqueo SSRF del
    // optimizador (solo aplica en dev/local; producción usa *.supabase.co).
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '54321',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '54321',
        pathname: '/**',
      },
    ],
  },
};

export default config;
