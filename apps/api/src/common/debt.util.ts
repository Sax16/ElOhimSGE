import { type Prisma, type PrismaClient } from '@prisma/client';
import { decimalToCents } from './money.util';
import { commitmentOverrides, dateToISO, todayISO } from './installment-view.util';

type DbClient = PrismaClient | Prisma.TransactionClient;

/**
 * Deuda vencida por estudiante, en centavos.
 *
 * Definición única (compartida por estudiantes y apoderados): Σ de las cuotas (Installment)
 * no pagadas cuya FECHA EFECTIVA ya pasó, sobre TODAS las matrículas ESCOLARES del estudiante y
 * sus inscripciones ACTIVAS a programas. El monto vencido incluye la mora fija (amount +
 * lateFeeAmount) — R2 E2. Fecha efectiva = newDueDate si un compromiso VIGENTE la incluye, si no
 * dueDate (R2 E3): una cuota congelada por un compromiso al día NO suma deuda vencida.
 */
export async function debtCentsByStudent(
  client: DbClient,
  studentIds: string[],
): Promise<Map<string, number>> {
  const debt = new Map<string, number>();
  if (studentIds.length === 0) return debt;

  const today = todayISO();

  const rows = await client.installment.findMany({
    where: {
      status: { in: ['PENDIENTE', 'VENCIDO'] },
      // La deuda es del estudiante, no de la matrícula/inscripción viva: se cuenta por el estado de
      // la cuota, sin filtrar por anulación (una inscripción/matrícula anulada dejó sus cuotas en
      // ANULADO, excluidas por el filtro de estado; la deuda viva del retirado sí cuenta).
      OR: [
        { enrollment: { studentId: { in: studentIds } } },
        { programEnrollment: { studentId: { in: studentIds } } },
      ],
    },
    select: {
      id: true,
      amount: true,
      lateFeeAmount: true,
      dueDate: true,
      enrollment: { select: { studentId: true } },
      programEnrollment: { select: { studentId: true } },
    },
  });

  const overrides = await commitmentOverrides(
    client,
    rows.map((r) => r.id),
  );

  for (const row of rows) {
    const sid = row.enrollment?.studentId ?? row.programEnrollment?.studentId;
    if (!sid) continue;
    const eff = overrides.get(row.id)?.newDueDate ?? row.dueDate;
    if (dateToISO(eff) >= today) continue; // congelada o aún no vence: no es deuda vencida
    const owed = decimalToCents(row.amount) + decimalToCents(row.lateFeeAmount);
    debt.set(sid, (debt.get(sid) ?? 0) + owed);
  }
  return debt;
}
