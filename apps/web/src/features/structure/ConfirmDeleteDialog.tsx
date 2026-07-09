// Diálogo de confirmación simple para eliminar estructura vacía (Etapa 3).
// La regla "nada se borra" aplica a transacciones; la estructura vacía sí se elimina, con auditoría.
import type { ReactNode } from 'react';
import { Button, Dialog, Icons } from '@elohim/ui';

export interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** Título del diálogo, ej. "Eliminar nivel". */
  title: string;
  /** Descripción de lo que se elimina. */
  description: ReactNode;
  /** Etiqueta del botón destructivo. @default "Eliminar" */
  confirmLabel?: string;
  loading?: boolean;
}

/** Confirmación con botón danger. Reutilizable para nivel, grado, sección, curso y programa. */
export function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Eliminar',
  loading = false,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      icon={<Icons.Trash />}
      iconTone="danger"
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="danger" iconLeft={<Icons.Trash />} onClick={onConfirm} disabled={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
