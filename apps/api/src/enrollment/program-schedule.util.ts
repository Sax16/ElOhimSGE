import { type Prisma } from '@prisma/client';
import { buildProgramSchedule, type ScheduleItem } from '@elohim/shared';
import { decimalToCents } from '../common/money.util';

// Datos mínimos de una edición de programa para derivar su cronograma.
export interface ProgramForSchedule {
  startMonth: number;
  endMonth: number;
  enrollmentFee: Prisma.Decimal;
  monthlyFee: Prisma.Decimal;
}

// Cronograma de una inscripción a programa (cuotas separadas de la pensión escolar).
export function programScheduleItems(
  program: ProgramForSchedule,
  opts: { enrollmentDate: string; yearName: number; dueDayOfMonth: number | null; cutoffDay: number },
): ScheduleItem[] {
  return buildProgramSchedule({
    enrollmentDate: opts.enrollmentDate,
    yearName: opts.yearName,
    startMonth: program.startMonth,
    endMonth: program.endMonth,
    enrollmentFeeCents: decimalToCents(program.enrollmentFee),
    monthlyFeeCents: decimalToCents(program.monthlyFee),
    dueDayOfMonth: opts.dueDayOfMonth,
    cutoffDay: opts.cutoffDay,
  });
}

// El nombre del programa lo antepone la API: 'Programa · {Mes}' → 'Programa · {name} · {Mes}'.
// La matrícula del programa conserva su concepto ('Matrícula del programa').
export function programInstallmentConcept(item: ScheduleItem, programName: string): string {
  if (item.type === 'MATRICULA') return item.concept;
  return item.concept.replace('Programa · ', `Programa · ${programName} · `);
}
