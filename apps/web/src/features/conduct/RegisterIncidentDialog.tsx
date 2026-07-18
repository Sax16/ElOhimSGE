// Diálogo "Registrar incidencia". Buscador de estudiante + formulario con
// alerts condicionales por gravedad (RHF + zod local, espejo del contrato).
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Alert,
  Avatar,
  Button,
  Dialog,
  Icons,
  IconButton,
  Input,
  Select,
  Textarea,
  useToast,
} from '@elohim/ui';
import { ApiError } from '../../lib/api';
import { useConductStudents, useCreateIncident } from './api';
import { SEVERITY_LABELS, SEVERITY_ORDER, localInputToIso, nowLocalInput } from './bits';
import type { ConductStudentOption, Incident } from './types';

// Schema local (espejo del contrato). El backend valida de nuevo.
const schema = z
  .object({
    severity: z.enum(['LEVE', 'MODERADA', 'GRAVE']),
    occurredAt: z.string().min(1, 'Indica la fecha y hora.'),
    summary: z.string().trim().min(1, 'Escribe un asunto.'),
    description: z.string().trim().min(1, 'Describe los hechos.'),
    measure: z.string().trim().optional(),
    citationAt: z.string().optional(),
  })
  .refine((v) => v.severity !== 'GRAVE' || !!v.citationAt, {
    path: ['citationAt'],
    message: 'La citación es obligatoria para incidencias graves.',
  });

type FormValues = z.infer<typeof schema>;

export interface RegisterIncidentDialogProps {
  open: boolean;
  onClose: () => void;
  /** Se llama con la incidencia creada para abrir su detalle y enviar el aviso. */
  onCreated: (incident: Incident) => void;
}

