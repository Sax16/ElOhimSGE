import { z } from 'zod';
import { SHIFTS } from '../enums';

// Esquemas de la Grilla de horarios (post-R4). Única definición de validación (compartida entre
// React Hook Form y la API). Mensajes de error en español. Los bloques se definen por NIVEL + TURNO;
// las celdas (slots) asignan solo el curso — el docente se deriva de CourseAssignment.

// Hora civil "HH:mm" (00:00..23:59).
const timeHHmm = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora inválida (HH:mm)');

// Minutos desde medianoche para comparar rangos "HH:mm".
export function timeToMinutes(hhmm: string): number {
  return Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
}

// ===== GET /schedule/blocks?levelId=&shift= =====
export const scheduleBlocksQuerySchema = z.object({
  levelId: z.string().min(1, 'Falta el nivel'),
  shift: z.enum(SHIFTS),
});
export type ScheduleBlocksQuery = z.infer<typeof scheduleBlocksQuerySchema>;

// Un bloque de la plantilla. order 1..n, endTime > startTime (validado en el superRefine del PUT).
const scheduleBlockInput = z.object({
  order: z.number().int().positive('El orden debe ser un entero positivo'),
  startTime: timeHHmm,
  endTime: timeHHmm,
  isBreak: z.boolean(),
  label: z.string().trim().max(40, 'La etiqueta es demasiado larga').optional().or(z.literal('')),
});

// ===== PUT /schedule/blocks — reemplaza la plantilla del nivel+turno =====
export const scheduleBlocksPutSchema = z
  .object({
    levelId: z.string().min(1, 'Falta el nivel'),
    shift: z.enum(SHIFTS),
    blocks: z.array(scheduleBlockInput).min(1, 'Define al menos un bloque'),
  })
  .superRefine((data, ctx) => {
    const sorted = [...data.blocks].sort((a, b) => a.order - b.order);

    // Órdenes únicos y consecutivos 1..n.
    const orders = sorted.map((b) => b.order);
    if (new Set(orders).size !== orders.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['blocks'], message: 'Los órdenes de los bloques no pueden repetirse' });
    }

    let prevEnd = -1;
    for (const b of sorted) {
      const start = timeToMinutes(b.startTime);
      const end = timeToMinutes(b.endTime);
      const idx = data.blocks.indexOf(b);

      // endTime > startTime.
      if (end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['blocks', idx, 'endTime'],
          message: 'La hora de fin debe ser mayor que la de inicio',
        });
      }
      // Orden ascendente sin solapes: el inicio de cada bloque ≥ fin del anterior.
      if (start < prevEnd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['blocks', idx, 'startTime'],
          message: 'Los bloques no pueden solaparse ni desordenarse',
        });
      }
      prevEnd = Math.max(prevEnd, end);
    }
  });
export type ScheduleBlocksPutInput = z.infer<typeof scheduleBlocksPutSchema>;

// ===== GET /schedule?sectionId= =====
export const scheduleQuerySchema = z.object({
  sectionId: z.string().min(1, 'Falta la sección'),
});
export type ScheduleQuery = z.infer<typeof scheduleQuerySchema>;

// ===== PUT /schedule/slot — asigna/vacía una celda =====
// courseId null → elimina el slot.
export const scheduleSlotPutSchema = z.object({
  sectionId: z.string().min(1, 'Falta la sección'),
  dayOfWeek: z.number().int().min(1, 'Día inválido').max(5, 'Día inválido'),
  blockId: z.string().min(1, 'Falta el bloque'),
  courseId: z.string().min(1).nullable(),
});
export type ScheduleSlotPutInput = z.infer<typeof scheduleSlotPutSchema>;

// ===== POST /schedule/copy — copia el horario de una sección a otra del mismo nivel+turno =====
export const scheduleCopySchema = z
  .object({
    fromSectionId: z.string().min(1, 'Falta la sección de origen'),
    toSectionId: z.string().min(1, 'Falta la sección de destino'),
  })
  .superRefine((data, ctx) => {
    if (data.fromSectionId === data.toSectionId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['toSectionId'],
        message: 'Elige una sección de destino distinta',
      });
    }
  });
export type ScheduleCopyInput = z.infer<typeof scheduleCopySchema>;
