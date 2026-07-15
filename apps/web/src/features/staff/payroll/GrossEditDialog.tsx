// Editar el sueldo bruto del mes de un empleado "Por horas" (solo este mes; el
// sueldo base de la ficha no cambia). Spec: StaffScreen.jsx (icono lápiz en la
// columna Sueldo) · alcance-funcional.md § "Planilla — decisiones de la etapa 3".
import { useEffect, useState } from 'react';
import { Button, Dialog, Icons, Input, useToast } from '@elohim/ui';
import { ApiError } from '../../../lib/api';
import { useUpdateGross } from './api';
import { pen } from './bits';
import type { PayrollEntryDto } from './types';

export function GrossEditDialog({
  entry,
  onClose,
}: {
  entry: PayrollEntryDto | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const update = useUpdateGross();
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (entry) setAmount(entry.grossAmount);
  }, [entry?.id]);

  const parsed = Number(amount);
  const valid = amount.trim() !== '' && Number.isFinite(parsed) && parsed >= 0;

  const submit = () => {
    if (!entry || !valid) return;
    update.mutate(
      { id: entry.id, body: { grossAmount: parsed } },
      {
        onSuccess: () => {
          toast('success', 'Monto actualizado', `${entry.staffName} · sueldo del mes ${pen(String(parsed))}.`);
          onClose();
        },
        onError: (err) =>
          toast('danger', 'No se pudo actualizar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <Dialog
      open={!!entry}
      onClose={onClose}
      icon={<Icons.Pencil />}
      title="Editar sueldo del mes"
      description={entry ? `${entry.staffName} · ${entry.position}` : ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={update.isPending}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            iconLeft={<Icons.Check />}
            disabled={!valid || update.isPending}
            onClick={submit}
          >
            Guardar monto
          </Button>
        </>
      }
    >
      {entry && (
        <div style={{ paddingTop: 4 }}>
          <Input
            label="Monto del mes"
            prefix="S/."
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            hint="Solo este mes; el sueldo base de la ficha no cambia."
            autoFocus
          />
        </div>
      )}
    </Dialog>
  );
}
