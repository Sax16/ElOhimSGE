// Diálogo de envío manual por WhatsApp. Carga las familias del alcance y ofrece,
// por fila, el botón wa.me con el mensaje del comunicado; un check local marca
// "ya le escribí" (no persiste). "Marcar como enviado" cierra el flujo (POST /send).
// En modo reenvío (comunicado ya enviado) la lista es de solo consulta.
import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Dialog, Icons, useToast } from '@elohim/ui';
import { ApiError } from '../../lib/api';
import { useAnnouncementDetail, useAnnouncementRecipients, useSendAnnouncement } from './api';
import { announcementWaUrl } from './bits';

export interface SendDialogProps {
  announcementId: string | null;
  /** 'resend' = comunicado ya enviado; solo reabrir la lista, sin cambiar estado. */
  mode: 'send' | 'resend';
  onClose: () => void;
}

export function SendDialog({ announcementId, mode, onClose }: SendDialogProps) {
  const { toast } = useToast();
  const { data: detail } = useAnnouncementDetail(announcementId);
  const { data, isLoading } = useAnnouncementRecipients(announcementId);
  const sendMut = useSendAnnouncement();

  const recipients = useMemo(() => data?.recipients ?? [], [data]);
  const [contacted, setContacted] = useState<Set<string>>(new Set());

  useEffect(() => {
    setContacted(new Set());
  }, [announcementId]);

  const open = announcementId !== null;
  const body = detail?.body ?? '';

  const onWhatsApp = (guardianId: string, phone: string) => {
    window.open(announcementWaUrl(phone, body), '_blank', 'noopener,noreferrer');
    setContacted((prev) => {
      const next = new Set(prev);
      next.add(guardianId);
      return next;
    });
  };

  const onMarkSent = () => {
    if (!announcementId) return;
    sendMut.mutate(announcementId, {
      onSuccess: (item) => {
        toast(
          'success',
          'Comunicado enviado',
          `${item.recipientsCount ?? recipients.length} ${
            (item.recipientsCount ?? recipients.length) === 1 ? 'familia' : 'familias'
          }.`,
        );
        onClose();
      },
      onError: (err) =>
        toast('danger', 'No se pudo marcar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      icon={<Icons.Send />}
      title={mode === 'resend' ? 'Familias del comunicado' : 'Enviar por WhatsApp'}
      description={detail ? `${detail.code} · ${detail.scopeLabel}` : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={sendMut.isPending}>
            {mode === 'resend' ? 'Cerrar' : 'Cancelar'}
          </Button>
          {mode === 'send' && (
            <Button
              variant="primary"
              iconLeft={<Icons.Check />}
              onClick={onMarkSent}
              disabled={sendMut.isPending || recipients.length === 0}
            >
              Marcar como enviado
            </Button>
          )}
        </>
      }
    >
      <div className="esge-ann-recipients">
        {mode === 'send' && (
          <Alert tone="info">
            El envío es manual por WhatsApp, familia por familia; márcalo como enviado cuando termines.
          </Alert>
        )}

        <div className="esge-ann-recipients__count">
          {contacted.size} de {recipients.length}{' '}
          {recipients.length === 1 ? 'familia contactada' : 'familias contactadas'}
        </div>

        <div className="esge-ann-recipients__list">
          {isLoading ? (
            <div style={{ padding: 16, color: 'var(--text-muted)', font: 'var(--type-body)' }}>
              Cargando familias…
            </div>
          ) : recipients.length === 0 ? (
            <div style={{ padding: 16, color: 'var(--text-muted)', font: 'var(--type-body)' }}>
              No hay familias en este alcance.
            </div>
          ) : (
            recipients.map((r) => {
              const done = contacted.has(r.guardianId);
              return (
                <div
                  key={r.guardianId}
                  className={`esge-ann-recipient${done ? ' esge-ann-recipient--done' : ''}`}
                >
                  <div className="esge-ann-recipient__stack">
                    <span className="esge-ann-recipient__name">{r.guardianName}</span>
                    <span className="esge-ann-recipient__students">{r.students.join(' · ')}</span>
                    <span className="esge-ann-recipient__phone">{r.phone ?? 'Sin contacto'}</span>
                  </div>
                  <div className="esge-ann-recipient__actions">
                    {done && (
                      <span className="esge-ann-recipient__check" title="Ya le escribiste">
                        <Icons.Check />
                      </span>
                    )}
                    {r.phone ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        iconLeft={<Icons.Phone />}
                        onClick={() => onWhatsApp(r.guardianId, r.phone as string)}
                      >
                        WhatsApp
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" disabled>
                        Sin contacto
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Dialog>
  );
}
