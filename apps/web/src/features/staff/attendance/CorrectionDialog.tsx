// Corrección de marca por administración (solo Admin, cualquier fecha).
// Spec: alcance-funcional.md § "Marcación y asistencia — decisiones de la etapa 2".
import { useEffect, useState } from 'react';
import { Alert, Button, Dialog, Icons, Input, Textarea, useToast } from '@elohim/ui';
import { ApiError } from '../../../lib/api';
import { useCorrectAttendance } from './api';
import { dayTitle } from './bits';
import type { AttendanceRow } from './types';

export interface CorrectionDialogProps {
  /** Fila a corregir; null = cerrado. */
  row: AttendanceRow | null;
  /** Fecha de la jornada (YYYY-MM-DD). */
  date: string;
  onClose: () => void;
}

export function CorrectionDialog({ row, date, onClose }: CorrectionDialogProps) {
  const { toast } = useToast();
  const correct = useCorrectAttendance();

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!row) return;
    setCheckIn(row.checkIn ?? '');
    setCheckOut(row.checkOut ?? '');
    setReason('');
    setTouched(false);
  }, [row?.staffId, date]);

  const reasonTooShort = reason.trim().length < 10;
  const canSubmit = !reasonTooShort && !correct.isPending;

  const submit = () => {
    if (!row) return;
    setTouched(true);
    if (reasonTooShort) return;
    correct.mutate(
      {
        staffId: row.staffId,
        date,
        checkIn: checkIn || null,
        checkOut: checkOut || null,
        reason: reason.trim(),
      },
      {
        onSuccess: () => {
          toast('success', 'Marca corregida', `${row.fullName} — queda registrada como evidencia.`);
          onClose();
        },
        onError: (err) =>
          toast('danger', 'No se pudo corregir', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <Dialog
      open={!!row}
      onClose={onClose}
      icon={<Icons.Pencil />}
      iconTone="warning"
      title="Corregir marca"
      description={row ? `${row.fullName} · ${dayTitle(date)}` : ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={correct.isPending}>
            Cancelar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Check />} disabled={!canSubmit} onClick={submit}>
            Guardar corrección
          </Button>
        </>
      }
    >
      {row && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Input
              label="Hora de ingreso"
              type="time"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              hint="Déjala vacía para quitar el ingreso"
            />
            <Input
              label="Hora de salida"
              type="time"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              hint="Opcional"
            />
          </div>
          <Textarea
            label="Justificación"
            required
            rows={2}
            placeholder="Mínimo 10 caracteres — ej. marcó tarde por comisión de la dirección"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={touched && reasonTooShort ? 'La justificación debe tener al menos 10 caracteres.' : undefined}
            hint={touched && reasonTooShort ? undefined : `${reason.trim().length}/10 caracteres mínimos`}
          />
          <Alert tone="warning" title="No se borra: queda como evidencia">
            La marca original queda registrada con tu usuario, fecha y justificación, visible en el
            historial y la auditoría.
          </Alert>
        </div>
      )}
    </Dialog>
  );
}
