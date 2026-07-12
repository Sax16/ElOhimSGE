import { type Prisma } from '@prisma/client';

export interface CommitmentTransition {
  commitmentId: string;
  code: string;
  from: 'VIGENTE' | 'CUMPLIDO';
  to: 'CUMPLIDO' | 'VIGENTE';
}

/**
 * Recalcula el estado de los compromisos que incluyen alguna de estas cuotas, tras un cambio de
 * pago (cobro en caja, anulación de recibo o aplicación de devolución a una cuota):
 *
 *   - VIGENTE con TODOS sus items PAGADO → CUMPLIDO (fulfilledAt = ahora).
 *   - CUMPLIDO al que se le desmarca una cuota → VIGENTE (fulfilledAt = null).
 *
 * Devuelve las transiciones para que el caller las audite dentro de la MISMA $transaction.
 */
export async function recalcCommitmentsForInstallments(
  tx: Prisma.TransactionClient,
  installmentIds: string[],
): Promise<CommitmentTransition[]> {
  const ids = [...new Set(installmentIds)];
  if (ids.length === 0) return [];

  const links = await tx.commitmentInstallment.findMany({
    where: { installmentId: { in: ids }, commitment: { status: { in: ['VIGENTE', 'CUMPLIDO'] } } },
    select: { commitmentId: true },
  });
  const commitmentIds = [...new Set(links.map((l) => l.commitmentId))];
  const transitions: CommitmentTransition[] = [];

  for (const cid of commitmentIds) {
    const commitment = await tx.paymentCommitment.findUnique({
      where: { id: cid },
      select: {
        id: true,
        code: true,
        status: true,
        items: { select: { installment: { select: { status: true } } } },
      },
    });
    if (!commitment) continue;
    const allPaid = commitment.items.every((it) => it.installment.status === 'PAGADO');

    if (commitment.status === 'VIGENTE' && allPaid) {
      await tx.paymentCommitment.update({
        where: { id: cid },
        data: { status: 'CUMPLIDO', fulfilledAt: new Date() },
      });
      transitions.push({ commitmentId: cid, code: commitment.code, from: 'VIGENTE', to: 'CUMPLIDO' });
    } else if (commitment.status === 'CUMPLIDO' && !allPaid) {
      await tx.paymentCommitment.update({
        where: { id: cid },
        data: { status: 'VIGENTE', fulfilledAt: null },
      });
      transitions.push({ commitmentId: cid, code: commitment.code, from: 'CUMPLIDO', to: 'VIGENTE' });
    }
  }
  return transitions;
}
