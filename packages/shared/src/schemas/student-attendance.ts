import { z } from 'zod';
import { STUDENT_ATTENDANCE_STATUSES } from '../enums';

// Esquemas de Asistencia de estudiantes y Asignación docente (R4 — E1). Única definición de
// validación (compartida entre React Hook Form y la API). Mensajes de error en español.

// Fecha civil yyyy-mm-dd (columna @db.Date).
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (yyyy-mm-dd)');
// Mes yyyy-mm.
const isoMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Mes inválido (yyyy-mm)');

// ===== Asistencia de estudiantes =====

// GET /api/student-attendance/my-sections?date=yyyy-mm-dd (default hoy Lima).
export const myAttendanceSectionsQuerySchema = z.object({
  date: isoDate.optional(),
});
export type MyAttendanceSectionsQuery = z.infer<typeof myAttendanceSectionsQuerySchema>;

// GET /api/student-attendance/roster?sectionId=&date=
export const attendanceRosterQuerySchema = z.object({
  sectionId: z.string().min(1, 'Selecciona una sección'),
  date: isoDate,
});
export type AttendanceRosterQuery = z.infer<typeof attendanceRosterQuerySchema>;

// GET /api/student-attendance/monthly?sectionId=&month=yyyy-mm  (también export).
export const attendanceMonthlyQuerySchema = z.object({
  sectionId: z.string().min(1, 'Selecciona una sección'),
  month: isoMonth,
});
export type AttendanceMonthlyQuery = z.infer<typeof attendanceMonthlyQuerySchema>;

// PUT /api/student-attendance — guarda (o crea) la toma de una sección en un día.
export const studentAttendanceSaveSchema = z.object({
  sectionId: z.string().min(1, 'Selecciona una sección'),
  date: isoDate,
  entries: z
    .array(
      z.object({
        enrollmentId: z.string().min(1),
        status: z.enum(STUDENT_ATTENDANCE_STATUSES),
      }),
    )
    .min(1, 'Registra al menos un estudiante'),
});
export type StudentAttendanceSaveInput = z.infer<typeof studentAttendanceSaveSchema>;

// PATCH /api/student-attendance/:id/correct (solo Admin). Justificación ≥ 10 caracteres.
export const studentAttendanceCorrectSchema = z.object({
  status: z.enum(STUDENT_ATTENDANCE_STATUSES),
  reason: z.string().trim().min(10, 'La justificación debe tener al menos 10 caracteres'),
});
export type StudentAttendanceCorrectInput = z.infer<typeof studentAttendanceCorrectSchema>;

// ===== Asignación docente (curso × sección) =====

// GET /api/course-assignments?yearId=  y  /api/course-assignments/options?yearId=
export const courseAssignmentsQuerySchema = z.object({
  yearId: z.string().min(1, 'Selecciona un año académico'),
});
export type CourseAssignmentsQuery = z.infer<typeof courseAssignmentsQuerySchema>;

// POST /api/course-assignments
export const courseAssignmentCreateSchema = z.object({
  courseId: z.string().min(1, 'Selecciona un curso'),
  sectionId: z.string().min(1, 'Selecciona una sección'),
  teacherId: z.string().min(1, 'Selecciona un docente'),
});
export type CourseAssignmentCreateInput = z.infer<typeof courseAssignmentCreateSchema>;

// PATCH /api/course-assignments/:id
export const courseAssignmentUpdateSchema = z.object({
  teacherId: z.string().min(1, 'Selecciona un docente'),
});
export type CourseAssignmentUpdateInput = z.infer<typeof courseAssignmentUpdateSchema>;
