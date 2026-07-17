import { z } from 'zod';
import { EVALUATION_ASPECT_KINDS, GRADE_LETTERS } from '../enums';

// Esquemas de Notas por competencias y Configuración → Evaluación (R4 — E2). Única definición de
// validación (compartida entre React Hook Form y la API). Mensajes de error en español.

// Letra de nota o vacío (null): vaciar una celda mientras el periodo está EN_CURSO elimina la nota.
const gradeLetterOrNull = z.enum(GRADE_LETTERS).nullable();

// Justificación de corrección en periodo CERRADO (≥ 10 caracteres). Opcional en el cuerpo.
const correctionReason = z.string().trim().min(10, 'La justificación debe tener al menos 10 caracteres');

// ===== Configuración → Evaluación: aspectos =====

// POST /api/evaluation-config/aspects
export const evaluationAspectCreateSchema = z.object({
  kind: z.enum(EVALUATION_ASPECT_KINDS),
  name: z.string().trim().min(1, 'Escribe un nombre'),
});
export type EvaluationAspectCreateInput = z.infer<typeof evaluationAspectCreateSchema>;

// PATCH /api/evaluation-config/aspects/:id — renombrar y/o activar/desactivar.
export const evaluationAspectUpdateSchema = z
  .object({
    name: z.string().trim().min(1, 'Escribe un nombre').optional(),
    active: z.boolean().optional(),
  })
  .refine((v) => v.name !== undefined || v.active !== undefined, {
    message: 'No hay cambios que guardar',
  });
export type EvaluationAspectUpdateInput = z.infer<typeof evaluationAspectUpdateSchema>;

// ===== Configuración → Evaluación: competencias =====

// GET /api/evaluation-config/competencies?gradeLevelId=
export const competenciesConfigQuerySchema = z.object({
  gradeLevelId: z.string().min(1, 'Selecciona un grado'),
});
export type CompetenciesConfigQuery = z.infer<typeof competenciesConfigQuerySchema>;

// POST /api/evaluation-config/competencies
export const competencyCreateSchema = z.object({
  courseId: z.string().min(1, 'Selecciona un curso'),
  name: z.string().trim().min(1, 'Escribe una competencia'),
});
export type CompetencyCreateInput = z.infer<typeof competencyCreateSchema>;

// PATCH /api/evaluation-config/competencies/:id
export const competencyUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Escribe una competencia'),
});
export type CompetencyUpdateInput = z.infer<typeof competencyUpdateSchema>;

// ===== Notas =====

// GET /api/grades/my-courses?periodId= (opcional: default periodo EN_CURSO del año activo).
export const myCoursesQuerySchema = z.object({
  periodId: z.string().min(1).optional(),
});
export type MyCoursesQuery = z.infer<typeof myCoursesQuerySchema>;

// GET /api/grades/periods?yearId= (opcional: default año activo). Bimestres para
// los selectores de Notas, bajo permiso `notas` (el docente no tiene `estructura`).
export const gradesPeriodsQuerySchema = z.object({
  yearId: z.string().min(1).optional(),
});
export type GradesPeriodsQuery = z.infer<typeof gradesPeriodsQuerySchema>;

// GET /api/grades/sheet?sectionId=&courseId=&periodId= (también export).
export const gradeSheetQuerySchema = z.object({
  sectionId: z.string().min(1, 'Selecciona una sección'),
  courseId: z.string().min(1, 'Selecciona un curso'),
  periodId: z.string().min(1, 'Selecciona un periodo'),
});
export type GradeSheetQuery = z.infer<typeof gradeSheetQuerySchema>;

// PUT /api/grades/sheet — guarda la captura de competencias (y ajustes manuales de logro).
export const gradeSheetSaveSchema = z.object({
  sectionId: z.string().min(1, 'Selecciona una sección'),
  courseId: z.string().min(1, 'Selecciona un curso'),
  periodId: z.string().min(1, 'Selecciona un periodo'),
  entries: z.array(
    z.object({
      enrollmentId: z.string().min(1),
      competencyId: z.string().min(1),
      letter: gradeLetterOrNull,
    }),
  ),
  // Ajuste manual del "logro del bimestre": letra → auto=false; null → vuelve al automático.
  results: z
    .array(
      z.object({
        enrollmentId: z.string().min(1),
        letter: gradeLetterOrNull,
      }),
    )
    .optional(),
  reason: correctionReason.optional(),
});
export type GradeSheetSaveInput = z.infer<typeof gradeSheetSaveSchema>;

// GET /api/grades/aspects-sheet?sectionId=&periodId=
export const aspectsSheetQuerySchema = z.object({
  sectionId: z.string().min(1, 'Selecciona una sección'),
  periodId: z.string().min(1, 'Selecciona un periodo'),
});
export type AspectsSheetQuery = z.infer<typeof aspectsSheetQuerySchema>;

// PUT /api/grades/aspects — guarda la captura de aspectos formativos y del apoderado (solo tutor/Admin).
export const aspectsSaveSchema = z.object({
  sectionId: z.string().min(1, 'Selecciona una sección'),
  periodId: z.string().min(1, 'Selecciona un periodo'),
  entries: z.array(
    z.object({
      enrollmentId: z.string().min(1),
      aspectId: z.string().min(1),
      letter: gradeLetterOrNull,
    }),
  ),
  reason: correctionReason.optional(),
});
export type AspectsSaveInput = z.infer<typeof aspectsSaveSchema>;

// GET /api/grades/report-card?enrollmentId=&periodId=
export const reportCardQuerySchema = z.object({
  enrollmentId: z.string().min(1, 'Selecciona una matrícula'),
  periodId: z.string().min(1, 'Selecciona un periodo'),
});
export type ReportCardQuery = z.infer<typeof reportCardQuerySchema>;
