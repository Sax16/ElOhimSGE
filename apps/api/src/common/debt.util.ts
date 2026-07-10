import { type Prisma, type PrismaClient } from '@prisma/client';
import { decimalToCents } from './money.util';

type DbClient = PrismaClient | Prisma.TransactionClient;

/**
 * Deuda vencida por estudiante, en centavos.
 *
 * Definición única (compartida por estudiantes y apoderados): Σ de las cuotas
 * (Installment) con status VENCIDO, o PENDIENTE cuya fecha de vencimiento ya pasó,
 * sobre TODAS las matrículas ESCOLARES del estudiante y sus inscripciones ACTIVAS a
 * programas complementarios (cuotas propias del programa).
 */
export async function debtCentsByStudent(
  client: DbClient,
  studentIds: string[],
): Promise<Map<string, number>> {
  const debt = new Map<string, number>();
  if (studentIds.length === 0) return debt;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rows = await client.installment.findMany({
    where: {
      OR: [{ status: 'VENCIDO' }, { status: 'PENDIENTE', dueDate: { lt: today } }],
      AND: {
        OR: [
          { enrollment: { studentId: { in: studentIds } } },
          { programEnrollment: { studentId: { in: studentIds }, canceledAt: null } },
        ],
      },
    },
    select: {
      amount: true,
      enrollment: { select: { studentId: true } },
      programEnrollment: { select: { studentId: true } },
    },
  });

  for (const row of rows) {
    const sid = row.enrollment?.studentId ?? row.programEnrollment?.studentId;
    if (!sid) continue;
    debt.set(sid, (debt.get(sid) ?? 0) + decimalToCents(row.amount));
  }
  return debt;
}
