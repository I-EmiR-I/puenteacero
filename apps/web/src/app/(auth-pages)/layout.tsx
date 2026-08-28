import { type ReactNode } from 'react';
import { BrandWordmark } from '@/components/brand/logo';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 max-w-6xl items-center px-4">
          <BrandWordmark />
        </div>
      </header>
      <main className="relative flex flex-1 items-center justify-center p-4">
        <div className="bg-grid bg-grid-fade absolute inset-0" aria-hidden />
        <div className="relative">{children}</div>
      </main>
    </div>
  );
}
