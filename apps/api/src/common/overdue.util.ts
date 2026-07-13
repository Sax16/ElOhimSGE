import { type InstallmentType, type Prisma, type PrismaClient } from '@prisma/client';
import { decimalToCents } from './money.util';
import { commitmentOverrides, dateToISO, todayISO } from './installment-view.util';

type DbClient = PrismaClient | Prisma.TransactionClient;

/**
 * Una cuota VENCIDA EFECTIVA, con su desglose (sin mora / mora). Misma definición de deuda que
 * debt.util (cuota no pagada cuya FECHA EFECTIVA ya pasó), pero devuelta por cuota para reportes.
 */
export interface OverdueInstallment {
  installmentId: string;
  studentId: string;
  amountCents: number; // sin mora
  feeCents: number; // mora fija
  type: InstallmentType;
  source: 'ESCOLAR' | 'PROGRAMA';
}

/**
 * Cuotas VENCIDAS EFECTIVAS dentro del universo `where` (año, estudiantes…). Reutiliza la
 * FECHA EFECTIVA (installment-view.util): una cuota congelada por un compromiso VIGENTE tiene
 * fecha efectiva futura y NO cuenta como vencida — así el dashboard y los reportes comparten la
 * misma definición que Caja y Pensiones, sin duplicarla.
 */
export async function overdueInstallments(
  client: DbClient,
  where: Prisma.InstallmentWhereInput,
): Promise<OverdueInstallment[]> {
  const today = todayISO();
  const rows = await client.installment.findMany({
    where: { status: { in: ['PENDIENTE', 'VENCIDO'] }, ...where },
    select: {
      id: true,
      amount: true,
      lateFeeAmount: true,
      dueDate: true,
      type: true,
      enrollmentId: true,
      enrollment: { select: { studentId: true } },
      programEnrollment: { select: { studentId: true } },
    },
  });

  const overrides = await commitmentOverrides(
    client,
    rows.map((r) => r.id),
  );

  const out: OverdueInstallment[] = [];
  for (const r of rows) {
    const sid = r.enrollment?.studentId ?? r.programEnrollment?.studentId;
    if (!sid) continue;
    const eff = overrides.get(r.id)?.newDueDate ?? r.dueDate;
    if (dateToISO(eff) >= today) continue; // congelada o aún no vence
    out.push({
      installmentId: r.id,
      studentId: sid,
      amountCents: decimalToCents(r.amount),
      feeCents: decimalToCents(r.lateFeeAmount),
      type: r.type,
      source: r.enrollmentId ? 'ESCOLAR' : 'PROGRAMA',
    });
  }
  return out;
}
