import { type Prisma, type PrismaClient } from '@prisma/client';
import { decimalToCents } from './money.util';

type DbClient = PrismaClient | Prisma.TransactionClient;

/**
 * Deuda vencida por estudiante, en centavos.
 *
 * Definición única (compartida por estudiantes y apoderados): Σ de las cuotas
 * (Installment) con status VENCIDO, o PENDIENTE cuya fecha de vencimiento ya pasó,
 * sobre TODAS las matrículas del estudiante. Hoy devuelve 0 (aún no hay cuotas);
 * queda implementado para la Etapa 5 (reglas de dinero).
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
      enrollment: { studentId: { in: studentIds } },
      OR: [{ status: 'VENCIDO' }, { status: 'PENDIENTE', dueDate: { lt: today } }],
    },
    select: { amount: true, enrollment: { select: { studentId: true } } },
  });

  for (const row of rows) {
    const sid = row.enrollment.studentId;
    debt.set(sid, (debt.get(sid) ?? 0) + decimalToCents(row.amount));
  }
  return debt;
}
