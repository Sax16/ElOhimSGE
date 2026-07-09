// Alta / edición de la ficha del estudiante (spec del prototipo StudentsScreen.jsx).
import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Dialog,
  IconButton,
  Icons,
  Input,
  Radio,
  RadioGroup,
  Select,
  Textarea,
  useToast,
} from '@elohim/ui';
import {
  INSURANCE_TYPES,
  INSURANCE_TYPE_LABELS,
  SEX_LABELS,
  SHIFTS,
  SHIFT_LABELS,
  STUDENT_STATUS_LABELS,
  type InsuranceType,
  type Sex,
  type Shift,
  type StudentStatus,
} from '@elohim/shared';
import { ApiError } from '../../lib/api';
import { useCreateStudent, useUpdateStudent } from './api';
import { STUDENT_STATUS_TONE } from './bits';
import type { AuthorizedPickup, StudentCreateBody, StudentDetail, StudentUpdateBody } from './types';

export interface StudentFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** Ficha a editar; ausente = alta sin matrícula. */
  student?: StudentDetail | null;
  readOnly?: boolean;
  /** Se invoca con la ficha creada (para abrirla enseguida, p. ej.). */
  onCreated?: (student: StudentDetail) => void;
}

type EditableStatus = Extract<StudentStatus, 'ACTIVO' | 'BECADO' | 'RESERVADO'>;
const EDITABLE_STATUSES: EditableStatus[] = ['ACTIVO', 'BECADO', 'RESERVADO'];
const isEditableStatus = (s: StudentStatus): s is EditableStatus =>
  (EDITABLE_STATUSES as StudentStatus[]).includes(s);

const emptyPickup = (): AuthorizedPickup => ({ name: '', dni: '', relation: '' });

