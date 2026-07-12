// Administración de categorías de gasto/ingreso: crear, renombrar, activar/
// desactivar y eliminar (solo si no tiene movimientos). Categorías en tabla
// administrable (alcance-funcional.md § etapa 4).
import { useEffect, useState } from 'react';
import { Badge, Button, Dialog, IconButton, Icons, Input, Tooltip, useToast } from '@elohim/ui';
import { ACTIVE_STATUS_LABELS } from '@elohim/shared';
import { ApiError } from '../../lib/api';
import { useCreateCategory, useDeleteCategory, useTreasuryCategories, useUpdateCategory } from './api';
import type { TreasuryCategory, TreasuryKind } from './types';

export function CategoriesDialog({
  open,
  kind,
  onClose,
}: {
  open: boolean;
  kind: TreasuryKind;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const { data: categories } = useTreasuryCategories(kind);
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const remove = useDeleteCategory();

  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (open) {
      setNewName('');
      setEditId(null);
      setEditName('');
    }
  }, [open]);

  const kindNoun = kind === 'GASTO' ? 'gasto' : 'ingreso';

  const submitNew = () => {
    const name = newName.trim();
    if (!name) return;
    create.mutate(
      { kind, name, status: 'ACTIVO' },
      {
        onSuccess: () => {
          toast('success', 'Categoría creada', `«${name}» agregada a las categorías de ${kindNoun}.`);
          setNewName('');
        },
        onError: (err) =>
          toast('danger', 'No se pudo crear', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  const submitRename = (cat: TreasuryCategory) => {
    const name = editName.trim();
    if (!name || name === cat.name) {
      setEditId(null);
      return;
    }
    update.mutate(
      { id: cat.id, body: { name } },
      {
        onSuccess: () => {
          toast('success', 'Categoría actualizada', 'El nuevo nombre se guardó.');
          setEditId(null);
        },
        onError: (err) =>
          toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  const toggleStatus = (cat: TreasuryCategory) => {
    const status = cat.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    update.mutate(
      { id: cat.id, body: { status } },
      {
        onSuccess: () =>
          toast('success', 'Categoría actualizada', `«${cat.name}» ${status === 'ACTIVO' ? 'activada' : 'desactivada'}.`),
        onError: (err) =>
          toast('danger', 'No se pudo actualizar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  const del = (cat: TreasuryCategory) => {
    remove.mutate(cat.id, {
      onSuccess: () => toast('success', 'Categoría eliminada', `«${cat.name}» se quitó del catálogo.`),
      onError: (err) =>
        toast('danger', 'No se pudo eliminar', err instanceof ApiError ? err.message : 'Tiene movimientos: desactívala.'),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      showClose
      icon={<Icons.Layers />}
      title={`Categorías de ${kindNoun}`}
      description="Renombra, desactiva o elimina (solo si no tiene movimientos)."
      footer={
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <Input
              label="Nueva categoría"
              placeholder={kind === 'GASTO' ? 'Ej. Servicios (luz, agua, internet)' : 'Ej. Impresiones y copias'}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <Button
            variant="primary"
            iconLeft={<Icons.Plus />}
            disabled={!newName.trim() || create.isPending}
            onClick={submitNew}
          >
            Agregar
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {(categories ?? []).map((cat) => (
            <div
              key={cat.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 0',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              {editId === cat.id ? (
                <div style={{ flex: 1 }}>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') submitRename(cat);
                      if (e.key === 'Escape') setEditId(null);
                    }}
                    autoFocus
                  />
                </div>
              ) : (
                <span style={{ flex: 1, font: 'var(--type-label)', color: 'var(--text-strong)' }}>{cat.name}</span>
              )}
              <Badge tone={cat.status === 'ACTIVO' ? 'success' : 'neutral'} dot>
                {ACTIVE_STATUS_LABELS[cat.status]}
              </Badge>
              <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)', minWidth: 64, textAlign: 'right' }}>
                {cat.movementCount} {cat.movementCount === 1 ? 'uso' : 'usos'}
              </span>
              {editId === cat.id ? (
                <>
                  <Tooltip content="Guardar">
                    <IconButton label="Guardar" size="sm" onClick={() => submitRename(cat)}>
                      <Icons.Check />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <div style={{ display: 'inline-flex', gap: 2 }}>
                  <Tooltip content="Renombrar">
                    <IconButton
                      label="Renombrar"
                      size="sm"
                      onClick={() => {
                        setEditId(cat.id);
                        setEditName(cat.name);
                      }}
                    >
                      <Icons.Pencil />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content={cat.status === 'ACTIVO' ? 'Desactivar' : 'Activar'}>
                    <IconButton label="Cambiar estado" size="sm" onClick={() => toggleStatus(cat)}>
                      {cat.status === 'ACTIVO' ? <Icons.Eye /> : <Icons.Check />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip content={cat.movementCount > 0 ? 'Tiene movimientos: desactívala' : 'Eliminar'}>
                    <IconButton
                      label="Eliminar"
                      size="sm"
                      variant="danger"
                      disabled={cat.movementCount > 0 || remove.isPending}
                      onClick={() => del(cat)}
                    >
                      <Icons.Trash />
                    </IconButton>
                  </Tooltip>
                </div>
              )}
            </div>
          ))}
          {(categories?.length ?? 0) === 0 && (
            <div style={{ padding: '16px 0', font: 'var(--type-body)', color: 'var(--text-muted)' }}>
              Aún no hay categorías de {kindNoun}.
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
