// Generación del cronograma de matrícula (una matrícula + N pensiones). Cálculo puro en centavos.
// Fechas SIEMPRE como strings yyyy-mm-dd (Date UTC solo para calcular días del mes; nunca TZ local).
import { applyDiscount } from './discount';
import { billableMonths } from './proration';

export interface ScheduleProgram {
  name: string;
  monthlyFeeCents: number;
}

export interface ScheduleInput {
  enrollmentDate: string; // ISO yyyy-mm-dd
  yearName: number; // 2026 → año de los vencimientos
  levelFee: {
    enrollmentFeeCents: number;
    monthlyFeeCents: number;
    installmentsCount: 10 | 11;
  };
  discountPercent: number; // 0–100, SOLO pensiones
  programs: ScheduleProgram[];
  dueDayOfMonth: number | null; // null = último día del mes
  transfer?: { entryDate: string; cutoffDay: number };
}

export interface ScheduleItem {
  type: 'MATRICULA' | 'PENSION';
  concept: string;
  sequence: number; // 0 = matrícula, 1..N = pensiones
  dueDate: string; // yyyy-mm-dd
  baseCents: number;
  discountCents: number;
  programsCents: number;
  totalCents: number;
}

// Nombres de mes en español, indexados 1..12 (0 vacío para alinear el índice al número de mes).
const MONTH_NAMES = [
  '',
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Último día calendario del mes (1-based) en un año dado, vía Date UTC. */
function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Fecha de vencimiento yyyy-mm-dd: día = dueDayOfMonth (acotado al último día) o último día del mes. */
function dueDateFor(year: number, month: number, dueDayOfMonth: number | null): string {
  const last = daysInMonth(year, month);
  const day = dueDayOfMonth == null ? last : Math.min(dueDayOfMonth, last);
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/**
 * Construye el cronograma completo de una matrícula.
 *
 * - MATRICULA (sequence 0): vence en enrollmentDate, monto completo del tarifario, sin descuento.
 * - PENSIONES: installmentsCount 10 → Marzo..Diciembre; 11 → Febrero..Diciembre.
 *   Descuento SOLO sobre la pensión; los programas se suman aparte y no se descuentan.
 * - Traslado: se generan solo los meses cobrables (proration.billableMonths); el mes de ingreso
 *   se cobra completo si entra dentro del corte. Las secuencias van 1..N sobre los meses resultantes.
 */
export function buildEnrollmentSchedule(input: ScheduleInput): ScheduleItem[] {
  const { enrollmentDate, yearName, levelFee, discountPercent, programs, dueDayOfMonth, transfer } =
    input;

  const items: ScheduleItem[] = [];

  // (1) Matrícula.
  items.push({
    type: 'MATRICULA',
    concept: 'Matrícula',
    sequence: 0,
    dueDate: enrollmentDate,
    baseCents: levelFee.enrollmentFeeCents,
    discountCents: 0,
    programsCents: 0,
    totalCents: levelFee.enrollmentFeeCents,
  });

  // (2) Meses según el número de cuotas del tarifario.
  let months =
    levelFee.installmentsCount === 11
      ? [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
      : [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // (5) Traslado: recorta a los meses cobrables desde la fecha de ingreso.
  if (transfer) {
    months = billableMonths(months, transfer.entryDate, transfer.cutoffDay);
  }

  const programsCents = programs.reduce((sum, p) => sum + p.monthlyFeeCents, 0);

  // (3) Pensiones: base − descuento + programas.
  let sequence = 1;
  for (const month of months) {
    const baseCents = levelFee.monthlyFeeCents;
    const discountCents = applyDiscount(baseCents, discountPercent);
    const totalCents = baseCents - discountCents + programsCents;
    items.push({
      type: 'PENSION',
      concept: `Pensión ${MONTH_NAMES[month]}`,
      sequence,
      dueDate: dueDateFor(yearName, month, dueDayOfMonth),
      baseCents,
      discountCents,
      programsCents,
      totalCents,
    });
    sequence += 1;
  }

  return items;
}
