// Asistente de matrícula en 5 pasos (Etapa 5). Pantalla completa, no diálogo.
// Termina generando el cronograma de pagos. Spec: EnrollmentScreen.jsx.
import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Dialog,
  IconButton,
  Icons,
  Input,
  ProgressBar,
  Radio,
  RadioGroup,
  Select,
  Table,
  Tooltip,
  useToast,
} from '@elohim/ui';
import type { TableColumn } from '@elohim/ui';
import {
  INSURANCE_TYPES,
  INSURANCE_TYPE_LABELS,
  SEX_LABELS,
  SHIFT_LABELS,
  formatPEN,
  toCents,
  type EnrollmentType,
  type InsuranceType,
  type Sex,
} from '@elohim/shared';
import { ApiError } from '../../lib/api';
import { useFees } from '../fees/api';
import { useLevelsTree, usePrograms } from '../structure/api';
import { vigenciaState, vigenciaText } from '../structure/bits';
import type { ApiSection } from '../structure/types';
import { useStudents, useStudent, useUnlinkGuardian } from '../students/api';
import { avatarColor, fullName } from '../students/bits';
import type { StudentGuardianLink } from '../students/types';
import { GuardianFormDialog } from '../guardians/GuardianFormDialog';
import { LinkGuardianDialog } from '../students/LinkGuardianDialog';
import { useGuardianSearch } from '../guardians/api';
import { useCreateEnrollment, usePreview } from './api';
import { shortDate } from './bits';
import type {
  CreateEnrollmentResult,
  EnrollmentWizardBody,
  NewStudentInput,
  PreviewResponse,
  TransferInput,
} from './types';

const STEPS = ['Estudiante', 'Apoderados', 'Ubicación', 'Tarifa y cronograma', 'Confirmación'];
type Mode = 'nuevo' | 'exist' | 'traslado';
const MODE_TO_TYPE: Record<Mode, EnrollmentType> = { nuevo: 'NUEVA', exist: 'RATIFICADA', traslado: 'TRASLADO' };

interface WizardState {
  mode: Mode;
  studentId: string | null;
  newStudent: NewStudentInput;
  transfer: TransferInput;
  signingGuardianId: string | null;
  levelId: string;
  gradeLevelId: string;
  sectionId: string;
  programIds: string[];
  discountId: string;
}

const emptyNewStudent = (): NewStudentInput => ({
  firstNames: '',
  lastNames: '',
  dni: '',
  birthDate: '',
  sex: 'M',
  address: '',
  previousSchool: '',
  insuranceType: 'SIS',
});
const emptyTransfer = (): TransferInput => ({ originSchool: '', siagieCode: '', entryDate: '' });

const initialState = (): WizardState => ({
  mode: 'exist',
  studentId: null,
  newStudent: emptyNewStudent(),
  transfer: emptyTransfer(),
  signingGuardianId: null,
  levelId: '',
  gradeLevelId: '',
  sectionId: '',
  programIds: [],
  discountId: '',
});

function buildBody(s: WizardState, yearId: string | undefined): EnrollmentWizardBody {
  const base: EnrollmentWizardBody = {
    academicYearId: yearId ?? '',
    sectionId: s.sectionId,
    type: MODE_TO_TYPE[s.mode],
    signingGuardianId: s.signingGuardianId ?? '',
    discountId: s.discountId || undefined,
    programIds: s.programIds,
  };
  if (s.mode === 'exist') return { ...base, studentId: s.studentId ?? undefined };
  const newStudent: NewStudentInput = {
    ...s.newStudent,
    firstNames: s.newStudent.firstNames.trim(),
    lastNames: s.newStudent.lastNames.trim(),
    dni: s.newStudent.dni.trim(),
    address: s.newStudent.address.trim(),
    previousSchool: s.newStudent.previousSchool?.trim() || undefined,
  };
  if (s.mode === 'traslado') return { ...base, newStudent, transfer: { ...s.transfer } };
  return { ...base, newStudent };
}

function studentStepValid(s: WizardState): boolean {
  if (s.mode === 'exist') return !!s.studentId;
  const n = s.newStudent;
  const coreOk =
    !!n.firstNames.trim() && !!n.lastNames.trim() && /^\d{8}$/.test(n.dni.trim()) && !!n.birthDate && !!n.address.trim();
  if (s.mode === 'nuevo') return coreOk;
  return (
    coreOk &&
    !!s.transfer.originSchool.trim() &&
    /^\d{14}$/.test(s.transfer.siagieCode.trim()) &&
    !!s.transfer.entryDate
  );
}

