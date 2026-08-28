import { Suspense } from 'react';
import { ProductDetail } from './product-detail';
import { ProductSkeleton } from './product-skeleton';

export default function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-6">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetail params={params} />
      </Suspense>
    </div>
  );
}
