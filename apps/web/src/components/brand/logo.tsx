import Link from 'next/link';

export function BrandLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 2.6 20.5 7.4v9.2L12 21.4 3.5 16.6V7.4L12 2.6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="2.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

export function BrandWordmark() {
  return (
    <Link href="/catalogo" className="group flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
        <BrandLogo className="h-5 w-5" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-base font-bold tracking-tight">PuenteAcero</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Ferretería en línea
        </span>
      </span>
    </Link>
  );
}
