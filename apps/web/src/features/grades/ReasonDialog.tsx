// Diálogo de motivo para guardar notas de un bimestre CERRADO (solo Admin).
// El backend exige el motivo (≥10) y lo deja en la auditoría.
import { useEffect, useState } from 'react';
import { Alert, Button, Dialog, Icons, Textarea } from '@elohim/ui';

export interface ReasonDialogProps {
  open: boolean;
  /** Descripción del contexto (curso · sección · periodo). */
  description?: string;
  pending?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function ReasonDialog({ open, description, pending = false, onClose, onConfirm }: ReasonDialogProps) {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setReason('');
      setTouched(false);
    }
  }, [open]);

  const tooShort = reason.trim().length < 10;

  const submit = () => {
    setTouched(true);
    if (tooShort) return;
    onConfirm(reason.trim());
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      icon={<Icons.Pencil />}
      iconTone="warning"
      title="Guardar en bimestre cerrado"
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Check />} disabled={tooShort || pending} onClick={submit}>
            Guardar cambios
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
        <Textarea
          label="Motivo del cambio"
          required
          rows={2}
          placeholder="Mínimo 10 caracteres — ej. corrección solicitada por el docente tras revisión"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          error={touched && tooShort ? 'El motivo debe tener al menos 10 caracteres.' : undefined}
          hint={touched && tooShort ? undefined : 'Queda en la auditoría'}
        />
        <Alert tone="warning" title="Bimestre cerrado">
          Estás corrigiendo notas de un periodo cerrado. El cambio se registra con tu usuario y motivo.
        </Alert>
      </div>
    </Dialog>
  );
}
