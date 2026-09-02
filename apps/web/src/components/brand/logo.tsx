import Image from 'next/image';
import Link from 'next/link';

/**
 * Wordmark oficial de PuenteAcero (imagen del cliente).
 * Usado en navbar, auth y footer.
 */
export function BrandWordmark({ className = '' }: { className?: string }) {
  return (
    <Link href="/catalogo" className={`inline-block shrink-0 ${className}`}>
      <Image
        src="/logo-puenteacero-web.png"
        alt="PuenteAcero"
        width={600}
        height={335}
        priority
        className="h-10 w-auto"
      />
    </Link>
  );
}
