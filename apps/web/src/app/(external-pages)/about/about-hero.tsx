import { Button } from '@/components/ui/button';
import { whatsappHref } from '@/utils/whatsapp';
import { ArrowRight, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export function AboutHero() {
  const wa = whatsappHref('Hola, quiero información sobre PuenteAcero.');

  return (
    <div className="space-y-4 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
        Nosotros
      </p>
      <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
        La ferretería que <span className="text-gradient-brand">sostiene</span>{' '}
        tus proyectos
      </h1>
      <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
        En PuenteAcero encuentras herrajes, herramientas, máquinas y
        materiales para obra, taller y hogar. Atendemos desde el contratista
        independiente hasta la obra industrial.
      </p>
      <div className="flex flex-wrap justify-center gap-4 pt-4">
        <Button size="lg" asChild>
          <Link href="/catalogo">
            Ver catálogo <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        {wa ? (
          <Button size="lg" variant="outline" asChild>
            <Link href={wa} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" /> Cotizar por WhatsApp
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
