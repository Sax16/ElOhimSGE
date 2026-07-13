import { z } from 'zod';
import { EMPLOYMENT_TYPES, STAFF_ROLES, STAFF_STATUSES } from '../enums';

// Esquemas de Personal (R3 — E1): ficha de empleado. Única definición de validación
// (compartida entre React Hook Form y la API).

// DNI peruano: exactamente 8 dígitos.
const dni = z.string().regex(/^\d{8}$/, 'DNI de 8 dígitos');
// Hora de ingreso HH:mm (columna @db.Char(5)).
const entryTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora inválida (HH:mm)');
// Sueldo/monto como number o string decimal (nunca float en la BD: NUMERIC(10,2)).
const money = z
  .union([z.number(), z.string().regex(/^\d+(\.\d{1,2})?$/, 'Monto inválido')])
  .refine((v) => Number(v) >= 0, 'El monto no puede ser negativo');
// Fecha civil yyyy-mm-dd (columna @db.Date).
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida');

export const staffCreateSchema = z
  .object({
    fullName: z.string().min(3, 'Ingresa nombres y apellidos'),
    dni,
    // El teléfono y el correo son opcionales; el formulario puede enviar '' (se normaliza a null).
    phone: z.string().optional().nullable(),
    email: z.string().email('Correo inválido').optional().nullable().or(z.literal('')),
    role: z.enum(STAFF_ROLES),
    area: z.string().optional().nullable(),
    employmentType: z.enum(EMPLOYMENT_TYPES),
    baseSalary: money,
    hireDate: isoDate.optional().nullable().or(z.literal('')),
    pensionSchemeId: z.string().min(1, 'Selecciona un régimen pensionario'),
    status: z.enum(STAFF_STATUSES).default('ACTIVO'),
    useIndividualSchedule: z.boolean().default(false),
    individualEntryTime: entryTime.optional().nullable().or(z.literal('')),
    individualToleranceMin: z.coerce.number().int().min(0, 'La tolerancia no puede ser negativa').optional().nullable(),
  })
  // Con horario individual, la hora de ingreso y la tolerancia son obligatorias.
  .refine((d) => !d.useIndividualSchedule || Boolean(d.individualEntryTime), {
    message: 'Indica la hora de ingreso del horario individual',
    path: ['individualEntryTime'],
  })
  .refine(
    (d) => !d.useIndividualSchedule || (d.individualToleranceMin !== undefined && d.individualToleranceMin !== null),
    { message: 'Indica la tolerancia del horario individual', path: ['individualToleranceMin'] },
  );
export type StaffCreateInput = z.infer<typeof staffCreateSchema>;

// Actualizar: mismos campos, todos opcionales (incluye status para pasar a LICENCIA/CESADO).
export const staffUpdateSchema = z
  .object({
    fullName: z.string().min(3, 'Ingresa nombres y apellidos'),
    dni,
    phone: z.string().optional().nullable(),
    email: z.string().email('Correo inválido').optional().nullable().or(z.literal('')),
    role: z.enum(STAFF_ROLES),
    area: z.string().optional().nullable(),
    employmentType: z.enum(EMPLOYMENT_TYPES),
    baseSalary: money,
    hireDate: isoDate.optional().nullable().or(z.literal('')),
    pensionSchemeId: z.string().min(1, 'Selecciona un régimen pensionario'),
    status: z.enum(STAFF_STATUSES),
    useIndividualSchedule: z.boolean(),
    individualEntryTime: entryTime.optional().nullable().or(z.literal('')),
    individualToleranceMin: z.coerce.number().int().min(0, 'La tolerancia no puede ser negativa').optional().nullable(),
  })
  .partial()
  .refine((d) => !d.useIndividualSchedule || Boolean(d.individualEntryTime), {
    message: 'Indica la hora de ingreso del horario individual',
    path: ['individualEntryTime'],
  })
  .refine(
    (d) => !d.useIndividualSchedule || (d.individualToleranceMin !== undefined && d.individualToleranceMin !== null),
    { message: 'Indica la tolerancia del horario individual', path: ['individualToleranceMin'] },
  );
export type StaffUpdateInput = z.infer<typeof staffUpdateSchema>;

export const staffListQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(STAFF_ROLES).optional(),
  status: z.enum(STAFF_STATUSES).optional(),
});
export type StaffListQuery = z.infer<typeof staffListQuerySchema>;
