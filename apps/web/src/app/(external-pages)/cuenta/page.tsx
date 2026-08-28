import { Suspense } from 'react';
import { OrdersList } from './orders-list';
import { Skeleton } from '@/components/ui/skeleton';

export default function CuentaPage() {
  return (
    <div className="container mx-auto max-w-screen-lg px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Mis pedidos</h1>
      <Suspense fallback={<Skeleton className="h-40 w-full" />}>
        <OrdersList />
      </Suspense>
    </div>
  );
}
