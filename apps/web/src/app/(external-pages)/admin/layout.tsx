import { isAdmin } from '@/data/user/admin';
import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import { Suspense, type ReactNode } from 'react';
import { AdminNav } from './admin-nav';

// auth gating: no hay shell estático útil, la ruta se valida por request
export const instant = false;

async function AdminGuard({ children }: { children: ReactNode }) {
  // request-time: evita Date.now() durante prerender (Supabase __loadSession)
  await connection();
  const admin = await isAdmin();
  if (!admin) {
    redirect('/catalogo');
  }
  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
          Panel de administración
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">PuenteAcero Admin</h1>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr] md:items-start">
        <div className="rounded-xl border bg-card p-3 md:sticky md:top-24">
          <AdminNav />
        </div>
        <Suspense fallback={null}>
          <AdminGuard>{children}</AdminGuard>
        </Suspense>
      </div>
    </div>
  );
}
