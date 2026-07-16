// Aviso de falta al apoderado (contacto principal) por WhatsApp. El envío es
// manual: cada fila abre wa.me con el mensaje prellenado. Se usa como diálogo
// tras guardar la toma (portal docente) y como panel en la vista Admin.
import { Alert, Avatar, Badge, Button, Dialog, Icons } from '@elohim/ui';
import { absenceWaUrl } from './bits';
import type { RosterEntry } from './types';

interface AbsenceListProps {
  absences: RosterEntry[];
  date: string;
}

/** Lista de faltas con botón de WhatsApp por familia (o "Sin contacto"). */
export function AbsenceList({ absences, date }: AbsenceListProps) {
  if (absences.length === 0) {
    return (
      <div style={{ padding: '10px 0', font: 'var(--type-body)', color: 'var(--text-muted)' }}>
        No hay faltas registradas en esta fecha.
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {absences.map((a) => (
        <div
          key={a.enrollmentId}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 12px',
            background: 'var(--surface-sunken)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <Avatar name={a.fullName} size="sm" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                font: 'var(--type-label)',
                color: 'var(--text-strong)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {a.fullName}
            </div>
            <div style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>
              {a.guardianName ?? 'Sin apoderado principal'}
            </div>
          </div>
          {a.guardianPhone ? (
            <Button
              size="sm"
              variant="secondary"
              iconLeft={<Icons.Phone />}
              onClick={() =>
                window.open(
                  absenceWaUrl(a.fullName, date, a.guardianPhone as string),
                  '_blank',
                  'noopener,noreferrer',
                )
              }
            >
              WhatsApp
            </Button>
          ) : (
            <Badge tone="neutral">Sin contacto principal</Badge>
          )}
        </div>
      ))}
    </div>
  );
}

export interface AbsenceNoticeDialogProps {
  open: boolean;
  absences: RosterEntry[];
  date: string;
  onClose: () => void;
}

/** Diálogo emergente con las faltas recién guardadas. */
export function AbsenceNoticeDialog({ open, absences, date, onClose }: AbsenceNoticeDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      icon={<Icons.Bell />}
      iconTone="warning"
      title="Avisar faltas al apoderado"
      description={`${absences.length} ${absences.length === 1 ? 'falta' : 'faltas'} en esta toma`}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
        <AbsenceList absences={absences} date={date} />
        <Alert tone="info">
          El aviso se envía por WhatsApp al contacto principal desde el botón — no es automático.
        </Alert>
      </div>
    </Dialog>
  );
}