export function EnrollmentWizard({
  yearId,
  yearName,
  onExit,
}: {
  yearId: string | undefined;
  yearName: string;
  onExit: () => void;
}) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(initialState);
  const [declared, setDeclared] = useState(false);
  const [result, setResult] = useState<CreateEnrollmentResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fees = useFees(yearId).data;
  const createEnrollment = useCreateEnrollment();
  const set = (patch: Partial<WizardState>) => setState((s) => ({ ...s, ...patch }));

  const stepValid: boolean[] = [
    studentStepValid(state),
    !!state.signingGuardianId,
    !!state.sectionId,
    true,
    declared,
  ];

  if (result) {
    return (
      <SuccessScreen
        result={result}
        onExit={onExit}
        onAgain={() => {
          setResult(null);
          setState(initialState());
          setDeclared(false);
          setStep(0);
        }}
      />
    );
  }

  const confirm = () => {
    if (!declared) return;
    setErrorMsg('');
    createEnrollment.mutate(buildBody(state, yearId), {
      onSuccess: (res) => {
        setResult(res);
        toast('success', 'Matrícula registrada', `${res.enrollment.code} · cronograma generado.`);
      },
      onError: (err) => {
        const msg = err instanceof ApiError ? err.message : 'No se pudo registrar la matrícula.';
        setErrorMsg(msg);
        toast('danger', 'No se pudo matricular', msg);
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Button variant="ghost" size="sm" onClick={onExit}>
          ← Volver al listado
        </Button>
        <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
          Nueva matrícula · Año académico {yearName}
        </span>
      </div>

      <Card flush>
        <Stepper step={step} />
        <div style={{ padding: 22 }}>
          {step === 0 && <StepStudent state={state} set={set} />}
          {step === 1 && <StepGuardians state={state} set={set} />}
          {step === 2 && <StepPlacement state={state} set={set} yearId={yearId} />}
          {step === 3 && (
            <StepFees
              state={state}
              set={set}
              yearId={yearId}
              transferCutoffDay={fees?.settings.transferCutoffDay}
            />
          )}
          {step === 4 && (
            <StepConfirm
              state={state}
              yearName={yearName}
              errorMsg={errorMsg}
              declared={declared}
              onDeclare={setDeclared}
            />
          )}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '14px 22px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--surface-sunken)',
          }}
        >
          <Button variant="secondary" onClick={step === 0 ? onExit : () => setStep((v) => v - 1)}>
            {step === 0 ? 'Cancelar' : 'Atrás'}
          </Button>
          {step < 4 ? (
            <Button
              variant="primary"
              iconRight={<Icons.ArrowRight />}
              disabled={!stepValid[step]}
              onClick={() => setStep((v) => v + 1)}
            >
              Continuar
            </Button>
          ) : (
            <Button
              variant="primary"
              iconLeft={<Icons.Check />}
              disabled={!declared || createEnrollment.isPending}
              onClick={confirm}
            >
              Confirmar matrícula
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

// ============================== Stepper =====================================
function Stepper({ step }: { step: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        padding: '18px 22px',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {STEPS.map((s, i) => (
        <Fragment key={s}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 99,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 13,
                background: i < step ? 'var(--success)' : i === step ? 'var(--brand)' : 'var(--surface-sunken)',
                color: i <= step ? '#fff' : 'var(--text-muted)',
                border: i === step ? 'none' : '1px solid var(--border-subtle)',
              }}
            >
              {i < step ? <Icons.Check /> : i + 1}
            </span>
            <span
              style={{
                font: 'var(--type-label)',
                fontWeight: i === step ? 600 : 400,
                color: i === step ? 'var(--text-strong)' : 'var(--text-muted)',
                whiteSpace: 'nowrap',
              }}
            >
              {s}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <span
              style={{
                flex: 1,
                height: 1,
                background: i < step ? 'var(--success)' : 'var(--border-subtle)',
                margin: '0 14px',
                minWidth: 18,
              }}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}

// ============================== Paso 1 · Estudiante =========================
function StepStudent({ state, set }: { state: WizardState; set: (p: Partial<WizardState>) => void }) {
  const setNew = (p: Partial<NewStudentInput>) => set({ newStudent: { ...state.newStudent, ...p } });
  const setTransfer = (p: Partial<TransferInput>) => set({ transfer: { ...state.transfer, ...p } });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <RadioGroup
        name="tipo-estudiante"
        value={state.mode}
        onChange={(e) => set({ mode: e.target.value as Mode, studentId: null, signingGuardianId: null })}
        row
      >
        <Radio value="nuevo" label="Estudiante nuevo" description="Primera vez en la institución" />
        <Radio value="exist" label="Estudiante existente" description="Ratificación o pre-matrícula" />
        <Radio value="traslado" label="Traslado entrante" description="Viene de otro colegio a mitad de año" />
      </RadioGroup>

      {state.mode === 'exist' ? (
        <ExistingStudentPicker state={state} set={set} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {state.mode === 'traslado' && (
            <Alert tone="info" title="Primero el SIAGIE">
              El traslado se aprueba primero en el SIAGIE. Aquí lo registras para el control interno: pensiones solo
              por los meses restantes y notas de origen del colegio anterior.
            </Alert>
          )}
          <NewStudentFields value={state.newStudent} onChange={setNew} />
          {state.mode === 'traslado' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 14,
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: 14,
              }}
            >
              <Input
                label="Colegio de origen"
                required
                value={state.transfer.originSchool}
                onChange={(e) => setTransfer({ originSchool: e.target.value })}
                placeholder="I.E. 30001 Satipo"
              />
              <Input
                label="Código de estudiante SIAGIE"
                required
                value={state.transfer.siagieCode}
                onChange={(e) => setTransfer({ siagieCode: e.target.value.replace(/\D/g, '').slice(0, 14) })}
                hint="14 dígitos"
                style={{ fontFamily: 'var(--font-mono)' }}
                inputMode="numeric"
                placeholder="00000000000000"
              />
              <Input
                label="Fecha de ingreso"
                type="date"
                required
                value={state.transfer.entryDate}
                onChange={(e) => setTransfer({ entryDate: e.target.value })}
                hint="Define desde cuándo se cobran pensiones"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NewStudentFields({
  value,
  onChange,
}: {
  value: NewStudentInput;
  onChange: (p: Partial<NewStudentInput>) => void;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
      <Input
        label="Apellidos"
        required
        value={value.lastNames}
        onChange={(e) => onChange({ lastNames: e.target.value })}
        placeholder="Núñez Ríos"
      />
      <Input
        label="Nombres"
        required
        value={value.firstNames}
        onChange={(e) => onChange({ firstNames: e.target.value })}
        placeholder="Carla"
      />
      <Input
        label="DNI"
        required
        value={value.dni}
        onChange={(e) => onChange({ dni: e.target.value.replace(/\D/g, '').slice(0, 8) })}
        hint="8 dígitos"
        style={{ fontFamily: 'var(--font-mono)' }}
        inputMode="numeric"
        placeholder="00000000"
      />
      <Input
        label="Fecha de nacimiento"
        type="date"
        required
        value={value.birthDate}
        onChange={(e) => onChange({ birthDate: e.target.value })}
      />
      <Select
        label="Sexo"
        options={(['M', 'F'] as Sex[]).map((s) => ({ value: s, label: SEX_LABELS[s] }))}
        value={value.sex}
        onChange={(e) => onChange({ sex: e.target.value as Sex })}
      />
      <Select
        label="Seguro"
        options={INSURANCE_TYPES.map((t) => ({ value: t, label: INSURANCE_TYPE_LABELS[t] }))}
        value={value.insuranceType}
        onChange={(e) => onChange({ insuranceType: e.target.value as InsuranceType })}
      />
      <Input
        label="Dirección"
        required
        value={value.address}
        onChange={(e) => onChange({ address: e.target.value })}
        placeholder="Jr. Los Cedros 245, Satipo"
        containerStyle={{ gridColumn: 'span 2' }}
      />
      <Input
        label="Colegio de procedencia"
        value={value.previousSchool ?? ''}
        onChange={(e) => onChange({ previousSchool: e.target.value })}
        hint="Opcional"
        placeholder="Ej. I.E. 30001 Satipo"
      />
    </div>
  );
}

function ExistingStudentPicker({
  state,
  set,
}: {
  state: WizardState;
  set: (p: Partial<WizardState>) => void;
}) {
  const [term, setTerm] = useState('');
  const { data, isFetching } = useStudents({
    search: term,
    levelId: '',
    gradeLevelId: '',
    sectionId: '',
    status: '',
    page: 1,
    pageSize: 10,
  });
  const items = data?.items ?? [];
  const selected = items.find((i) => i.id === state.studentId) ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Input
        placeholder="Buscar por nombre, código o DNI…"
        iconLeft={<Icons.Search />}
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          set({ studentId: null, signingGuardianId: null });
        }}
      />
      {selected ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '14px 16px',
            border: '1.5px solid var(--border-brand)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--surface-brand-soft)',
          }}
        >
          <Avatar name={fullName(selected)} color={avatarColor(selected.code)} />
          <div style={{ flex: 1 }}>
            <div style={{ font: 'var(--type-label)', fontWeight: 600, color: 'var(--text-strong)' }}>
              {fullName(selected)}
            </div>
            <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
              {selected.code} · DNI {selected.dni}
            </div>
          </div>
          <Badge tone="brand" dot>
            Seleccionado
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => set({ studentId: null, signingGuardianId: null })}>
            Cambiar
          </Button>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            maxHeight: 260,
            overflowY: 'auto',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 6,
          }}
        >
          {term.trim().length < 2 ? (
            <div style={{ padding: 12, color: 'var(--text-muted)', font: 'var(--type-caption)' }}>
              Escribe al menos 2 caracteres para buscar al estudiante a ratificar.
            </div>
          ) : isFetching ? (
            <div style={{ padding: 12, color: 'var(--text-muted)', font: 'var(--type-caption)' }}>Buscando…</div>
          ) : items.length === 0 ? (
            <div style={{ padding: 12, color: 'var(--text-muted)', font: 'var(--type-caption)' }}>
              Sin resultados. Si es su primera vez, usa «Estudiante nuevo».
            </div>
          ) : (
            items.map((r) => {
              const enrolled = !!r.placement; // ya tiene matrícula activa
              return (
                <button
                  key={r.id}
                  type="button"
                  disabled={enrolled}
                  title={enrolled ? 'Este estudiante ya tiene una matrícula activa' : undefined}
                  onClick={() => set({ studentId: r.id, signingGuardianId: null })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    textAlign: 'left',
                    background: 'transparent',
                    border: '1px solid transparent',
                    borderRadius: 'var(--radius-md)',
                    cursor: enrolled ? 'not-allowed' : 'pointer',
                    opacity: enrolled ? 0.55 : 1,
                  }}
                >
                  <Avatar name={fullName(r)} size="sm" color={avatarColor(r.code)} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{fullName(r)}</div>
                    <div
                      style={{ font: 'var(--type-2xs)', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
                    >
                      {r.code} · DNI {r.dni}
                    </div>
                  </div>
                  {enrolled && <Badge tone="neutral">Ya matriculado</Badge>}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ============================== Paso 2 · Apoderados =========================
function StepGuardians({ state, set }: { state: WizardState; set: (p: Partial<WizardState>) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Alert tone="info">
        Un estudiante puede tener varios apoderados, y un apoderado varios hijos matriculados. El{' '}
        <b>firmante</b> recibe las notificaciones de pago.
      </Alert>
      {state.mode === 'exist' && state.studentId ? (
        <ExistingGuardians state={state} set={set} />
      ) : (
        <NewStudentGuardian state={state} set={set} />
      )}
    </div>
  );
}

const MAX_GUARDIANS = 3;

function ExistingGuardians({ state, set }: { state: WizardState; set: (p: Partial<WizardState>) => void }) {
  const { toast } = useToast();
  const { data: student } = useStudent(state.studentId ?? undefined);
  const unlink = useUnlinkGuardian();
  const [linkOpen, setLinkOpen] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState<StudentGuardianLink | null>(null);
  const guardians = student?.guardians ?? [];

  // Mantiene un firmante válido: propone al contacto principal al cargar y
  // re-selecciona automáticamente si el firmante actual fue quitado.
  const guardiansKey = guardians.map((g) => `${g.guardian.id}:${g.isPrimary ? 1 : 0}`).join(',');
  useEffect(() => {
    if (guardians.length === 0) {
      if (state.signingGuardianId) set({ signingGuardianId: null });
      return;
    }
    const stillPresent = guardians.some((g) => g.guardian.id === state.signingGuardianId);
    if (!state.signingGuardianId || !stillPresent) {
      const primary = guardians.find((g) => g.isPrimary) ?? guardians[0];
      if (primary) set({ signingGuardianId: primary.guardian.id });
    }
  }, [guardiansKey]);

  const confirmUnlink = () => {
    if (!student || !unlinkTarget) return;
    const target = unlinkTarget;
    unlink.mutate(
      { studentId: student.id, guardianId: target.guardian.id },
      {
        onSuccess: () => {
          // Si el quitado era el firmante, deja que el efecto re-seleccione al nuevo principal.
          if (state.signingGuardianId === target.guardian.id) set({ signingGuardianId: null });
          toast('success', 'Apoderado desvinculado', `${target.guardian.fullName} ya no figura como apoderado.`);
          setUnlinkTarget(null);
        },
        onError: (err) =>
          toast('danger', 'No se pudo desvincular', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  const atMax = guardians.length >= MAX_GUARDIANS;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {guardians.length === 0 ? (
        <Alert tone="warning" title="Vincula al menos un apoderado">
          Este estudiante no tiene apoderados vinculados. Vincula al menos uno para elegir al firmante y continuar.
        </Alert>
      ) : (
        <RadioGroup
          name="firmante"
          value={state.signingGuardianId ?? ''}
          onChange={(e) => set({ signingGuardianId: e.target.value })}
        >
          {guardians.map((g) => (
            <label
              key={g.guardian.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 16px',
                border: `1px solid ${
                  state.signingGuardianId === g.guardian.id ? 'var(--border-brand)' : 'var(--border-default)'
                }`,
                borderRadius: 'var(--radius-lg)',
                background:
                  state.signingGuardianId === g.guardian.id ? 'var(--surface-brand-soft)' : 'var(--surface-card)',
                cursor: 'pointer',
              }}
            >
              <Radio name="firmante" value={g.guardian.id} checked={state.signingGuardianId === g.guardian.id} readOnly />
              <Avatar name={g.guardian.fullName} color={avatarColor(g.guardian.code)} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ font: 'var(--type-label)', fontWeight: 600, color: 'var(--text-strong)' }}>
                    {g.guardian.fullName}
                  </span>
                  {g.isPrimary && (
                    <Badge tone="accent" size="sm">
                      Contacto principal
                    </Badge>
                  )}
                </div>
                <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
                  DNI {g.guardian.dni} · {g.guardian.phone}
                </div>
              </div>
              {state.signingGuardianId === g.guardian.id && (
                <Badge tone="brand" dot>
                  Firmante
                </Badge>
              )}
              <Tooltip content="Quitar apoderado">
                <IconButton
                  label="Quitar apoderado"
                  size="sm"
                  variant="danger"
                  onClick={(e) => {
                    e.preventDefault();
                    setUnlinkTarget(g);
                  }}
                >
                  <Icons.Trash />
                </IconButton>
              </Tooltip>
            </label>
          ))}
        </RadioGroup>
      )}
      {atMax ? (
        <Tooltip content={`Máximo ${MAX_GUARDIANS} apoderados`}>
          <span style={{ alignSelf: 'flex-start' }}>
            <Button variant="ghost" iconLeft={<Icons.Plus />} disabled>
              Vincular otro apoderado
            </Button>
          </span>
        </Tooltip>
      ) : (
        <Button
          variant="ghost"
          iconLeft={<Icons.Plus />}
          style={{ alignSelf: 'flex-start' }}
          onClick={() => setLinkOpen(true)}
        >
          Vincular otro apoderado
        </Button>
      )}
      {linkOpen && (
        <LinkGuardianDialog studentId={state.studentId} onClose={() => setLinkOpen(false)} />
      )}

      <Dialog
        open={!!unlinkTarget}
        onClose={() => setUnlinkTarget(null)}
        icon={<Icons.Trash />}
        iconTone="danger"
        title="Quitar apoderado"
        description={unlinkTarget ? unlinkTarget.guardian.fullName : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setUnlinkTarget(null)} disabled={unlink.isPending}>
              Cancelar
            </Button>
            <Button variant="danger" iconLeft={<Icons.Check />} disabled={unlink.isPending} onClick={confirmUnlink}>
              Quitar apoderado
            </Button>
          </>
        }
      >
        <div style={{ paddingTop: 4 }}>
          {unlinkTarget?.isPrimary && guardians.length > 1 ? (
            <Alert tone="warning" title="Es el contacto principal">
              Al quitarlo, otro apoderado vinculado pasará a ser el contacto principal automáticamente.
            </Alert>
          ) : (
            <p style={{ font: 'var(--type-body)', color: 'var(--text-body)', margin: 0 }}>
              Se quitará el vínculo con este apoderado. El apoderado no se elimina y puede volver a vincularse.
            </p>
          )}
        </div>
      </Dialog>
    </div>
  );
}

function NewStudentGuardian({ state, set }: { state: WizardState; set: (p: Partial<WizardState>) => void }) {
  const [term, setTerm] = useState('');
  const [newForm, setNewForm] = useState(false);
  const { data, isFetching } = useGuardianSearch(term);
  const results = data?.items ?? [];
  const selected = results.find((r) => r.id === state.signingGuardianId) ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
        Elige al apoderado firmante y contacto principal. Búscalo si ya existe o regístralo.
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'end' }}>
        <Input
          label="Buscar apoderado existente"
          iconLeft={<Icons.Search />}
          placeholder="Nombre, DNI o teléfono…"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            set({ signingGuardianId: null });
          }}
        />
        <Button variant="secondary" iconLeft={<Icons.Plus />} onClick={() => setNewForm(true)}>
          Registrar apoderado nuevo
        </Button>
      </div>

      {selected ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '13px 16px',
            border: '1.5px solid var(--border-brand)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--surface-brand-soft)',
          }}
        >
          <Avatar name={selected.fullName} color={avatarColor(selected.code)} />
          <div style={{ flex: 1 }}>
            <div style={{ font: 'var(--type-label)', fontWeight: 600, color: 'var(--text-strong)' }}>
              {selected.fullName}
            </div>
            <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
              DNI {selected.dni} · {selected.phone}
            </div>
          </div>
          <Badge tone="brand" dot>
            Firmante
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => set({ signingGuardianId: null })}>
            Cambiar
          </Button>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            maxHeight: 220,
            overflowY: 'auto',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 6,
          }}
        >
          {term.trim().length < 2 ? (
            <div style={{ padding: 12, color: 'var(--text-muted)', font: 'var(--type-caption)' }}>
              Escribe al menos 2 caracteres, o registra un apoderado nuevo.
            </div>
          ) : isFetching ? (
            <div style={{ padding: 12, color: 'var(--text-muted)', font: 'var(--type-caption)' }}>Buscando…</div>
          ) : results.length === 0 ? (
            <div style={{ padding: 12, color: 'var(--text-muted)', font: 'var(--type-caption)' }}>
              Sin resultados. Puedes registrar un apoderado nuevo.
            </div>
          ) : (
            results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => set({ signingGuardianId: r.id })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  textAlign: 'left',
                  background: 'transparent',
                  border: '1px solid transparent',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                }}
              >
                <Avatar name={r.fullName} size="sm" color={avatarColor(r.code)} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{r.fullName}</div>
                  <div style={{ font: 'var(--type-2xs)', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {r.code} · DNI {r.dni}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      <GuardianFormDialog
        open={newForm}
        onClose={() => setNewForm(false)}
        onCreated={(created) => {
          setNewForm(false);
          set({ signingGuardianId: created.id });
        }}
      />
    </div>
  );
}

// ============================== Paso 3 · Ubicación ==========================
function StepPlacement({
  state,
  set,
  yearId,
}: {
  state: WizardState;
  set: (p: Partial<WizardState>) => void;
  yearId: string | undefined;
}) {
  const levels = useLevelsTree(yearId).data ?? [];
  const programs = usePrograms(yearId).data ?? [];
  // Solo programas activos y aún vigentes: se ocultan los cerrados y los ya finalizados.
  const activePrograms = programs.filter(
    (p) => p.status === 'ACTIVO' && vigenciaState(p.startMonth, p.endMonth) !== 'finalizado',
  );

  const grades = levels.find((l) => l.id === state.levelId)?.grades ?? [];
  const sections = grades.find((g) => g.id === state.gradeLevelId)?.sections ?? [];

  const toggleProgram = (id: string) =>
    set({
      programIds: state.programIds.includes(id)
        ? state.programIds.filter((p) => p !== id)
        : [...state.programIds, id],
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Select
          label="Nivel"
          placeholder="Selecciona el nivel"
          options={levels.map((l) => ({ value: l.id, label: l.name }))}
          value={state.levelId}
          onChange={(e) => set({ levelId: e.target.value, gradeLevelId: '', sectionId: '' })}
        />
        <Select
          label="Grado"
          placeholder="Selecciona el grado"
          options={grades.map((g) => ({ value: g.id, label: g.name }))}
          value={state.gradeLevelId}
          onChange={(e) => set({ gradeLevelId: e.target.value, sectionId: '' })}
          disabled={!state.levelId}
        />
      </div>

      <div>
        <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)', marginBottom: 8 }}>
          Sección <span style={{ color: 'var(--danger)' }}>*</span>
        </div>
        {!state.gradeLevelId ? (
          <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
            Elige nivel y grado para ver las secciones disponibles.
          </div>
        ) : sections.length === 0 ? (
          <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
            Este grado no tiene secciones. Créalas en Estructura académica.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {sections.map((s) => (
              <SectionCard
                key={s.id}
                section={s}
                selected={state.sectionId === s.id}
                onSelect={() => set({ sectionId: s.id })}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)', marginBottom: 8 }}>
          Programas complementarios{' '}
          <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', fontWeight: 400 }}>
            (opcional, con tarifa propia)
          </span>
        </div>
        {activePrograms.length === 0 ? (
          <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
            No hay programas activos este año.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activePrograms.map((p) => {
              const free = Math.max(0, p.capacity - p.enrolled);
              const vig = vigenciaText(p.startMonth, p.endMonth);
              const vigPrefix = vig !== '—' ? `${vig} · ` : '';
              return (
                <Checkbox
                  key={p.id}
                  label={`${p.name} — ${vigPrefix}${formatPEN(toCents(p.monthlyFee))}/mes`}
                  description={`${p.scheduleText || 'Horario por confirmar'} · ${free} vacantes`}
                  checked={state.programIds.includes(p.id)}
                  disabled={free === 0 && !state.programIds.includes(p.id)}
                  onChange={() => toggleProgram(p.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionCard({
  section,
  selected,
  onSelect,
}: {
  section: ApiSection;
  selected: boolean;
  onSelect: () => void;
}) {
  const full = section.enrolled >= section.capacity;
  const free = section.capacity - section.enrolled;
  return (
    <div
      onClick={() => !full && onSelect()}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '14px 16px',
        borderRadius: 'var(--radius-lg)',
        cursor: full ? 'not-allowed' : 'pointer',
        border: selected ? '1.5px solid var(--border-brand)' : '1px solid var(--border-default)',
        background: selected ? 'var(--surface-brand-soft)' : 'var(--surface-card)',
        opacity: full ? 0.55 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ font: 'var(--type-h3)', color: 'var(--text-strong)' }}>Sección {section.name}</span>
        <Badge tone="info">{SHIFT_LABELS[section.shift]}</Badge>
        <span style={{ flex: 1 }} />
        {full ? (
          <Badge tone="danger" dot>
            Llena
          </Badge>
        ) : selected ? (
          <Badge tone="brand" dot>
            Seleccionada
          </Badge>
        ) : (
          <Badge tone="success" dot>
            {free} vacantes
          </Badge>
        )}
      </div>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 8, font: 'var(--type-caption)', color: 'var(--text-muted)' }}
      >
        <Avatar name={section.tutor?.fullName ?? 'Sin tutor'} size="xs" /> Tutor:{' '}
        {section.tutor?.fullName ?? 'Sin asignar'}
      </div>
      <ProgressBar
        value={section.enrolled}
        max={Math.max(section.capacity, 1)}
        size="sm"
        tone={full ? 'danger' : 'brand'}
        showValue
        valueFormat={(v, m) => `${v}/${m}`}
      />
    </div>
  );
}

// ============================== Paso 4 · Tarifa y cronograma ================
function StepFees({
  state,
  set,
  yearId,
  transferCutoffDay,
}: {
  state: WizardState;
  set: (p: Partial<WizardState>) => void;
  yearId: string | undefined;
  transferCutoffDay?: number;
}) {
  const preview = usePreview();
  const fees = useFees(yearId).data;
  const activeDiscounts = (fees?.discounts ?? []).filter((d) => d.status === 'ACTIVO');

  const body = useMemo(() => buildBody(state, yearId), [state, yearId]);
  const bodyKey = JSON.stringify({
    sectionId: body.sectionId,
    studentId: body.studentId,
    newStudent: body.newStudent,
    discountId: body.discountId,
    programIds: body.programIds,
    transfer: body.transfer,
  });

  // Recalcula el cronograma al entrar y cuando cambian descuento/programas.
  useEffect(() => {
    if (!body.sectionId) return;
    preview.mutate(body);
  }, [bodyKey]);

  const data: PreviewResponse | undefined = preview.data;
  const autoDiscount = data?.discount?.auto ? data.discount : null;

  // Si la API propone un descuento automático y aún no hay elegido, lo refleja.
  useEffect(() => {
    if (autoDiscount && !state.discountId) set({ discountId: autoDiscount.id });
  }, [autoDiscount?.id]);

  const cols: TableColumn<PreviewResponse['items'][number]>[] = [
    { key: 'concept', header: 'Concepto' },
    { key: 'dueDate', header: 'Vence', mono: true, align: 'center', width: 120, render: (v) => shortDate(v as string) },
    { key: 'amount', header: 'Monto', num: true, mono: true, render: (v) => formatPEN(toCents(v as string)) },
  ];

  const pensiones = data ? data.items.filter((i) => i.type === 'PENSION').length : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 18, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {state.mode === 'traslado' && (
          <Alert tone="warning" title="Cronograma de traslado">
            Solo se generan las pensiones de los meses restantes del año. El mes de ingreso se cobra completo si el
            estudiante entra antes del día de corte (día {transferCutoffDay ?? 20} — configurable en Tarifario y becas);
            si entra después, ese mes es gratis. La matrícula se cobra completa.
          </Alert>
        )}

        <Select
          label="Descuento o beca"
          options={[
            { value: '', label: 'Ninguno' },
            ...activeDiscounts.map((d) => ({ value: d.id, label: `${d.name} · −${Number(d.percent)}% pensión` })),
          ]}
          value={state.discountId}
          onChange={(e) => set({ discountId: e.target.value })}
        />
        {data?.discount && (
          <Alert
            tone="success"
            title={data.discount.auto ? `${data.discount.name} (automático)` : data.discount.name}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {data.discount.auto && (
                <Badge tone="brand" size="sm">
                  Automático
                </Badge>
              )}
              <span>
                −{Number(data.discount.percent)}% se aplica a las {pensiones} pensiones, no a la matrícula ni a los
                programas.
              </span>
            </div>
          </Alert>
        )}

        {(data?.warnings ?? []).map((w) => (
          <Alert key={w} tone="info">
            {w}
          </Alert>
        ))}

        <div
          style={{
            background: 'var(--surface-inverse)',
            color: 'var(--text-inverse)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ font: 'var(--type-label)' }}>Total anual</span>
          <span style={{ font: 'var(--type-h2)', fontFamily: 'var(--font-mono)' }}>
            {data ? formatPEN(data.totalCents) : '—'}
          </span>
        </div>
      </div>

      <Card
        flush
        title="Cronograma de pagos"
        subtitle={
          preview.isPending
            ? 'Calculando…'
            : data
              ? `Se genera automáticamente — 1 matrícula + ${pensiones} pensiones`
              : 'Selecciona una sección para calcular el cronograma'
        }
      >
        <Table
          columns={cols}
          data={data?.items ?? []}
          rowKey={(_r, i) => i}
          compact
          emptyText={preview.isPending ? 'Calculando cronograma…' : 'Sin cronograma.'}
        />
      </Card>

      {(data?.programSchedules ?? []).map((ps) => (
        <Card
          key={ps.programId}
          flush
          title={`Programa · ${ps.name}`}
          subtitle="Cronograma independiente, con su propia tarifa"
          style={{ gridColumn: '1 / -1' }}
        >
          <Table
            columns={[
              { key: 'concept', header: 'Concepto' },
              {
                key: 'dueDate',
                header: 'Vence',
                mono: true,
                align: 'center',
                width: 120,
                render: (v) => shortDate(v as string),
              },
              {
                key: 'totalCents',
                header: 'Monto',
                num: true,
                mono: true,
                render: (v) => formatPEN(v as number),
              },
            ]}
            data={ps.items}
            rowKey={(_r, i) => i}
            compact
            emptyText="Sin cuotas."
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderTop: '1px solid var(--border-subtle)',
              font: 'var(--type-label)',
              color: 'var(--text-strong)',
            }}
          >
            <span>Subtotal del programa</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{formatPEN(ps.totalCents)}</span>
          </div>
        </Card>
      ))}

      {preview.isError && (
        <Alert tone="danger" title="No se pudo calcular el cronograma" style={{ gridColumn: '1 / -1' }}>
          {preview.error instanceof ApiError ? preview.error.message : 'Revisa los datos e inténtalo de nuevo.'}
        </Alert>
      )}
    </div>
  );
}

// ============================== Paso 5 · Confirmación =======================
function StepConfirm({
  state,
  yearName,
  errorMsg,
  declared,
  onDeclare,
}: {
  state: WizardState;
  yearName: string;
  errorMsg: string;
  declared: boolean;
  onDeclare: (v: boolean) => void;
}) {
  const { data: existing } = useStudent(state.mode === 'exist' ? state.studentId ?? undefined : undefined);
  const studentName =
    state.mode === 'exist'
      ? existing
        ? fullName(existing)
        : '—'
      : `${state.newStudent.lastNames} ${state.newStudent.firstNames}`.trim() || '—';

  const fields: [string, string][] = [
    ['Estudiante', studentName],
    ['Tipo de matrícula', { NUEVA: 'Nueva', RATIFICADA: 'Ratificación', TRASLADO: 'Traslado' }[MODE_TO_TYPE[state.mode]]],
    ['Año académico', yearName],
    ['Programas', state.programIds.length ? `${state.programIds.length} seleccionado(s)` : 'Ninguno'],
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {errorMsg && (
        <Alert tone="danger" title="No se pudo matricular">
          {errorMsg}
        </Alert>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {fields.map(([k, v]) => (
          <div key={k}>
            <div className="eyebrow" style={{ marginBottom: 2 }}>
              {k}
            </div>
            <div style={{ font: 'var(--type-body-md)', color: 'var(--text-body)' }}>{v}</div>
          </div>
        ))}
      </div>
      <Alert tone="info" title="Al confirmar se generará:">
        el N° de matrícula · el cronograma de pagos (matrícula + pensiones) · la ficha única de matrícula lista para
        imprimir · la notificación al apoderado firmante.
      </Alert>
      <Checkbox
        label="Declaro que los datos consignados son correctos"
        description="El apoderado firmará la ficha impresa"
        checked={declared}
        onChange={(e) => onDeclare(e.target.checked)}
      />
    </div>
  );
}

// ============================== Pantalla de éxito ===========================
function SuccessScreen({
  result,
  onExit,
  onAgain,
}: {
  result: CreateEnrollmentResult;
  onExit: () => void;
  onAgain: () => void;
}) {
  const { toast } = useToast();
  const pensiones = result.schedule.filter((i) => i.type === 'PENSION').length;
  return (
    <Card>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 8,
          padding: '34px 20px',
        }}
      >
        <span
          style={{
            width: 62,
            height: 62,
            borderRadius: 99,
            background: 'var(--success-soft)',
            color: 'var(--success)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 30,
          }}
        >
          <Icons.Check />
        </span>
        <div style={{ font: 'var(--type-h2)', color: 'var(--text-strong)', marginTop: 6 }}>
          Matrícula {result.enrollment.code} registrada
        </div>
        <div style={{ font: 'var(--type-body-md)', color: 'var(--text-muted)', maxWidth: 460 }}>
          El cronograma de {pensiones + 1} pagos (1 matrícula + {pensiones} pensiones) fue generado y se notificó al
          apoderado firmante.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <Button
            variant="secondary"
            iconLeft={<Icons.Printer />}
            onClick={() => toast('info', 'Imprimir ficha', 'Disponible próximamente.')}
          >
            Imprimir ficha
          </Button>
          <Button
            variant="accent"
            iconLeft={<Icons.Cash />}
            onClick={() => toast('info', 'Cobrar matrícula', 'La caja llega con el módulo de dinero (R2).')}
          >
            Cobrar matrícula ahora
          </Button>
          <Button variant="primary" iconLeft={<Icons.Plus />} onClick={onAgain}>
            Nueva matrícula
          </Button>
        </div>
        <Button variant="ghost" onClick={onExit} style={{ marginTop: 8 }}>
          Volver al listado
        </Button>
      </div>
    </Card>
  );
}
