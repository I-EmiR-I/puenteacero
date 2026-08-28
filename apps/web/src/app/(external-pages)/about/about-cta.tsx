import { Button } from '@/components/ui/button';
import { whatsappHref } from '@/utils/whatsapp';
import { ArrowRight, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export function AboutCTA() {
  const wa = whatsappHref('Hola, quiero una cotización de material.');

  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground">
      <div className="bg-grid absolute inset-0" aria-hidden />
      <div className="relative">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary-foreground/70">
          Trabaja con nosotros
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
          ¿Eres contratista o constructor? Tenemos precio especial por volumen
        </h2>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" variant="secondary">
            <Link href="/catalogo">
              Explorar catálogo <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          {wa ? (
            <Button
              asChild
              size="lg"
              className="bg-white/10 text-primary-foreground hover:bg-white/20"
            >
              <Link href={wa} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" /> Pedir cotización
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
