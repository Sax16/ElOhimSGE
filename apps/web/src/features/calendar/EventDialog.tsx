// Diálogo "Nuevo evento" / "Editar evento". Nombre + tipo + rango de fechas +
// descripción, con alert de feriado y checkbox para nacer un comunicado desde una
// actividad. RHF + zod local (espejo del contrato; el backend valida de nuevo).
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, Checkbox, Dialog, Icons, Input, Select, Textarea, useToast } from '@elohim/ui';
import { ApiError } from '../../lib/api';
import { useCreateAnnouncement } from '../announcements/api';
import { useCreateEvent, useUpdateEvent } from './api';
import { EVENT_TYPE_META, EVENT_TYPE_ORDER, activityAnnouncementBody, todayStr } from './bits';
import type { CalendarEvent, CalendarEventType } from './types';

const schema = z
  .object({
    name: z.string().trim().min(1, 'Escribe un nombre.'),
    type: z.enum(['FERIADO', 'EXAMEN', 'ACTIVIDAD']),
    startDate: z.string().min(1, 'Indica la fecha de inicio.'),
    endDate: z.string().optional(),
    description: z.string().trim().optional(),
    createAnnouncement: z.boolean(),
  })
  .refine((v) => !v.endDate || v.endDate >= v.startDate, {
    path: ['endDate'],
    message: 'La fecha final no puede ser anterior a la inicial.',
  });

type FormValues = z.infer<typeof schema>;

export interface EventDialogProps {
  open: boolean;
  /** Evento a editar; undefined = crear nuevo. */
  event?: CalendarEvent | null;
  /** Fecha preseleccionada al crear (YYYY-MM-DD). */
  defaultDate?: string;
  onClose: () => void;
}

export function EventDialog({ open, event, defaultDate, onClose }: EventDialogProps) {
  const { toast } = useToast();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const createAnnouncement = useCreateAnnouncement();
  const isEdit = !!event;

  const { control, handleSubmit, watch, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      type: 'FERIADO',
      startDate: todayStr(),
      endDate: '',
      description: '',
      createAnnouncement: true,
    },
  });

  const type = watch('type');

  useEffect(() => {
    if (!open) return;
    reset({
      name: event?.name ?? '',
      type: event?.type ?? 'FERIADO',
      startDate: event?.startDate ?? defaultDate ?? todayStr(),
      endDate: event && event.endDate !== event.startDate ? event.endDate : '',
      description: event?.description ?? '',
      createAnnouncement: true,
    });
  }, [open, event, defaultDate, reset]);

  const pending = createEvent.isPending || updateEvent.isPending;

  const onSubmit = handleSubmit((values) => {
    const body = {
      type: values.type as CalendarEventType,
      name: values.name.trim(),
      startDate: values.startDate,
      endDate: values.endDate || undefined,
      description: values.description?.trim() ? values.description.trim() : undefined,
    };

    const onError = (err: unknown) =>
      toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.');

    if (isEdit && event) {
      updateEvent.mutate(
        { id: event.id, body },
        {
          onSuccess: () => {
            toast('success', 'Evento actualizado', 'Los cambios se guardaron en el calendario.');
            onClose();
          },
          onError,
        },
      );
      return;
    }

    createEvent.mutate(body, {
      onSuccess: () => {
        toast(
          'success',
          'Evento creado',
          values.type === 'FERIADO'
            ? 'Día no lectivo: se bloqueará la asistencia y no se computarán faltas.'
            : 'Se agregó al calendario académico.',
        );
        // Actividad → nace un borrador de comunicado a todo el colegio.
        if (values.type === 'ACTIVIDAD' && values.createAnnouncement) {
          createAnnouncement.mutate(
            {
              title: values.name.trim(),
              body: activityAnnouncementBody(values.name.trim(), values.startDate),
              scope: 'COLEGIO',
            },
            {
              onSuccess: () =>
                toast('info', 'Borrador creado en Comunicados', 'Revísalo y envíalo cuando quieras.'),
            },
          );
        }
        onClose();
      },
      onError,
    });
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      icon={<Icons.Calendar />}
      title={isEdit ? 'Editar evento' : 'Nuevo evento'}
      description="Feriados, exámenes y actividades del año activo"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Check />} onClick={() => onSubmit()} disabled={pending}>
            {isEdit ? 'Guardar cambios' : 'Crear evento'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingTop: 4 }}>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              label="Nombre"
              required
              placeholder="Ej. Simulacro de sismo"
              {...field}
              error={fieldState.error?.message}
              containerStyle={{ gridColumn: '1 / -1' }}
            />
          )}
        />
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              label="Tipo"
              required
              value={field.value}
              onChange={field.onChange}
              options={EVENT_TYPE_ORDER.map((t) => ({ value: t, label: EVENT_TYPE_META[t].label }))}
              containerStyle={{ gridColumn: '1 / -1' }}
            />
          )}
        />
        <Controller
          name="startDate"
          control={control}
          render={({ field, fieldState }) => (
            <Input label="Desde" type="date" required {...field} error={fieldState.error?.message} />
          )}
        />
        <Controller
          name="endDate"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              label="Hasta"
              type="date"
              {...field}
              error={fieldState.error?.message}
              hint="Igual o vacío = un solo día"
            />
          )}
        />
        {type === 'FERIADO' && (
          <Alert tone="warning" style={{ gridColumn: '1 / -1' }}>
            Ese día se bloqueará la asistencia de estudiantes y no se computarán faltas del personal.
          </Alert>
        )}
        {type === 'ACTIVIDAD' && !isEdit && (
          <div style={{ gridColumn: '1 / -1' }}>
            <Controller
              name="createAnnouncement"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label="Crear comunicado a las familias"
                  description="Se abrirá como borrador en Comunicados"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
          </div>
        )}
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea
              label="Descripción"
              rows={2}
              placeholder="Opcional…"
              {...field}
              containerStyle={{ gridColumn: '1 / -1' }}
            />
          )}
        />
      </div>
    </Dialog>
  );
}
