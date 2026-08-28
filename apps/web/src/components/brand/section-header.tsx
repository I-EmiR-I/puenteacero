import type { ReactNode } from 'react';

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
