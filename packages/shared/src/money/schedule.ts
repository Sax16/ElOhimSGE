// Generación del cronograma de matrícula (una matrícula + N pensiones). Cálculo puro en centavos.
// Fechas SIEMPRE como strings yyyy-mm-dd (Date UTC solo para calcular días del mes; nunca TZ local).
import { applyDiscount } from './discount';
import { billableMonths } from './proration';

export interface ScheduleInput {
  enrollmentDate: string; // ISO yyyy-mm-dd
  yearName: number; // 2026 → año de los vencimientos
  levelFee: {
    enrollmentFeeCents: number;
    monthlyFeeCents: number;
    installmentsCount: 10 | 11;
  };
  discountPercent: number; // 0–100, SOLO pensiones
  dueDayOfMonth: number | null; // null = último día del mes
  transfer?: { entryDate: string; cutoffDay: number };
}

// Los programas complementarios ya NO se incrustan en la pensión escolar: cada inscripción a
// programa genera su propio cronograma (buildProgramSchedule) con cuotas separadas.
export interface ProgramScheduleInput {
  enrollmentDate: string; // ISO yyyy-mm-dd — fecha de inscripción al programa
  yearName: number; // año de los vencimientos
  startMonth: number; // mes de inicio de la vigencia (2..12)
  endMonth: number; // mes de fin de la vigencia (2..12, >= startMonth)
  enrollmentFeeCents: number; // matrícula del programa (0 = sin cuota de matrícula)
  monthlyFeeCents: number; // cuota mensual del programa
  dueDayOfMonth: number | null; // null = último día del mes
  cutoffDay: number; // día de corte (mismo prorrateo que traslados)
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
  const { enrollmentDate, yearName, levelFee, discountPercent, dueDayOfMonth, transfer } = input;

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

  // (3) Pensiones puras: base − descuento (los programas van en su propio cronograma).
  let sequence = 1;
  for (const month of months) {
    const baseCents = levelFee.monthlyFeeCents;
    const discountCents = applyDiscount(baseCents, discountPercent);
    const totalCents = baseCents - discountCents;
    items.push({
      type: 'PENSION',
      concept: `Pensión ${MONTH_NAMES[month]}`,
      sequence,
      dueDate: dueDateFor(yearName, month, dueDayOfMonth),
      baseCents,
      discountCents,
      programsCents: 0,
      totalCents,
    });
    sequence += 1;
  }

  return items;
}

/**
 * Construye el cronograma de una inscripción a PROGRAMA (separado de las pensiones).
 *
 * - Meses de la vigencia [startMonth..endMonth]. Con inscripción a mitad de vigencia se aplica el
 *   mismo prorrateo del día de corte que los traslados (billableMonths): el mes de ingreso se cobra
 *   si el día cae dentro del corte; los meses anteriores no se generan.
 * - MATRICULA del programa (sequence 0) solo si enrollmentFeeCents > 0; vence en enrollmentDate.
 * - Cuotas: concept 'Programa · {Mes}' (la API antepone el nombre del programa), sequence 1..N.
 * - Si TODOS los meses de la vigencia ya pasaron → sin cuotas de pensión (la API rechaza la
 *   inscripción); solo puede quedar la matrícula si el programa la cobra.
 */
export function buildProgramSchedule(input: ProgramScheduleInput): ScheduleItem[] {
  const {
    enrollmentDate,
    yearName,
    startMonth,
    endMonth,
    enrollmentFeeCents,
    monthlyFeeCents,
    dueDayOfMonth,
    cutoffDay,
  } = input;

  const items: ScheduleItem[] = [];

  // (1) Matrícula del programa (opcional).
  if (enrollmentFeeCents > 0) {
    items.push({
      type: 'MATRICULA',
      concept: 'Matrícula del programa',
      sequence: 0,
      dueDate: enrollmentDate,
      baseCents: enrollmentFeeCents,
      discountCents: 0,
      programsCents: 0,
      totalCents: enrollmentFeeCents,
    });
  }

  // (2) Meses de la vigencia, recortados por el prorrateo del día de corte.
  const allMonths: number[] = [];
  for (let m = startMonth; m <= endMonth; m += 1) allMonths.push(m);
  const months = billableMonths(allMonths, enrollmentDate, cutoffDay);

  // (3) Cuotas mensuales del programa (sin descuento; el descuento HERMANOS es solo pensión escolar).
  let sequence = 1;
  for (const month of months) {
    items.push({
      type: 'PENSION',
      concept: `Programa · ${MONTH_NAMES[month]}`,
      sequence,
      dueDate: dueDateFor(yearName, month, dueDayOfMonth),
      baseCents: monthlyFeeCents,
      discountCents: 0,
      programsCents: 0,
      totalCents: monthlyFeeCents,
    });
    sequence += 1;
  }

  return items;
}
