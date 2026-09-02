import { Search } from 'lucide-react';

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="bg-grid bg-grid-fade absolute inset-0" aria-hidden />
      <div className="relative container mx-auto max-w-screen-2xl px-4 py-10 sm:py-14">
        <p className="text-center font-mono text-xs uppercase tracking-[0.22em] text-primary">
          Ferretería en línea · Envío a todo México
        </p>
        <h1 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Todo para tu obra, taller y hogar
        </h1>

        <form
          action="/catalogo"
          method="get"
          role="search"
          className="relative mx-auto mt-6 max-w-xl"
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            autoFocus={false}
            placeholder="Busca taladros, soldadoras, tornillos…"
            className="h-12 w-full rounded-xl border bg-card pl-12 pr-4 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-[3px] focus:ring-ring/50"
          />
        </form>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          11,000+ productos de herramientas, máquinas y ferretería — o{' '}
          <a href="/catalogo" className="font-semibold text-primary hover:underline">
            explora el catálogo completo
          </a>
        </p>
      </div>
    </section>
  );
}
