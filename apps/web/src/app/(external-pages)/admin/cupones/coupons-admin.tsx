'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  createCouponAction,
  deleteCouponAction,
  updateCouponAction,
} from '@/data/user/admin';
import type { Table as TableType } from '@/types';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

type Coupon = TableType<'coupons'>;

type FormState = {
  id?: string;
  codigo: string;
  tipo: 'percentage' | 'fixed';
  valor: string;
  activo: boolean;
  uso_maximo: string;
  valid_until: string;
};

const emptyForm = (): FormState => ({
  codigo: '',
  tipo: 'percentage',
  valor: '',
  activo: true,
  uso_maximo: '',
  valid_until: '',
});

export function CouponsAdmin({ coupons }: { coupons: Coupon[] }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());

  const { execute: save, status: saving } = useAction(
    form.id ? updateCouponAction : createCouponAction,
    {
      onSuccess: () => {
        toast.success('Cupón guardado');
        setOpen(false);
        setForm(emptyForm());
      },
      onError: ({ error }) => toast.error(error.serverError ?? 'Error al guardar'),
    }
  );

  const { execute: remove } = useAction(deleteCouponAction, {
    onSuccess: () => toast.success('Cupón eliminado'),
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al eliminar'),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    save({
      ...form,
      uso_maximo: form.uso_maximo ? Number(form.uso_maximo) : null,
    });
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setForm(emptyForm());
            setOpen(true);
          }}
        >
          Nuevo cupón
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Usos</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-mono font-medium">{c.codigo}</TableCell>
              <TableCell>{c.tipo === 'percentage' ? 'Porcentaje' : 'Monto fijo'}</TableCell>
              <TableCell>
                {c.tipo === 'percentage' ? `${c.valor}%` : `$${c.valor}`}
              </TableCell>
              <TableCell>
                {c.usos_actuales}
                {c.uso_maximo != null ? ` / ${c.uso_maximo}` : ''}
              </TableCell>
              <TableCell>
                {c.activo ? (
                  <Badge variant="secondary">Activo</Badge>
                ) : (
                  <Badge variant="outline">Inactivo</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setForm({
                        id: c.id,
                        codigo: c.codigo,
                        tipo: c.tipo as 'percentage' | 'fixed',
                        valor: String(c.valor),
                        activo: c.activo,
                        uso_maximo:
                          c.uso_maximo != null ? String(c.uso_maximo) : '',
                        valid_until: c.valid_until
                          ? new Date(c.valid_until).toISOString().slice(0, 10)
                          : '',
                      });
                      setOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => remove({ id: c.id })}
                  >
                    Eliminar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar cupón' : 'Nuevo cupón'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1">
              <Label>Código</Label>
              <Input
                required
                value={form.codigo}
                onChange={(e) => set('codigo', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Tipo</Label>
                <select
                  className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                  value={form.tipo}
                  onChange={(e) =>
                    set('tipo', e.target.value as 'percentage' | 'fixed')
                  }
                >
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto fijo ($)</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Valor</Label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.valor}
                  onChange={(e) => set('valor', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Uso máximo (vacío = ilimitado)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.uso_maximo}
                  onChange={(e) => set('uso_maximo', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Vence (fecha)</Label>
                <Input
                  type="date"
                  value={form.valid_until}
                  onChange={(e) => set('valid_until', e.target.value)}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => set('activo', e.target.checked)}
              />
              Activo
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving === 'executing'}>
                Guardar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
