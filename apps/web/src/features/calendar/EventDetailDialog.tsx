// Diálogo de detalle de un evento del calendario. Muestra tipo, rango y
// descripción; con permiso estructura.editar ofrece Editar y Eliminar (con
// confirmación). Los feriados/exámenes/actividades se editan; los vencimientos de
// pensión son derivados y no llegan aquí.
import { useState } from 'react';
import { Badge, Button, Dialog, Icons, useToast } from '@elohim/ui';
import { ApiError } from '../../lib/api';
import { useDeleteEvent } from './api';
import { EVENT_TYPE_META, eventDateRange } from './bits';
import type { CalendarEvent } from './types';

export interface EventDetailDialogProps {
  event: CalendarEvent | null;
  canEdit: boolean;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
}

export function EventDetailDialog({ event, canEdit, onClose, onEdit }: EventDetailDialogProps) {
  const { toast } = useToast();
  const deleteEvent = useDeleteEvent();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const meta = event ? EVENT_TYPE_META[event.type] : null;

  const onDelete = () => {
    if (!event) return;
    deleteEvent.mutate(event.id, {
      onSuccess: () => {
        toast('success', 'Evento eliminado', `Se quitó "${event.name}" del calendario.`);
        setConfirmOpen(false);
        onClose();
      },
      onError: (err) =>
        toast('danger', 'No se pudo eliminar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
    });
  };

  return (
    <>
      <Dialog
        open={!!event && !confirmOpen}
        onClose={onClose}
        icon={<Icons.Calendar />}
        title={event?.name ?? 'Evento'}
        description={meta?.label}
        footer={
          canEdit && event ? (
            <>
              <Button
                variant="ghost"
                iconLeft={<Icons.Trash />}
                onClick={() => setConfirmOpen(true)}
                style={{ color: 'var(--danger)', marginRight: 'auto' }}
              >
                Eliminar
              </Button>
              <Button variant="secondary" onClick={onClose}>
                Cerrar
              </Button>
              <Button variant="primary" iconLeft={<Icons.Pencil />} onClick={() => onEdit(event)}>
                Editar
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          )
        }
      >
        {event && meta && (
          <div className="esge-cal-detail">
            <div className="esge-cal-detail__row">
              <span className="esge-cal-detail__eyebrow">Tipo</span>
              <span>
                <Badge tone={meta.tone} dot>
                  {meta.label}
                </Badge>
              </span>
            </div>
            <div className="esge-cal-detail__row">
              <span className="esge-cal-detail__eyebrow">
                {event.endDate && event.endDate !== event.startDate ? 'Fechas' : 'Fecha'}
              </span>
              <span className="esge-cal-detail__value esge-cal-detail__value--mono">
                {eventDateRange(event)}
              </span>
            </div>
            {event.description && (
              <div className="esge-cal-detail__row">
                <span className="esge-cal-detail__eyebrow">Descripción</span>
                <span className="esge-cal-detail__value">{event.description}</span>
              </div>
            )}
          </div>
        )}
      </Dialog>

      {/* Confirmación de borrado. */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        icon={<Icons.Trash />}
        iconTone="danger"
        title="Eliminar evento"
        description={event ? `${event.name} · ${eventDateRange(event)}` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={deleteEvent.isPending}>
              Cancelar
            </Button>
            <Button variant="danger" iconLeft={<Icons.Check />} onClick={onDelete} disabled={deleteEvent.isPending}>
              Eliminar
            </Button>
          </>
        }
      >
        <p style={{ padding: '4px 0', font: 'var(--type-body)', color: 'var(--text-body)' }}>
          Se quitará el evento del calendario. Esta acción no se puede deshacer.
        </p>
      </Dialog>
    </>
  );
}