export function StudentFormDialog({
  open,
  onClose,
  student,
  readOnly = false,
  onCreated,
}: StudentFormDialogProps) {
  const { toast } = useToast();
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const edit = student ?? null;

  const [firstNames, setFirstNames] = useState('');
  const [lastNames, setLastNames] = useState('');
  const [dni, setDni] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [sex, setSex] = useState<Sex>('M');
  const [address, setAddress] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');
  const [shift, setShift] = useState<Shift | ''>('');
  const [insuranceType, setInsuranceType] = useState<InsuranceType>('SIS');
  const [allergies, setAllergies] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [status, setStatus] = useState<EditableStatus>('ACTIVO');
  const [pickups, setPickups] = useState<AuthorizedPickup[]>([emptyPickup()]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setFirstNames(edit?.firstNames ?? '');
    setLastNames(edit?.lastNames ?? '');
    setDni(edit?.dni ?? '');
    setBirthDate(edit?.birthDate ? edit.birthDate.slice(0, 10) : '');
    setSex(edit?.sex ?? 'M');
    setAddress(edit?.address ?? '');
    setPreviousSchool(edit?.previousSchool ?? '');
    setShift(edit?.shift ?? '');
    setInsuranceType(edit?.insuranceType ?? 'SIS');
    setAllergies(edit?.allergies ?? '');
    setEmergencyName(edit?.emergencyContactName ?? '');
    setEmergencyPhone(edit?.emergencyContactPhone ?? '');
    setStatus(edit && isEditableStatus(edit.status) ? edit.status : 'ACTIVO');
    setPickups(edit && edit.authorizedPickups.length ? edit.authorizedPickups.map((p) => ({ ...p })) : [emptyPickup()]);
    setErrors({});
  }, [open, edit?.id]);

  const pending = createStudent.isPending || updateStudent.isPending;
  const showStatusField = !!edit && isEditableStatus(edit.status);

  const updatePickup = (i: number, patch: Partial<AuthorizedPickup>) =>
    setPickups((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const addPickup = () => setPickups((rows) => [...rows, emptyPickup()]);
  const removePickup = (i: number) =>
    setPickups((rows) => (rows.length > 1 ? rows.filter((_, idx) => idx !== i) : rows));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!firstNames.trim()) e.firstNames = 'Ingresa los nombres.';
    if (!lastNames.trim()) e.lastNames = 'Ingresa los apellidos.';
    if (!/^\d{8}$/.test(dni.trim())) e.dni = 'El DNI debe tener 8 dígitos.';
    if (!birthDate) e.birthDate = 'Ingresa la fecha de nacimiento.';
    if (!address.trim()) e.address = 'Ingresa una dirección.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (readOnly || !validate()) return;
    const cleanPickups = pickups
      .filter((p) => p.name.trim())
      .map((p) => ({
        name: p.name.trim(),
        dni: p.dni?.trim() ? p.dni.trim() : undefined,
        relation: p.relation.trim(),
      }));

    const onError = (err: unknown) => {
      if (err instanceof ApiError && err.errors?.length) {
        setErrors(Object.fromEntries(err.errors.map((f) => [f.path, f.message])));
      }
      toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.');
    };

    if (edit) {
      // null (no undefined) para que al vaciar un campo opcional se limpie en la BD.
      const body: StudentUpdateBody = {
        firstNames: firstNames.trim(),
        lastNames: lastNames.trim(),
        dni: dni.trim(),
        birthDate,
        sex,
        address: address.trim(),
        previousSchool: previousSchool.trim() || null,
        shift: shift || null,
        allergies: allergies.trim() || null,
        insuranceType,
        emergencyContactName: emergencyName.trim() || null,
        emergencyContactPhone: emergencyPhone.trim() || null,
        authorizedPickups: cleanPickups,
        ...(showStatusField ? { status } : {}),
      };
      updateStudent.mutate(
        { id: edit.id, body },
        {
          onSuccess: () => {
            toast('success', 'Ficha actualizada', `${lastNames.trim()} ${firstNames.trim()} guardado correctamente.`);
            onClose();
          },
          onError,
        },
      );
    } else {
      const body: StudentCreateBody = {
        firstNames: firstNames.trim(),
        lastNames: lastNames.trim(),
        dni: dni.trim(),
        birthDate,
        sex,
        address: address.trim(),
        previousSchool: previousSchool.trim() || undefined,
        shift: shift || undefined,
        allergies: allergies.trim() || undefined,
        insuranceType,
        emergencyContactName: emergencyName.trim() || undefined,
        emergencyContactPhone: emergencyPhone.trim() || undefined,
        authorizedPickups: cleanPickups,
      };
      createStudent.mutate(body, {
        onSuccess: (created) => {
          toast('success', 'Estudiante registrado', `${created.code} · ${lastNames.trim()} ${firstNames.trim()}.`);
          onCreated?.(created);
          onClose();
        },
        onError,
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      icon={edit ? <Icons.Pencil /> : <Icons.User />}
      title={edit ? `Editar · ${edit.lastNames} ${edit.firstNames}` : 'Nuevo estudiante'}
      description={
        edit
          ? edit.code
          : 'Registra la ficha; la matrícula a un aula se hace desde el asistente de matrícula'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Check />} disabled={pending || readOnly} onClick={submit}>
            {edit ? 'Guardar cambios' : 'Registrar estudiante'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingTop: 4 }}>
        <Input
          label="Nombres"
          required
          value={firstNames}
          onChange={(e) => setFirstNames(e.target.value)}
          error={errors.firstNames}
          placeholder="Ej. María"
        />
        <Input
          label="Apellidos"
          required
          value={lastNames}
          onChange={(e) => setLastNames(e.target.value)}
          error={errors.lastNames}
          placeholder="Ej. Quispe Roca"
        />
        <Input
          label="DNI"
          required
          value={dni}
          onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
          error={errors.dni}
          inputMode="numeric"
          style={{ fontFamily: 'var(--font-mono)' }}
          placeholder="00000000"
        />
        <Input
          label="Fecha de nacimiento"
          type="date"
          required
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          error={errors.birthDate}
        />
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            Sexo
          </div>
          <RadioGroup name="student-sex" value={sex} onChange={(e) => setSex(e.target.value as Sex)} row>
            <Radio value="M" label={SEX_LABELS.M} />
            <Radio value="F" label={SEX_LABELS.F} />
          </RadioGroup>
        </div>
        <Select
          label="Turno"
          placeholder="Sin turno"
          options={SHIFTS.map((s) => ({ value: s, label: SHIFT_LABELS[s] }))}
          value={shift}
          onChange={(e) => setShift(e.target.value as Shift | '')}
        />
        <Input
          label="Dirección"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          error={errors.address}
          placeholder="Jr. …, Satipo"
          containerStyle={{ gridColumn: '1 / -1' }}
        />
        <Input
          label="Colegio de procedencia"
          value={previousSchool}
          onChange={(e) => setPreviousSchool(e.target.value)}
          hint="Opcional"
          placeholder="Ej. I.E. 30001 Satipo"
        />
        {showStatusField ? (
          <Select
            label="Estado"
            options={EDITABLE_STATUSES.map((s) => ({ value: s, label: STUDENT_STATUS_LABELS[s] }))}
            value={status}
            onChange={(e) => setStatus(e.target.value as EditableStatus)}
          />
        ) : edit ? (
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>
              Estado
            </div>
            <Badge tone={STUDENT_STATUS_TONE[edit.status]} dot>
              {STUDENT_STATUS_LABELS[edit.status]}
            </Badge>
          </div>
        ) : (
          <div />
        )}

        {/* Salud y emergencia */}
        <div
          style={{
            gridColumn: '1 / -1',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 12,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 14,
          }}
        >
          <Textarea
            label="Alergias / condiciones médicas"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            hint="Visible para tutor y auxiliar"
            placeholder="Ninguna"
            rows={2}
            containerStyle={{ gridColumn: '1 / -1' }}
          />
          <Select
            label="Seguro"
            options={INSURANCE_TYPES.map((t) => ({ value: t, label: INSURANCE_TYPE_LABELS[t] }))}
            value={insuranceType}
            onChange={(e) => setInsuranceType(e.target.value as InsuranceType)}
          />
          <div />
          <Input
            label="Contacto de emergencia"
            value={emergencyName}
            onChange={(e) => setEmergencyName(e.target.value)}
            placeholder="Nombre"
          />
          <Input
            label="Teléfono de emergencia"
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(e.target.value)}
            inputMode="tel"
            placeholder="9__ ___ ___"
          />
        </div>

        {/* Autorizados a recoger */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ font: 'var(--type-label)', fontWeight: 600, color: 'var(--text-strong)' }}>
              Autorizados a recoger
            </span>
            <Button size="sm" variant="secondary" iconLeft={<Icons.Plus />} onClick={addPickup}>
              Agregar
            </Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pickups.map((p, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr auto', gap: 8, alignItems: 'center' }}>
                <Input
                  aria-label="Nombre"
                  placeholder="Nombre"
                  value={p.name}
                  onChange={(e) => updatePickup(i, { name: e.target.value })}
                />
                <Input
                  aria-label="DNI"
                  placeholder="DNI (opcional)"
                  value={p.dni ?? ''}
                  onChange={(e) => updatePickup(i, { dni: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                  style={{ fontFamily: 'var(--font-mono)' }}
                  inputMode="numeric"
                />
                <Input
                  aria-label="Relación"
                  placeholder="Relación"
                  value={p.relation}
                  onChange={(e) => updatePickup(i, { relation: e.target.value })}
                />
                <IconButton
                  label="Quitar autorizado"
                  size="sm"
                  variant="danger"
                  disabled={pickups.length === 1}
                  onClick={() => removePickup(i)}
                >
                  <Icons.Trash />
                </IconButton>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
