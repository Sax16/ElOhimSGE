// Alta / edición de empleado (spec del prototipo StaffScreen.jsx · pestaña Personal).
import { useEffect, useState } from 'react';
import { Button, Dialog, Icons, Input, Select, useToast } from '@elohim/ui';
import { ApiError } from '../../lib/api';
import { useCreateStaff, useStaffCatalogs, useUpdateStaff } from './api';
import {
  EMPLOYMENT_TYPES,
  EMPLOYMENT_TYPE_LABELS,
  STAFF_ROLES,
  STAFF_ROLE_LABELS,
  STAFF_STATUSES,
  STAFF_STATUS_LABELS,
} from './bits';
import type { EmploymentType, StaffCreateBody, StaffDto, StaffRole, StaffStatus } from './types';

export interface StaffFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** Empleado a editar; ausente = alta. */
  staff?: StaffDto | null;
}

type ScheduleMode = 'grupo' | 'individual';

export function StaffFormDialog({ open, onClose, staff }: StaffFormDialogProps) {
  const { toast } = useToast();
  const catalogs = useStaffCatalogs();
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const edit = staff ?? null;

  const pensionSchemes = (catalogs.data?.pensionSchemes ?? []).filter(
    (s) => s.active || s.id === edit?.pensionScheme.id,
  );

  const [fullName, setFullName] = useState('');
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole | ''>('');
  const [employmentType, setEmploymentType] = useState<EmploymentType | ''>('');
  const [area, setArea] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [status, setStatus] = useState<StaffStatus>('ACTIVO');
  const [pensionSchemeId, setPensionSchemeId] = useState('');
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('grupo');
  const [entryTime, setEntryTime] = useState('');
  const [toleranceMin, setToleranceMin] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setFullName(edit?.fullName ?? '');
    setDni(edit?.dni ?? '');
    setPhone(edit?.phone ?? '');
    setEmail(edit?.email ?? '');
    setRole(edit?.role ?? '');
    setEmploymentType(edit?.employmentType ?? '');
    setArea(edit?.area ?? '');
    setBaseSalary(edit ? edit.baseSalary : '');
    setHireDate(edit?.hireDate ? edit.hireDate.slice(0, 10) : '');
    setStatus(edit?.status ?? 'ACTIVO');
    setPensionSchemeId(edit?.pensionScheme.id ?? '');
    setScheduleMode(edit?.useIndividualSchedule ? 'individual' : 'grupo');
    setEntryTime(edit?.individualEntryTime ?? '');
    setToleranceMin(edit?.individualToleranceMin != null ? String(edit.individualToleranceMin) : '');
    setErrors({});
  }, [open, edit?.id]);

  const pending = createStaff.isPending || updateStaff.isPending;
  const individual = scheduleMode === 'individual';

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Ingresa nombres y apellidos.';
    if (!/^\d{8}$/.test(dni.trim())) e.dni = 'El DNI debe tener 8 dígitos.';
    if (!role) e.role = 'Selecciona un rol.';
    if (!employmentType) e.employmentType = 'Selecciona un régimen.';
    const salary = Number(baseSalary);
    if (!baseSalary.trim() || !Number.isFinite(salary) || salary < 0)
      e.baseSalary = 'Ingresa un sueldo válido.';
    if (!pensionSchemeId) e.pensionSchemeId = 'Selecciona el régimen pensionario.';
    if (individual) {
      if (!entryTime) e.entryTime = 'Ingresa la hora de ingreso.';
      const tol = Number(toleranceMin);
      if (!toleranceMin.trim() || !Number.isInteger(tol) || tol < 0)
        e.toleranceMin = 'Ingresa una tolerancia válida.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    const body: StaffCreateBody = {
      fullName: fullName.trim(),
      dni: dni.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      role: role as StaffRole,
      area: area.trim() || null,
      employmentType: employmentType as EmploymentType,
      baseSalary: Number(baseSalary),
      hireDate: hireDate || undefined,
      pensionSchemeId,
      useIndividualSchedule: individual,
      individualEntryTime: individual ? entryTime : null,
      individualToleranceMin: individual ? Number(toleranceMin) : null,
    };
    if (edit) body.status = status;

    const onError = (err: unknown) => {
      if (err instanceof ApiError && err.errors?.length) {
        setErrors(Object.fromEntries(err.errors.map((f) => [f.path, f.message])));
      }
      toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.');
    };

    if (edit) {
      updateStaff.mutate(
        { id: edit.id, body },
        {
          onSuccess: () => {
            toast('success', 'Empleado actualizado', `${body.fullName} guardado.`);
            onClose();
          },
          onError,
        },
      );
    } else {
      createStaff.mutate(body, {
        onSuccess: () => {
          toast('success', 'Empleado registrado', 'Ya aparece en asistencia y en la planilla del mes.');
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
      icon={<Icons.Teacher />}
      title={edit ? `Editar · ${edit.fullName}` : 'Registrar empleado'}
      description="El empleado aparecerá en asistencia y en la planilla del mes"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Check />} disabled={pending} onClick={submit}>
            {edit ? 'Guardar cambios' : 'Registrar'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingTop: 4 }}>
        <Input
          label="Nombres y apellidos"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          placeholder="Ej. Pedro Gómez Silva"
          containerStyle={{ gridColumn: '1 / -1' }}
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
          label="Teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
          inputMode="tel"
          hint="Opcional"
          placeholder="9__ ___ ___"
        />
        <Input
          label="Correo"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          hint="Opcional"
          placeholder="empleado@gmail.com"
        />
        <Select
          label="Rol"
          required
          placeholder="Selecciona"
          options={STAFF_ROLES.map((r) => ({ value: r, label: STAFF_ROLE_LABELS[r] }))}
          value={role}
          onChange={(e) => setRole(e.target.value as StaffRole)}
          error={errors.role}
        />
        <Select
          label="Régimen"
          required
          placeholder="Selecciona"
          options={EMPLOYMENT_TYPES.map((t) => ({ value: t, label: EMPLOYMENT_TYPE_LABELS[t] }))}
          value={employmentType}
          onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
          error={errors.employmentType}
        />
        <Input
          label="Área / nivel"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          hint="Opcional"
          placeholder="Ej. Primaria · Matemática"
        />
        <Input
          label="Sueldo base"
          required
          prefix="S/."
          value={baseSalary}
          onChange={(e) => setBaseSalary(e.target.value.replace(/[^\d.]/g, ''))}
          error={errors.baseSalary}
          inputMode="decimal"
          style={{ fontFamily: 'var(--font-mono)' }}
          placeholder="0.00"
        />
        <Input
          label="Fecha de ingreso"
          type="date"
          value={hireDate}
          onChange={(e) => setHireDate(e.target.value)}
          hint="Opcional"
        />
        {edit && (
          <Select
            label="Estado"
            options={STAFF_STATUSES.map((s) => ({ value: s, label: STAFF_STATUS_LABELS[s] }))}
            value={status}
            onChange={(e) => setStatus(e.target.value as StaffStatus)}
          />
        )}
        <Select
          label="Régimen pensionario"
          required
          placeholder="Selecciona"
          options={pensionSchemes.map((s) => ({ value: s.id, label: s.name }))}
          value={pensionSchemeId}
          onChange={(e) => setPensionSchemeId(e.target.value)}
          error={errors.pensionSchemeId}
          hint="Define el descuento en planilla"
        />
        <Select
          label="Horario de marcación"
          options={[
            { value: 'grupo', label: 'Según su grupo' },
            { value: 'individual', label: 'Individual' },
          ]}
          value={scheduleMode}
          onChange={(e) => setScheduleMode(e.target.value as ScheduleMode)}
          hint="El grupo define hora y tolerancia"
        />
        {individual && (
          <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="Hora de ingreso"
              type="time"
              value={entryTime}
              onChange={(e) => setEntryTime(e.target.value)}
              error={errors.entryTime}
            />
            <Input
              label="Tolerancia"
              suffix="min"
              value={toleranceMin}
              onChange={(e) => setToleranceMin(e.target.value.replace(/\D/g, ''))}
              error={errors.toleranceMin}
              inputMode="numeric"
              placeholder="10"
            />
          </div>
        )}
      </div>
    </Dialog>
  );
}
