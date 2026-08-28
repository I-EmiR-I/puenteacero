import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/brand/logo';
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto max-w-screen-2xl px-4 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground text-primary">
                <BrandLogo className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold tracking-tight">PuenteAcero</span>
            </div>
            <p className="text-sm text-primary-foreground/80">
              Ferretería en línea: herrajes, herramientas, máquinas y
              materiales para obra, taller y hogar. Envío a todo México.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/login" aria-label="Facebook">
                  <Facebook className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/login" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/login" aria-label="WhatsApp">
                  <MessageCircle className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary-foreground/70">
              Productos
            </p>
            <nav className="flex flex-col gap-2.5 text-sm">
              <Link
                href="/catalogo"
                className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
              >
                Catálogo completo
              </Link>
              <Link
                href="/catalogo?familia=herramientas-manuales"
                className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
              >
                Herramientas Manuales
              </Link>
              <Link
                href="/catalogo?familia=ferreteria"
                className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
              >
                Ferretería
              </Link>
              <Link
                href="/catalogo?familia=perforacion"
                className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
              >
                Perforación
              </Link>
            </nav>
          </div>

          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary-foreground/70">
              Empresa
            </p>
            <nav className="flex flex-col gap-2.5 text-sm">
              <Link
                href="/about"
                className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
              >
                Nosotros
              </Link>
              <Link
                href="/login"
                className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
              >
                Mi cuenta
              </Link>
              <Link
                href="/login"
                className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
              >
                Aviso de privacidad
              </Link>
            </nav>
          </div>

          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary-foreground/70">
              Contacto
            </p>
            <ul className="flex flex-col gap-2.5 text-sm text-primary-foreground/80">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Monterrey, Nuevo León, México</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a
                  href="tel:+528111223344"
                  className="transition-colors hover:text-primary-foreground"
                >
                  +52 81 1122 3344
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a
                  href="mailto:ventas@puenteacero.mx"
                  className="transition-colors hover:text-primary-foreground"
                >
                  ventas@puenteacero.mx
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-primary-foreground/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-primary-foreground/60">
            © 2026 PuenteAcero · Ferretería en línea
          </p>
          <p className="font-mono text-xs text-primary-foreground/60">
            Horario: Lun–Sáb 8:00–18:00
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
