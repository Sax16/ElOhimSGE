// Corrección de una entrada de asistencia por administración (solo Admin,
// cualquier día). PATCH /student-attendance/:id/correct con motivo ≥10.
// Queda en la auditoría; no se borra el registro original.
import { useEffect, useState } from 'react';
import { Alert, Button, Dialog, Icons, Select, Textarea, useToast } from '@elohim/ui';
import { ApiError } from '../../lib/api';
import { useCorrectEntry } from './api';
import { STATUS_LABELS, STATUS_ORDER } from './bits';
import type { RosterEntry, StudentAttendanceStatus } from './types';

export interface CorrectDialogProps {
  /** Entrada a corregir; null = cerrado. Debe tener id (ya registrada). */
  entry: RosterEntry | null;
  onClose: () => void;
}

export function CorrectDialog({ entry, onClose }: CorrectDialogProps) {
  const { toast } = useToast();
  const correct = useCorrectEntry();

  const [status, setStatus] = useState<StudentAttendanceStatus>('PRESENTE');
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!entry) return;
    setStatus(entry.status ?? 'PRESENTE');
    setReason('');
    setTouched(false);
  }, [entry?.id]);

  const reasonTooShort = reason.trim().length < 10;
  const canSubmit = !!entry?.id && !reasonTooShort && !correct.isPending;

  const submit = () => {
    if (!entry?.id) return;
    setTouched(true);
    if (reasonTooShort) return;
    correct.mutate(
      { id: entry.id, body: { status, reason: reason.trim() } },
      {
        onSuccess: () => {
          toast(
            'success',
            'Asistencia corregida',
            `${entry.fullName} — queda registrada en la auditoría.`,
          );
          onClose();
        },
        onError: (err) =>
          toast(
            'danger',
            'No se pudo corregir',
            err instanceof ApiError ? err.message : 'Inténtalo de nuevo.',
          ),
      },
    );
  };

  return (
    <Dialog
      open={!!entry}
      onClose={onClose}
      icon={<Icons.Pencil />}
      iconTone="warning"
      title="Corregir asistencia"
      description={entry ? `${entry.fullName} · ${entry.studentCode}` : ''}
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
      {entry && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
          <Select
            label="Nuevo estado"
            options={STATUS_ORDER.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
            value={status}
            onChange={(e) => setStatus(e.target.value as StudentAttendanceStatus)}
          />
          <Textarea
            label="Motivo de la corrección"
            required
            rows={2}
            placeholder="Mínimo 10 caracteres — ej. presentó justificación médica el día siguiente"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={
              touched && reasonTooShort ? 'El motivo debe tener al menos 10 caracteres.' : undefined
            }
            hint={touched && reasonTooShort ? undefined : 'Queda en la auditoría'}
          />
          <Alert tone="warning" title="No se borra: queda como evidencia">
            El registro original se conserva con tu usuario, fecha y motivo, visible en el historial.
          </Alert>
        </div>
      )}
    </Dialog>
  );
}
