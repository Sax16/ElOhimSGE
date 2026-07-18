// Diálogo "Detalle" de una incidencia: datos completos + acciones según estado
// y rol (avisar por WhatsApp → /notified, cerrar → /close, anular → /cancel).
import { useEffect, useState, type ReactNode } from 'react';
import { Alert, Avatar, Badge, Button, Dialog, Icons, Textarea, useToast } from '@elohim/ui';
import { ApiError } from '../../lib/api';
import { useMe } from '../../lib/useMe';
import {
  useCancelIncident,
  useCloseIncident,
  useIncidentDetail,
  useMarkNotified,
} from './api';
import {
  SEVERITY_LABELS,
  SEVERITY_TONE,
  STATUS_LABELS,
  STATUS_TONE,
  conductWaUrl,
  dateTime,
  isFinalStatus,
} from './bits';

export interface IncidentDetailDialogProps {
  /** Id de la incidencia a mostrar; null cierra el diálogo. */
  incidentId: string | null;
  onClose: () => void;
}

function Field({
  label,
  value,
  mono = false,
  full = false,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
  full?: boolean;
}) {
  return (
    <div
      className={`esge-conduct-detail__field${full ? ' esge-conduct-detail__field--full' : ''}`}
    >
      <div className="esge-conduct-detail__eyebrow">{label}</div>
      <div
        className={`esge-conduct-detail__value${mono ? ' esge-conduct-detail__value--mono' : ''}`}
      >
        {value}
      </div>
    </div>
  );
}

