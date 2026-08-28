'use client';

import type {
  AdminProduct,
} from '@/data/admin/queries';
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
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from '@/data/user/admin';
import { formatMoney } from '@/utils/format';
import type { Table as TableType } from '@/types';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

type Category = TableType<'categories'>;
type Unit = TableType<'units'>;

type FormState = {
  id?: string;
  nombre: string;
  sku: string;
  slug: string;
  descripcion: string;
  category_id: string;
  unit_id: string;
  precio: string;
  stock: string;
  envio_nacional: boolean;
  activo: boolean;
};

const emptyForm = (categories: Category[], units: Unit[]): FormState => ({
  nombre: '',
  sku: '',
  slug: '',
  descripcion: '',
  category_id: categories[0]?.id ?? '',
  unit_id: units[0]?.id ?? '',
  precio: '',
  stock: '0',
  envio_nacional: false,
  activo: true,
});

export function ProductsAdmin({
  products,
  categories,
  units,
}: {
  products: AdminProduct[];
  categories: Category[];
  units: Unit[];
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(categories, units));

  const reset = () => {
    setForm(emptyForm(categories, units));
    setOpen(false);
  };

  const { execute: save, status: saving } = useAction(
    form.id ? updateProductAction : createProductAction,
    {
      onSuccess: () => {
        toast.success('Producto guardado');
        reset();
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? 'Error al guardar');
      },
    }
  );

  const { execute: remove } = useAction(deleteProductAction, {
    onSuccess: () => toast.success('Producto eliminado'),
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al eliminar'),
  });

  const openNew = () => {
    setForm(emptyForm(categories, units));
    setOpen(true);
  };

  const openEdit = (p: AdminProduct) => {
    setForm({
      id: p.id,
      nombre: p.nombre,
      sku: p.sku ?? '',
      slug: p.slug,
      descripcion: p.descripcion ?? '',
      category_id: p.category_id,
      unit_id: p.unit_id,
      precio: String(p.precio),
      stock: String(p.stock),
      envio_nacional: p.envio_nacional,
      activo: p.activo,
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    save(form);
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew}>Nuevo producto</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.nombre}</TableCell>
              <TableCell>{p.category?.nombre ?? '—'}</TableCell>
              <TableCell>
                {formatMoney(p.precio)}{' '}
                <span className="text-muted-foreground">
                  / {p.unit.simbolo}
                </span>
              </TableCell>
              <TableCell>{p.stock}</TableCell>
              <TableCell>
                {p.activo ? (
                  <Badge variant="secondary">Activo</Badge>
                ) : (
                  <Badge variant="outline">Inactivo</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => remove({ id: p.id })}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1">
              <Label>Nombre</Label>
              <Input
                required
                value={form.nombre}
                onChange={(e) => set('nombre', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>SKU</Label>
                <Input value={form.sku} onChange={(e) => set('sku', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Slug (opcional)</Label>
                <Input value={form.slug} onChange={(e) => set('slug', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Descripción</Label>
              <Input
                value={form.descripcion}
                onChange={(e) => set('descripcion', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Categoría</Label>
                <select
                  className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                  value={form.category_id}
                  onChange={(e) => set('category_id', e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Unidad</Label>
                <select
                  className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                  value={form.unit_id}
                  onChange={(e) => set('unit_id', e.target.value)}
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Precio (MXN)</Label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.precio}
                  onChange={(e) => set('precio', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Stock</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.stock}
                  onChange={(e) => set('stock', e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.envio_nacional}
                  onChange={(e) => set('envio_nacional', e.target.checked)}
                />
                Envío nacional
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) => set('activo', e.target.checked)}
                />
                Activo
              </label>
            </div>
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
