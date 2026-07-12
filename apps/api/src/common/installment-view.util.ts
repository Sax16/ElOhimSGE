import { type Prisma, type PrismaClient } from '@prisma/client';

type DbClient = PrismaClient | Prisma.TransactionClient;

/**
 * FECHA EFECTIVA de una cuota (R2 — E3): concepto central único.
 *
 *   effectiveDueDate = (compromiso VIGENTE que la incluye) ? newDueDate : dueDate
 *
 * De ella derivan el estado mostrado (VENCIDO si effectiveDueDate < hoy y no pagada; si no
 * PENDIENTE), la deuda (debt.util), la elegibilidad de mora (job) y los recordatorios. Así el
 * "congelamiento" de un compromiso es una CONSECUENCIA, no un flag. Este módulo es la única
 * fuente de la sobrescritura; lo consumen pensiones, cashier, debt, el job y los recordatorios.
 */
export interface CommitmentOverride {
  newDueDate: Date; // columna @db.Date (UTC medianoche)
  commitmentCode: string; // "CP-0001"
  commitmentId: string;
}

/**
 * Sobrescrituras vigentes para un conjunto de cuotas: solo compromisos VIGENTE aportan override
 * (PROPUESTO/INCUMPLIDO/ANULADO/CUMPLIDO/RECHAZADO no congelan). Una cuota está en a lo sumo un
 * compromiso PROPUESTO/VIGENTE a la vez (validado en el service), así que el VIGENTE es único.
 */
export async function commitmentOverrides(
  client: DbClient,
  installmentIds: string[],
): Promise<Map<string, CommitmentOverride>> {
  const map = new Map<string, CommitmentOverride>();
  const ids = [...new Set(installmentIds)];
  if (ids.length === 0) return map;

  const rows = await client.commitmentInstallment.findMany({
    where: { installmentId: { in: ids }, commitment: { status: 'VIGENTE' } },
    select: {
      installmentId: true,
      newDueDate: true,
      commitmentId: true,
      commitment: { select: { code: true } },
    },
  });
  for (const r of rows) {
    map.set(r.installmentId, {
      newDueDate: r.newDueDate,
      commitmentCode: r.commitment.code,
      commitmentId: r.commitmentId,
    });
  }
  return map;
}

/** Fecha efectiva (Date) de una cuota dado su override VIGENTE (si lo hay). */
export function effectiveDueDate(dueDate: Date, override?: CommitmentOverride): Date {
  return override ? override.newDueDate : dueDate;
}

// ===== Fechas civiles (yyyy-mm-dd) — sin corrimiento por TZ =====

export function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Date (columna @db.Date, UTC medianoche) → yyyy-mm-dd. */
export function dateToISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** yyyy-mm-dd → Date UTC medianoche (columnas @db.Date). */
export function isoToDate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}
