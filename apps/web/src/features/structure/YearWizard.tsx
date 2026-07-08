// Asistente de apertura del año siguiente — 4 pasos; nada se aplica hasta el final.
import { useEffect, useState } from 'react';
import { Alert, Button, Checkbox, Dialog, Icons, Input, Select, useToast } from '@elohim/ui';
import { PERIOD_TYPES, type PeriodType } from '@elohim/shared';
import { ApiError } from '../../lib/api';
import { useStartNextYear } from './api';
import type { ApiYear } from './types';

const STEPS = ['Datos del año', 'Estructura', 'Promoción', 'Confirmar'];

// División del año: etiqueta con conteo, valor = enum PeriodType.
const DIVISION_LABEL: Record<PeriodType, string> = {
  BIMESTRE: '4 bimestres',
  TRIMESTRE: '3 trimestres',
  SEMESTRE: '2 semestres',
};

/** Reemplaza el año de una fecha ISO (YYYY-MM-DD) por `year`. */
function shiftYear(iso: string | null | undefined, year: number): string {
  if (!iso) return '';
  const [, m, d] = iso.slice(0, 10).split('-');
  if (!m || !d) return '';
  return `${year}-${m}-${d}`;
}

export interface YearWizardProps {
  open: boolean;
  onClose: () => void;
  currentYear: ApiYear;
  nextYearNumber: number;
  treeCounts: { levels: number; grades: number; sections: number };
}

export function YearWizard({ open, onClose, currentYear, nextYearNumber, treeCounts }: YearWizardProps) {
  const { toast } = useToast();
  const startNextYear = useStartNextYear(currentYear.id);

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [periodType, setPeriodType] = useState<PeriodType>('BIMESTRE');
  const [enrollmentStart, setEnrollmentStart] = useState('');
  const [copyStructure, setCopyStructure] = useState(true);
  const [copyPlan, setCopyPlan] = useState(true);
  const [copyTutors, setCopyTutors] = useState(false);
  const [copyPrograms, setCopyPrograms] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setName(String(nextYearNumber));
    setStartDate(shiftYear(currentYear.startDate, nextYearNumber));
    setEndDate(shiftYear(currentYear.endDate, nextYearNumber));
    setPeriodType(currentYear.periodType);
    setEnrollmentStart(shiftYear(currentYear.enrollmentStart, nextYearNumber));
    setCopyStructure(true);
    setCopyPlan(true);
    setCopyTutors(false);
    setCopyPrograms(true);
    setConfirmed(false);
    setFormError(null);
  }, [open, nextYearNumber, currentYear]);

  const submit = () => {
    setFormError(null);
    startNextYear.mutate(
      {
        name: name.trim(),
        startDate,
        endDate,
        periodType,
        enrollmentStart,
        copy: { structure: copyStructure, plan: copyPlan, tutors: copyTutors, programs: copyPrograms },
      },
      {
        onSuccess: (res) => {
          const c = res.counts;
          toast(
            'success',
            `Año académico ${res.name} iniciado`,
            `${c.levels} niveles, ${c.grades} grados, ${c.sections} secciones, ${c.courses} cursos y ${c.programs} programas copiados.`,
          );
          onClose();
        },
        onError: (err) => setFormError(err instanceof ApiError ? err.message : 'No se pudo iniciar el año. Inténtalo de nuevo.'),
      },
    );
  };

  const step1Valid = !!name.trim() && !!startDate && !!endDate && !!enrollmentStart;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={`Iniciar año académico ${nextYearNumber}`}
      description="Asistente de apertura — nada se aplica hasta el paso final."
      icon={<Icons.Calendar />}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={step === 0 ? onClose : () => setStep((s) => s - 1)}
            disabled={startNextYear.isPending}
          >
            {step === 0 ? 'Cancelar' : 'Atrás'}
          </Button>
          {step < 3 ? (
            <Button
              variant="primary"
              iconRight={<Icons.ArrowRight />}
              disabled={step === 0 && !step1Valid}
              onClick={() => setStep((s) => s + 1)}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              variant="accent"
              iconLeft={<Icons.Check />}
              disabled={!confirmed || startNextYear.isPending}
              onClick={submit}
            >
              Iniciar año {nextYearNumber}
            </Button>
          )}
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 4 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ height: 4, borderRadius: 99, background: i <= step ? 'var(--brand)' : 'var(--surface-sunken)' }} />
              <span
                style={{
                  font: 'var(--type-2xs)',
                  fontWeight: i === step ? 600 : 400,
                  color: i === step ? 'var(--brand)' : 'var(--text-muted)',
                }}
              >
                {i + 1}. {s}
              </span>
            </div>
          ))}
        </div>

        {step === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Input
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              containerStyle={{ gridColumn: '1 / -1' }}
            />
            <Input label="Inicio de clases" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input label="Fin de clases" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <Select
              label="División del año"
              options={PERIOD_TYPES.map((t) => ({ value: t, label: DIVISION_LABEL[t] }))}
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value as PeriodType)}
            />
            <Input
              label="Inicio de matrícula"
              type="date"
              value={enrollmentStart}
              onChange={(e) => setEnrollmentStart(e.target.value)}
            />
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Alert tone="info" icon={<Icons.Copy />}>
              Se copiará la estructura del año {currentYear.name}: {treeCounts.levels} niveles, {treeCounts.grades} grados
              y {treeCounts.sections} secciones.
            </Alert>
            <Checkbox
              label="Copiar niveles, grados y secciones"
              description="Con sus turnos y límites de vacantes"
              checked={copyStructure}
              onChange={(e) => setCopyStructure(e.target.checked)}
            />
            <Checkbox
              label="Copiar plan de estudios"
              description="Cursos y horas por grado"
              checked={copyPlan}
              onChange={(e) => setCopyPlan(e.target.checked)}
            />
            <Checkbox
              label="Copiar tutores y auxiliares asignados"
              description="Podrás reasignarlos después"
              checked={copyTutors}
              onChange={(e) => setCopyTutors(e.target.checked)}
            />
            <Checkbox
              label="Copiar programas complementarios"
              description="Talleres y reforzamientos con sus tarifas"
              checked={copyPrograms}
              onChange={(e) => setCopyPrograms(e.target.checked)}
            />
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Alert tone="info" title="Promoción de estudiantes">
              La promoción de estudiantes y las pre-matrículas estarán disponibles en la Etapa de matrícula (R2).
            </Alert>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {formError && (
              <Alert tone="danger" title="No se pudo iniciar el año">
                {formError}
              </Alert>
            )}
            <Alert tone="success" title="Todo listo">
              Se creará el <b>Año académico {name}</b> ({DIVISION_LABEL[periodType]}) con la estructura copiada de{' '}
              {currentYear.name}. El año {currentYear.name} pasará a estado <b>Cerrado</b> al finalizar sus periodos.
            </Alert>
            <Checkbox
              label="Entiendo que esta acción abre el nuevo año académico"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
          </div>
        )}
      </div>
    </Dialog>
  );
}
