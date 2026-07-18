// Diálogo de solo lectura de un comunicado enviado: mensaje completo, alcance,
// destinatarios y quién/cuándo lo envió. Ofrece reabrir la lista de familias por
// si hay que reenviar a alguien (sin cambiar el estado).
import { Badge, Button, Dialog, Icons } from '@elohim/ui';
import { useAnnouncementDetail } from './api';
import { STATUS_LABELS, STATUS_TONE, dateTime } from './bits';

export interface ViewDialogProps {
  announcementId: string | null;
  onClose: () => void;
  /** Reabrir la lista de familias (reenvío manual, sin cambiar estado). */
  onResend: (id: string) => void;
}

export function ViewDialog({ announcementId, onClose, onResend }: ViewDialogProps) {
  const { data: detail, isLoading } = useAnnouncementDetail(announcementId);
  const open = announcementId !== null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      icon={<Icons.Megaphone />}
      title={detail ? detail.title : 'Comunicado'}
      description={detail ? `${detail.code} · ${detail.scopeLabel}` : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          {detail && (
            <Button variant="primary" iconLeft={<Icons.Phone />} onClick={() => onResend(detail.id)}>
              Ver familias
            </Button>
          )}
        </>
      }
    >
      {isLoading || !detail ? (
        <div style={{ padding: '16px 0', color: 'var(--text-muted)', font: 'var(--type-body)' }}>
          Cargando…
        </div>
      ) : (
        <div className="esge-ann-view">
          <div className="esge-ann-view__meta">
            <Badge tone={STATUS_TONE[detail.status]} dot>
              {STATUS_LABELS[detail.status]}
            </Badge>
            <Badge tone="brand">{detail.scopeLabel}</Badge>
            {detail.recipientsCount != null && (
              <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
                {detail.recipientsCount}{' '}
                {detail.recipientsCount === 1 ? 'familia' : 'familias'}
              </span>
            )}
          </div>

          <div>
            <div className="esge-ann-view__eyebrow" style={{ marginBottom: 6 }}>
              Mensaje
            </div>
            <div className="esge-ann-view__body">{detail.body}</div>
          </div>

          <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
            {detail.sentAt
              ? `Enviado por ${detail.createdByName} · ${dateTime(detail.sentAt)}`
              : `Creado por ${detail.createdByName} · ${dateTime(detail.createdAt)}`}
          </div>
        </div>
      )}
    </Dialog>
  );
}
