'use client';

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
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from '@/data/user/admin';
import type { Table as TableType } from '@/types';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

type Category = TableType<'categories'>;

type FormState = {
  id?: string;
  nombre: string;
  slug: string;
  parent_id: string;
  orden: string;
};

const emptyForm = (): FormState => ({
  nombre: '',
  slug: '',
  parent_id: '',
  orden: '0',
});

export function CategoriesAdmin({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());

  const { execute: save, status: saving } = useAction(
    form.id ? updateCategoryAction : createCategoryAction,
    {
      onSuccess: () => {
        toast.success('Categoría guardada');
        setOpen(false);
        setForm(emptyForm());
      },
      onError: ({ error }) => toast.error(error.serverError ?? 'Error al guardar'),
    }
  );

  const { execute: remove } = useAction(deleteCategoryAction, {
    onSuccess: () => toast.success('Categoría eliminada'),
    onError: ({ error }) => toast.error(error.serverError ?? 'Error al eliminar'),
  });

  const parentName = (id: string | null) =>
    categories.find((c) => c.id === id)?.nombre ?? '—';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    save({
      ...form,
      parent_id: form.parent_id || null,
      orden: Number(form.orden),
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
          Nueva categoría
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Padre</TableHead>
            <TableHead>Orden</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.nombre}</TableCell>
              <TableCell>{c.slug}</TableCell>
              <TableCell>{parentName(c.parent_id)}</TableCell>
              <TableCell>{c.orden}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setForm({
                        id: c.id,
                        nombre: c.nombre,
                        slug: c.slug,
                        parent_id: c.parent_id ?? '',
                        orden: String(c.orden),
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
            <DialogTitle>
              {form.id ? 'Editar categoría' : 'Nueva categoría'}
            </DialogTitle>
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
            <div className="space-y-1">
              <Label>Slug (opcional)</Label>
              <Input value={form.slug} onChange={(e) => set('slug', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Padre</Label>
              <select
                className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                value={form.parent_id}
                onChange={(e) => set('parent_id', e.target.value)}
              >
                <option value="">Sin padre</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Orden</Label>
              <Input
                type="number"
                value={form.orden}
                onChange={(e) => set('orden', e.target.value)}
              />
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
