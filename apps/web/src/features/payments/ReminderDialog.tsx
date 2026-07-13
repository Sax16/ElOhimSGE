// Diálogo «Recordar deuda por WhatsApp» reutilizable (R2). Lo usan Pensiones y el
// Dashboard: recibe un guardianId, muestra la vista previa consolidada (GET
// /billing/reminders/preview) y, al confirmar, registra el recordatorio (POST
// /billing/reminders) y abre wa.me con el mensaje prellenado.
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Dialog,
  Icons,
  useToast,
} from '@elohim/ui';
import { formatPEN, toCents } from '@elohim/shared';
import { ApiError } from '../../lib/api';
import { fmtDate } from '../structure/bits';
import { useReminderPreview, useSendReminder } from './api';

export interface ReminderDialogProps {
  /** Apoderado principal al que se le recuerda la deuda. */
  guardianId: string | null;
  /** Nombre para el encabezado del diálogo mientras carga la vista previa. */
  guardianName?: string;
  open: boolean;
  /** Si es falso, el botón de envío queda deshabilitado (año cerrado / sin permiso). */
  canMutate?: boolean;
  onClose: () => void;
}

export function ReminderDialog({
  guardianId,
  guardianName,
  open,
  canMutate = true,
  onClose,
}: ReminderDialogProps) {
  const { toast } = useToast();
  // Solo consulta cuando el diálogo está abierto (evita fetch con id residual).
  const activeId = open ? guardianId : null;
  const preview = useReminderPreview(activeId);
  const send = useSendReminder();

  const data = preview.data;
  const previewError = preview.error;

  const submit = () => {
    if (!guardianId || !canMutate) return;
    send.mutate(guardianId, {
      onSuccess: (r) => {
        window.open(r.waUrl, '_blank', 'noopener,noreferrer');
        toast(
          'success',
          'Recordatorio registrado',
          `${r.guardianName} · ${formatPEN(toCents(r.totalAmount))} en ${r.itemsCount} ${r.itemsCount === 1 ? 'cuota' : 'cuotas'}.`,
        );
        onClose();
      },
      onError: (err) =>
        toast('danger', 'No se pudo registrar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
    });
  };

  const blocked = !canMutate || preview.isLoading || !!previewError || !data || send.isPending;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      icon={<Icons.Send />}
      title="Recordar deuda por WhatsApp"
      description={data?.guardianName ?? guardianName ?? ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Send />} disabled={blocked} onClick={submit}>
            Abrir WhatsApp y registrar
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
        {preview.isLoading ? (
          <div style={{ padding: '12px 0', color: 'var(--text-muted)', font: 'var(--type-body)' }}>Cargando…</div>
        ) : previewError ? (
          <Alert tone="warning" title="No se puede enviar el recordatorio">
            {previewError instanceof ApiError
              ? previewError.message
              : 'El apoderado no tiene teléfono o deuda que recordar.'}
          </Alert>
        ) : data ? (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                background: 'var(--surface-sunken)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Avatar name={data.guardianName} size="sm" color="var(--green-500)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{data.guardianName}</div>
                <div style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {data.phone}
                </div>
              </div>
              <Badge tone="danger" dot>
                {formatPEN(toCents(data.totalAmount))}
              </Badge>
            </div>
            {data.lastReminderAt && (
              <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
                Último recordatorio: {fmtDate(data.lastReminderAt)}
              </div>
            )}
            <div
              style={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-body)',
                background: 'var(--surface-sunken)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                maxHeight: 220,
                overflowY: 'auto',
              }}
            >
              {data.message}
            </div>
          </>
        ) : null}
      </div>
    </Dialog>
  );
}
