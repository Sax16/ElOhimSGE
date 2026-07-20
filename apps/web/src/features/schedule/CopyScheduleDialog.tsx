// Diálogo "Copiar de otra sección": REEMPLAZA el horario de la sección actual
// con el de otra del mismo nivel+turno. Al copiar, muestra el resumen de los
// bloques omitidos y su motivo (recreo, curso ajeno al plan, choque de docente).
import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Dialog, Icons, Select, useToast } from '@elohim/ui';
import { ApiError } from '../../lib/api';
import { useCopySchedule } from './api';
import { dayLabelLong } from './bits';
import type { CopyScheduleResult, ScheduleSection } from './types';

export interface CopyScheduleDialogProps {
  open: boolean;
  toSection: ScheduleSection;
  /** Secciones origen candidatas (mismo nivel+turno, sin la sección actual). */
  candidates: { id: string; label: string }[];
  onClose: () => void;
}

export function CopyScheduleDialog({ open, toSection, candidates, onClose }: CopyScheduleDialogProps) {
  const { toast } = useToast();
  const copy = useCopySchedule();
  const [fromSectionId, setFromSectionId] = useState('');
  const [result, setResult] = useState<CopyScheduleResult | null>(null);

  useEffect(() => {
    if (!open) return;
    setFromSectionId('');
    setResult(null);
  }, [open]);

  const run = () => {
    if (!fromSectionId || copy.isPending) return;
    copy.mutate(
      { fromSectionId, toSectionId: toSection.id },
      {
        onSuccess: (res) => {
          setResult(res);
          toast(
            'success',
            'Horario copiado',
            `${res.copied} ${res.copied === 1 ? 'bloque copiado' : 'bloques copiados'}${
              res.skipped.length ? ` · ${res.skipped.length} omitidos` : ''
            }.`,
          );
        },
        onError: (err) =>
          toast('danger', 'No se pudo copiar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  const options = candidates.map((c) => ({ value: c.id, label: c.label }));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      icon={<Icons.Copy />}
      title="Copiar de otra sección"
      description={`Destino: ${toSection.label}`}
      footer={
        result ? (
          <Button variant="primary" onClick={onClose}>
            Entendido
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose} disabled={copy.isPending}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              iconLeft={<Icons.Copy />}
              disabled={copy.isPending || !fromSectionId}
              onClick={run}
            >
              Copiar horario
            </Button>
          </>
        )
      }
    >
      {result ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
          <div style={{ font: 'var(--type-body)', color: 'var(--text-body)' }}>
            Se copiaron <strong>{result.copied}</strong>{' '}
            {result.copied === 1 ? 'bloque' : 'bloques'} al horario de {toSection.label}.
          </div>
          {result.skipped.length > 0 ? (
            <>
              <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>
                Bloques omitidos ({result.skipped.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.skipped.map((s, i) => (
                  <div
                    key={`${s.dayOfWeek}-${s.blockLabel}-${i}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexWrap: 'wrap',
                      padding: '8px 10px',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <Badge tone="neutral">
                      {dayLabelLong(s.dayOfWeek)} · {s.blockLabel}
                    </Badge>
                    <span style={{ font: 'var(--type-caption)', color: 'var(--text-body)' }}>
                      {s.courseName}
                    </span>
                    <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                      {s.reason}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <Alert tone="success">Se copió el horario completo sin omitir bloques.</Alert>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
          <Select
            label="Sección origen"
            placeholder={options.length ? 'Selecciona una sección' : 'No hay otra sección del mismo nivel y turno'}
            required
            disabled={!options.length}
            options={options}
            value={fromSectionId}
            onChange={(e) => setFromSectionId(e.target.value)}
            hint="Solo secciones del mismo nivel y turno."
          />
          <Alert tone="warning">
            Reemplaza el horario actual de esta sección. Los bloques que no encajen (recreo, curso
            ajeno al plan o choque de docente) se omiten y verás el detalle.
          </Alert>
        </div>
      )}
    </Dialog>
  );
}