export function IncidentDetailDialog({ incidentId, onClose }: IncidentDetailDialogProps) {
  const { toast } = useToast();
  const { data: me } = useMe();
  const isAdmin = me?.role === 'ADMIN';

  const { data: inc, isLoading } = useIncidentDetail(incidentId);
  const markNotified = useMarkNotified();
  const closeIncident = useCloseIncident();
  const cancelIncident = useCancelIncident();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonTouched, setReasonTouched] = useState(false);

  useEffect(() => {
    if (!incidentId) {
      setCancelOpen(false);
      setReason('');
      setReasonTouched(false);
    }
  }, [incidentId]);

  const open = incidentId !== null;

  // ---- Acciones -------------------------------------------------------------
  const notifiable = inc && (inc.severity === 'MODERADA' || inc.severity === 'GRAVE') && !isFinalStatus(inc.status);
  const hasPhone = !!inc?.guardianPhone;

  const onNotify = () => {
    if (!inc || !inc.guardianPhone) return;
    // Abre wa.me primero (envío manual) y LUEGO confirma al API.
    window.open(
      conductWaUrl({
        studentName: inc.student.fullName,
        occurredAt: inc.occurredAt,
        severity: inc.severity,
        summary: inc.summary,
        phone: inc.guardianPhone,
        citationAt: inc.citationAt,
      }),
      '_blank',
      'noopener,noreferrer',
    );
    markNotified.mutate(inc.id, {
      onSuccess: () => toast('success', 'Aviso enviado', 'Se marcó el aviso al apoderado.'),
      onError: (err) =>
        toast(
          'danger',
          'No se pudo marcar el aviso',
          err instanceof ApiError ? err.message : 'Inténtalo de nuevo.',
        ),
    });
  };

  const onCloseIncident = () => {
    if (!inc) return;
    closeIncident.mutate(inc.id, {
      onSuccess: () => {
        toast('success', 'Incidencia cerrada', 'Queda en el historial del estudiante.');
        onClose();
      },
      onError: (err) =>
        toast(
          'danger',
          'No se pudo cerrar',
          err instanceof ApiError ? err.message : 'Inténtalo de nuevo.',
        ),
    });
  };

  const submitCancel = () => {
    if (!inc) return;
    setReasonTouched(true);
    if (reason.trim().length < 10) return;
    cancelIncident.mutate(
      { id: inc.id, body: { reason: reason.trim() } },
      {
        onSuccess: () => {
          toast('success', 'Incidencia anulada', 'Se registró la anulación con tu motivo.');
          setCancelOpen(false);
          onClose();
        },
        onError: (err) =>
          toast(
            'danger',
            'No se pudo anular',
            err instanceof ApiError ? err.message : 'Inténtalo de nuevo.',
          ),
      },
    );
  };

  const pending = markNotified.isPending || closeIncident.isPending;
  const reasonTooShort = reason.trim().length < 10;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        size="lg"
        icon={<Icons.Clipboard />}
        title={inc ? `${inc.code} · ${inc.summary}` : 'Detalle de la incidencia'}
        description={inc ? `${inc.student.fullName} · ${inc.student.sectionLabel}` : undefined}
        footer={
          inc ? (
            <>
              {isAdmin && inc.status !== 'ANULADA' && (
                <Button
                  variant="ghost"
                  iconLeft={<Icons.Trash />}
                  onClick={() => {
                    setReason('');
                    setReasonTouched(false);
                    setCancelOpen(true);
                  }}
                  disabled={pending}
                  style={{ color: 'var(--danger)', marginRight: 'auto' }}
                >
                  Anular
                </Button>
              )}
              {!isFinalStatus(inc.status) && (
                <Button variant="secondary" iconLeft={<Icons.Check />} onClick={onCloseIncident} disabled={pending}>
                  Cerrar incidencia
                </Button>
              )}
              {notifiable && (
                <Button
                  variant="primary"
                  iconLeft={<Icons.Phone />}
                  onClick={onNotify}
                  disabled={!hasPhone || pending}
                >
                  {inc.notifiedAt ? 'Reenviar aviso' : 'Avisar por WhatsApp'}
                </Button>
              )}
            </>
          ) : (
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          )
        }
      >
        {isLoading || !inc ? (
          <div style={{ padding: '16px 0', color: 'var(--text-muted)', font: 'var(--type-body)' }}>
            Cargando…
          </div>
        ) : (
          <div className="esge-conduct-detail">
            <div className="esge-conduct-detail__badges">
              <Badge tone={SEVERITY_TONE[inc.severity]} dot>
                {SEVERITY_LABELS[inc.severity]}
              </Badge>
              <Badge tone={STATUS_TONE[inc.status]} dot>
                {STATUS_LABELS[inc.status]}
              </Badge>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={inc.student.fullName} size="sm" />
              <div className="esge-conduct-cell__stack">
                <span className="esge-conduct-cell__main">{inc.student.fullName}</span>
                <span className="esge-conduct-cell__sub" style={{ fontFamily: 'var(--font-mono)' }}>
                  {inc.student.code} · {inc.student.sectionLabel}
                </span>
              </div>
            </div>

            <div className="esge-conduct-detail__grid">
              <Field label="Fecha y hora" value={dateTime(inc.occurredAt)} mono />
              <Field label="Registró" value={inc.registeredByName} />
              <Field label="Asunto" value={inc.summary} full />
              <Field label="Descripción de los hechos" value={inc.description} full />
              <Field label="Medida aplicada" value={inc.measure?.trim() || '—'} full />
              {inc.severity === 'GRAVE' && (
                <Field label="Citación" value={inc.citationAt ? dateTime(inc.citationAt) : '—'} mono />
              )}
              <Field
                label="Aviso al apoderado"
                value={inc.notifiedAt ? dateTime(inc.notifiedAt) : 'Pendiente'}
                mono={!!inc.notifiedAt}
              />
              {inc.status === 'ANULADA' && (
                <Field label="Motivo de anulación" value={inc.cancelReason || '—'} full />
              )}
            </div>

            {notifiable && !hasPhone && (
              <Alert tone="warning" title="Sin contacto principal">
                Este estudiante no tiene un apoderado principal con teléfono. Registra el contacto
                para poder avisar por WhatsApp.
              </Alert>
            )}
          </div>
        )}
      </Dialog>

      {/* Motivo de anulación (patrón ReasonDialog). */}
      <Dialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        icon={<Icons.Trash />}
        iconTone="danger"
        title="Anular incidencia"
        description={inc ? `${inc.code} · ${inc.summary}` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelOpen(false)} disabled={cancelIncident.isPending}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              iconLeft={<Icons.Check />}
              onClick={submitCancel}
              disabled={reasonTooShort || cancelIncident.isPending}
            >
              Anular incidencia
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
          <Textarea
            label="Motivo de la anulación"
            required
            rows={2}
            placeholder="Mínimo 10 caracteres — ej. registro duplicado por error"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={reasonTouched && reasonTooShort ? 'El motivo debe tener al menos 10 caracteres.' : undefined}
            hint={reasonTouched && reasonTooShort ? undefined : 'Queda en la auditoría'}
          />
          <Alert tone="danger" title="Nada se borra">
            La incidencia queda anulada en el historial, con tu usuario y motivo. No se elimina.
          </Alert>
        </div>
      </Dialog>
    </>
  );
}
