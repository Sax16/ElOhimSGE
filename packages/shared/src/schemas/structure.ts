import { z } from 'zod';
import {
  PERIOD_STATUSES,
  PERIOD_TYPES,
  PROGRAM_STATUSES,
  PROGRAM_TYPES,
  SHIFTS,
} from '../enums';

// Monto decimal como string (nunca float): la BD lo guarda en NUMERIC(10,2).
const decimalString = z.string().regex(/^\d+(\.\d{1,2})?$/, 'Monto inválido');

// ===== Años académicos =====

const yearShape = {
  name: z.string().regex(/^\d{4}$/, 'Año de 4 dígitos'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  periodType: z.enum(PERIOD_TYPES),
  enrollmentStart: z.coerce.date(),
};

// endDate posterior a startDate (ambas presentes en creación).
const endAfterStart = (d: { startDate: Date; endDate: Date }) => d.endDate > d.startDate;

export const yearCreateSchema = z
  .object(yearShape)
  .refine(endAfterStart, { message: 'La fecha de fin debe ser posterior al inicio', path: ['endDate'] });
export type YearCreateInput = z.infer<typeof yearCreateSchema>;

// Sin name obligatorio ni refine: se editan campos sueltos de un año abierto.
export const yearUpdateSchema = z.object(yearShape).partial();
export type YearUpdateInput = z.infer<typeof yearUpdateSchema>;

export const startNextYearSchema = z
  .object({
    ...yearShape,
    copy: z.object({
      structure: z.boolean(),
      plan: z.boolean(),
      tutors: z.boolean(),
      programs: z.boolean(),
    }),
  })
  .refine(endAfterStart, { message: 'La fecha de fin debe ser posterior al inicio', path: ['endDate'] });
export type StartNextYearInput = z.infer<typeof startNextYearSchema>;

// ===== Niveles =====

export const levelCreateSchema = z.object({
  academicYearId: z.string(),
  name: z.string().min(2),
  description: z.string().optional().nullable(),
});
export type LevelCreateInput = z.infer<typeof levelCreateSchema>;

export const levelUpdateSchema = z
  .object({
    name: z.string().min(2),
    description: z.string().optional().nullable(),
  })
  .partial();
export type LevelUpdateInput = z.infer<typeof levelUpdateSchema>;

// ===== Grados =====

export const gradeCreateSchema = z.object({
  levelId: z.string(),
  name: z.string().min(1),
});
export type GradeCreateInput = z.infer<typeof gradeCreateSchema>;

export const gradeUpdateSchema = z.object({
  name: z.string().min(1),
});
export type GradeUpdateInput = z.infer<typeof gradeUpdateSchema>;

// ===== Secciones =====

export const sectionCreateSchema = z.object({
  gradeLevelId: z.string(),
  name: z.string().min(1),
  shift: z.enum(SHIFTS),
  capacity: z.number().int().positive(),
  tutorId: z.string().optional().nullable(),
  assistantName: z.string().optional().nullable(),
});
export type SectionCreateInput = z.infer<typeof sectionCreateSchema>;

export const sectionUpdateSchema = z
  .object({
    name: z.string().min(1),
    shift: z.enum(SHIFTS),
    capacity: z.number().int().positive(),
    tutorId: z.string().optional().nullable(),
    assistantName: z.string().optional().nullable(),
  })
  .partial();
export type SectionUpdateInput = z.infer<typeof sectionUpdateSchema>;

// ===== Cursos (plan de estudios) =====

export const courseCreateSchema = z.object({
  gradeLevelId: z.string(),
  name: z.string().min(2),
  weeklyHours: z.number().int().positive(),
  teacherId: z.string().optional().nullable(),
});
export type CourseCreateInput = z.infer<typeof courseCreateSchema>;

export const courseUpdateSchema = z
  .object({
    name: z.string().min(2),
    weeklyHours: z.number().int().positive(),
    teacherId: z.string().optional().nullable(),
  })
  .partial();
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;

export const coursesCopySchema = z.object({
  fromGradeLevelId: z.string(),
  toGradeLevelIds: z.array(z.string()).min(1),
});
export type CoursesCopyInput = z.infer<typeof coursesCopySchema>;

// ===== Programas =====

// Vigencia del programa: meses 2..12 (marzo–diciembre; feb solo si el año lo abre) y fin >= inicio.
const programMonth = z.number().int().min(2).max(12);

export const programCreateSchema = z
  .object({
    academicYearId: z.string(),
    name: z.string().min(2),
    type: z.enum(PROGRAM_TYPES),
    scheduleText: z.string().default('Por definir'),
    capacity: z.number().int().positive(),
    startMonth: programMonth,
    endMonth: programMonth,
    enrollmentFee: decimalString,
    monthlyFee: decimalString,
    status: z.enum(PROGRAM_STATUSES).default('ACTIVO'),
  })
  .refine((d) => d.endMonth >= d.startMonth, {
    message: 'El mes de fin no puede ser anterior al de inicio',
    path: ['endMonth'],
  });
export type ProgramCreateInput = z.infer<typeof programCreateSchema>;

export const programUpdateSchema = z
  .object({
    name: z.string().min(2),
    type: z.enum(PROGRAM_TYPES),
    scheduleText: z.string(),
    capacity: z.number().int().positive(),
    startMonth: programMonth,
    endMonth: programMonth,
    enrollmentFee: decimalString,
    monthlyFee: decimalString,
    status: z.enum(PROGRAM_STATUSES),
  })
  .partial()
  // Si vienen ambos meses en la edición, el fin no puede ser anterior al inicio.
  .refine((d) => d.startMonth === undefined || d.endMonth === undefined || d.endMonth >= d.startMonth, {
    message: 'El mes de fin no puede ser anterior al de inicio',
    path: ['endMonth'],
  });
export type ProgramUpdateInput = z.infer<typeof programUpdateSchema>;

// ===== Periodos =====

export const periodUpdateSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: z.enum(PERIOD_STATUSES).optional(),
});
export type PeriodUpdateInput = z.infer<typeof periodUpdateSchema>;
