import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Drill,
  Hammer,
  KeyRound,
  Ruler,
  Truck,
  Wrench,
} from 'lucide-react';

const items = [
  {
    icon: Hammer,
    title: 'Materiales para obra',
    description:
      'Cemento, mortero, agregados y consumibles para tu construcción.',
  },
  {
    icon: Wrench,
    title: 'Tornillería y fijaciones',
    description:
      'Tornillos, anclas, taquetes y todo lo necesario para fijar con confianza.',
  },
  {
    icon: KeyRound,
    title: 'Cerraduras y herrajes',
    description:
      'Cerraduras, bisagras y herrajes para puertas, ventanas y muebles.',
  },
  {
    icon: Drill,
    title: 'Herramientas y equipo',
    description:
      'Equipo de corte, medición, sujeción y seguridad para obra y taller.',
  },
  {
    icon: Ruler,
    title: 'Cortes a medida',
    description:
      'Preparamos tu material al corte exacto para evitar desperdicio en tu obra.',
  },
  {
    icon: Truck,
    title: 'Entrega a tu obra',
    description:
      'Cotizamos el flete en ciudad y envío nacional para constructoras y negocios.',
  },
];

export function AboutFeaturesGrid() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
          Lo que ofrecemos
        </p>
        <h2 className="text-3xl font-bold tracking-tight">
          Un solo proveedor para tu obra
        </h2>
        <p className="text-muted-foreground">
          Material, herramienta y asesoría en el mismo lugar.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.title} className="group transition-all hover:-translate-y-1 hover:shadow-md">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-110">
                <item.icon className="h-5 w-5" />
              </div>
              <CardTitle className="mt-3 text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{item.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
