import { type Prisma } from '@prisma/client';

/**
 * Recalcula Enrollment.status con el mismo criterio del seed/debt.util:
 * PENDIENTE_PAGO si le quedan cuotas vencidas (VENCIDO o PENDIENTE con dueDate < hoy),
 * COMPLETA en caso contrario. No toca matrículas anuladas.
 *
 * Nota: usa la fecha ORIGINAL de la cuota (no la efectiva del compromiso) — el estado de la
 * matrícula refleja la deuda escolar real; el "al día" de un compromiso se sigue por su propio estado.
 */
export async function recalcEnrollmentStatuses(
  tx: Prisma.TransactionClient,
  enrollmentIds: string[],
): Promise<void> {
  const ids = [...new Set(enrollmentIds)];
  if (ids.length === 0) return;
  const threshold = new Date();
  threshold.setHours(0, 0, 0, 0);
  for (const id of ids) {
    const overdue = await tx.installment.count({
      where: {
        enrollmentId: id,
        OR: [{ status: 'VENCIDO' }, { status: 'PENDIENTE', dueDate: { lt: threshold } }],
      },
    });
    await tx.enrollment.update({
      where: { id },
      data: { status: overdue > 0 ? 'PENDIENTE_PAGO' : 'COMPLETA' },
    });
  }
}