export function RegisterIncidentDialog({ open, onClose, onCreated }: RegisterIncidentDialogProps) {
  const { toast } = useToast();
  const createIncident = useCreateIncident();

  const [picked, setPicked] = useState<ConductStudentOption | null>(null);
  const [search, setSearch] = useState('');
  const [studentTouched, setStudentTouched] = useState(false);

  const { data: studentsData, isFetching } = useConductStudents(picked ? '' : search);
  const results = useMemo(() => studentsData?.students ?? [], [studentsData]);

  const { control, handleSubmit, watch, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      severity: 'LEVE',
      occurredAt: nowLocalInput(),
      summary: '',
      description: '',
      measure: '',
      citationAt: '',
    },
  });

  const severity = watch('severity');

  // Reinicia todo cada vez que se abre.
  useEffect(() => {
    if (open) {
      setPicked(null);
      setSearch('');
      setStudentTouched(false);
      reset({
        severity: 'LEVE',
        occurredAt: nowLocalInput(),
        summary: '',
        description: '',
        measure: '',
        citationAt: '',
      });
    }
  }, [open, reset]);

  const showResults = !picked && search.trim().length >= 2;

  const onSubmit = handleSubmit((values) => {
    setStudentTouched(true);
    if (!picked) return;
    createIncident.mutate(
      {
        enrollmentId: picked.enrollmentId,
        severity: values.severity,
        occurredAt: localInputToIso(values.occurredAt) ?? new Date().toISOString(),
        summary: values.summary.trim(),
        description: values.description.trim(),
        measure: values.measure?.trim() ? values.measure.trim() : undefined,
        citationAt:
          values.severity === 'GRAVE' ? localInputToIso(values.citationAt ?? '') : undefined,
      },
      {
        onSuccess: (created) => {
          if (values.severity === 'LEVE') {
            toast('success', 'Incidencia registrada', 'Registrada en el historial del estudiante.');
          } else {
            toast('warning', 'Incidencia registrada', 'Registrada — envía el aviso desde el detalle.');
          }
          onClose();
          onCreated(created);
        },
        onError: (err) =>
          toast(
            'danger',
            'No se pudo registrar',
            err instanceof ApiError ? err.message : 'Inténtalo de nuevo.',
          ),
      },
    );
  });

  const pending = createIncident.isPending;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      icon={<Icons.Clipboard />}
      title="Registrar incidencia"
      description="Queda en el historial de conducta del estudiante"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Check />} onClick={() => onSubmit()} disabled={pending}>
            Registrar
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
        {/* Buscador / estudiante elegido */}
        {picked ? (
          <div>
            <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)', marginBottom: 6 }}>
              Estudiante <span style={{ color: 'var(--danger)' }}>*</span>
            </div>
            <div className="esge-conduct-picked">
              <Avatar name={picked.fullName} size="sm" />
              <div className="esge-conduct-picked__stack">
                <span className="esge-conduct-picked__name">{picked.fullName}</span>
                <span className="esge-conduct-picked__meta">
                  {picked.studentCode} · {picked.sectionLabel}
                </span>
              </div>
              <IconButton label="Cambiar estudiante" size="sm" variant="ghost" onClick={() => setPicked(null)}>
                <Icons.Pencil />
              </IconButton>
            </div>
          </div>
        ) : (
          <div className="esge-conduct-search">
            <Input
              label="Estudiante"
              required
              iconLeft={<Icons.Search />}
              placeholder="Buscar por nombre o código…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              error={
                studentTouched && !picked ? 'Elige un estudiante de la lista.' : undefined
              }
              hint={
                studentTouched && !picked ? undefined : 'Escribe al menos 2 caracteres'
              }
            />
            {showResults && (
              <div className="esge-conduct-search__results">
                {results.length === 0 ? (
                  <div className="esge-conduct-search__empty">
                    {isFetching ? 'Buscando…' : 'Sin coincidencias.'}
                  </div>
                ) : (
                  results.map((s) => (
                    <button
                      key={s.enrollmentId}
                      type="button"
                      className="esge-conduct-search__item"
                      onClick={() => {
                        setPicked(s);
                        setSearch('');
                      }}
                    >
                      <Avatar name={s.fullName} size="sm" />
                      <div className="esge-conduct-cell__stack">
                        <span className="esge-conduct-cell__main">{s.fullName}</span>
                        <span
                          className="esge-conduct-cell__sub"
                          style={{ fontFamily: 'var(--font-mono)' }}
                        >
                          {s.studentCode} · {s.sectionLabel}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Datos de la incidencia */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Controller
            name="severity"
            control={control}
            render={({ field, fieldState }) => (
              <Select
                label="Gravedad"
                required
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                options={SEVERITY_ORDER.map((s) => ({ value: s, label: SEVERITY_LABELS[s] }))}
              />
            )}
          />
          <Controller
            name="occurredAt"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                label="Fecha y hora"
                type="datetime-local"
                required
                {...field}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="summary"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                label="Asunto"
                required
                placeholder="Ej. Agresión verbal a compañero"
                {...field}
                error={fieldState.error?.message}
                containerStyle={{ gridColumn: '1 / -1' }}
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <Textarea
                label="Descripción de los hechos"
                required
                rows={3}
                placeholder="Qué ocurrió, dónde, testigos…"
                {...field}
                error={fieldState.error?.message}
                containerStyle={{ gridColumn: '1 / -1' }}
              />
            )}
          />
          <Controller
            name="measure"
            control={control}
            render={({ field }) => (
              <Input
                label="Medida aplicada"
                placeholder="Ej. llamada de atención, compromiso…"
                {...field}
                containerStyle={{ gridColumn: '1 / -1' }}
              />
            )}
          />

          {severity === 'MODERADA' && (
            <Alert tone="info" title="Se avisará al apoderado" style={{ gridColumn: '1 / -1' }}>
              Al guardar tendrás el botón de WhatsApp con el aviso listo para enviar al contacto
              principal.
            </Alert>
          )}
          {severity === 'GRAVE' && (
            <>
              <Alert
                tone="warning"
                title="Aviso y citación al apoderado"
                style={{ gridColumn: '1 / -1' }}
              >
                Además del aviso por WhatsApp, se programa una citación presencial.
              </Alert>
              <Controller
                name="citationAt"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    label="Fecha de citación"
                    type="datetime-local"
                    required
                    {...field}
                    error={fieldState.error?.message}
                    containerStyle={{ gridColumn: '1 / -1' }}
                  />
                )}
              />
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
}
