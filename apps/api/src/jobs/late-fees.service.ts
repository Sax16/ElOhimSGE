import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PgBoss } from 'pg-boss';
import { isLateFeeEligible } from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { commitmentOverrides } from '../common/installment-view.util';

// Fecha civil de hoy (yyyy-mm-dd, local): comparación de vencimientos por string (TZ-independiente).
function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
// yyyy-mm-dd → Date UTC medianoche (columnas @db.Date).
function isoToDate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}
// Date (columna @db.Date, UTC medianoche) → yyyy-mm-dd.
function dateToISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export interface LateFeesResult {
  markedOverdue: number;
  feesApplied: number;
  commitmentsBreached: number;
}

const QUEUE = 'late-fees-daily';

/**
 * Job diario de mora (R2 — E2): materializa el estado VENCIDO y carga la mora fija.
 *
 * Arranca pg-boss al bootstrap de Nest (misma DATABASE_URL que PrismaService) y programa
 * `late-fees-daily` a las 00:30 America/Lima. Si pg-boss no puede iniciar, loggea el error y
 * NO tumba la API. El Admin también puede ejecutar run() manualmente desde la API.
 */
@Injectable()
export class LateFeesService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LateFeesService.name);
  private boss: PgBoss | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      this.logger.error('DATABASE_URL ausente — el job de mora no se programará');
      return;
    }
    try {
      this.boss = new PgBoss({ connectionString });
      this.boss.on('error', (error) => this.logger.error('pg-boss', error));
      await this.boss.start();
      await this.boss.createQueue(QUEUE);
      await this.boss.work(QUEUE, async () => {
        const result = await this.run();
        this.logger.log(
          `Job de mora: ${result.markedOverdue} cuotas → VENCIDO, ${result.feesApplied} moras cargadas, ` +
            `${result.commitmentsBreached} compromisos → INCUMPLIDO`,
        );
      });
      await this.boss.schedule(QUEUE, '30 0 * * *', {}, { tz: 'America/Lima' });
      this.logger.log('pg-boss iniciado; late-fees-daily programado 00:30 America/Lima');
    } catch (error) {
      this.boss = null;
      this.logger.error(
        `No se pudo iniciar pg-boss (la API sigue arriba): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async onModuleDestroy() {
    if (this.boss) {
      try {
        await this.boss.stop({ graceful: true });
      } catch {
        // cierre best-effort
      }
      this.boss = null;
    }
  }

  /**
   * Corrida idempotente en una sola $transaction:
   *   (0) INCUMPLIDO: todo compromiso VIGENTE con algún item cuya newDueDate < hoy (sin gracia
   *       adicional) y su cuota no PAGADO → INCUMPLIDO (breachedAt). Se hace PRIMERO: al dejar de
   *       estar VIGENTE, sus cuotas pierden la sobrescritura y vuelven a su fecha efectiva original,
   *       reactivando VENCIDO y mora en los pasos siguientes.
   *   (1) VENCIDO: toda cuota PENDIENTE cuya FECHA EFECTIVA < hoy, de matrículas no anuladas y
   *       programEnrollments activos, años NO CERRADO. Una cuota congelada por un compromiso VIGENTE
   *       (newDueDate futura) NO se marca.
   *   (2) Mora (solo si BillingSettings.autoLateFee): pensiones escolares VENCIDO, sin mora, sin
   *       exoneración, con la gracia cumplida (isLateFeeEligible) y NO congeladas por un compromiso.
   * El job automático NO escribe AuditLog (no hay actor); la corrida manual audita el resumen aparte.
   */
  async run(): Promise<LateFeesResult> {
    const today = todayISO();
    const threshold = isoToDate(today);

    return this.prisma.$transaction(async (tx) => {
      // (0) Incumplimiento de compromisos VIGENTE (al día siguiente de la fecha pactada, sin gracia).
      const vigentes = await tx.paymentCommitment.findMany({
        where: { status: 'VIGENTE' },
        select: {
          id: true,
          items: {
            select: {
              newDueDate: true,
              installment: { select: { status: true } },
            },
          },
        },
      });
      const breachedIds = vigentes
        .filter((c) =>
          c.items.some(
            (it) =>
              it.installment.status !== 'PAGADO' &&
              it.installment.status !== 'ANULADO' &&
              dateToISO(it.newDueDate) < today,
          ),
        )
        .map((c) => c.id);
      if (breachedIds.length > 0) {
        await tx.paymentCommitment.updateMany({
          where: { id: { in: breachedIds } },
          data: { status: 'INCUMPLIDO', breachedAt: new Date() },
        });
      }

      // (1) Materializa VENCIDO por fecha efectiva. findMany candidatos + filtra congeladas.
      const pendingPast = await tx.installment.findMany({
        where: {
          status: 'PENDIENTE',
          dueDate: { lt: threshold },
          // La cuota manda por su estado: una matrícula anulada dejó sus cuotas en ANULADO (no
          // PENDIENTE), y la deuda viva de un retirado debe materializar VENCIDO y su mora igual.
          OR: [
            { enrollment: { academicYear: { status: { not: 'CERRADO' } } } },
            {
              programEnrollment: {
                program: { academicYear: { status: { not: 'CERRADO' } } },
              },
            },
          ],
        },
        select: { id: true },
      });
      const pendingIds = pendingPast.map((i) => i.id);
      const overrides1 = await commitmentOverrides(tx, pendingIds);
      // Una cuota con override VIGENTE tiene newDueDate futura ⇒ sigue congelada, no se marca.
      const overdueIds = pendingIds.filter((id) => {
        const ov = overrides1.get(id);
        return !ov || dateToISO(ov.newDueDate) < today;
      });
      if (overdueIds.length > 0) {
        await tx.installment.updateMany({
          where: { id: { in: overdueIds } },
          data: { status: 'VENCIDO' },
        });
      }

      // (2) Mora fija sobre pensiones escolares. Solo si autoLateFee está activo.
      let feesApplied = 0;
      const settings = await tx.billingSettings.findUnique({ where: { id: 1 } });
      if (settings?.autoLateFee) {
        const candidates = await tx.installment.findMany({
          where: {
            type: 'PENSION',
            enrollmentId: { not: null },
            status: 'VENCIDO',
            lateFeeAmount: 0,
            lateFeeAppliedAt: null,
            lateFeeExoneratedAt: null,
          },
          select: { id: true, dueDate: true, status: true },
        });
        // Congeladas por un compromiso VIGENTE: no reciben mora nueva.
        const frozen = await commitmentOverrides(
          tx,
          candidates.map((c) => c.id),
        );
        const eligibleIds = candidates
          .filter(
            (c) =>
              !frozen.has(c.id) &&
              isLateFeeEligible({
                type: 'PENSION',
                source: 'ESCOLAR',
                status: c.status,
                dueDate: dateToISO(c.dueDate),
                graceDays: settings.graceDays,
                today,
                lateFeeCents: 0,
                exonerated: false,
              }),
          )
          .map((c) => c.id);
        if (eligibleIds.length > 0) {
          const applied = await tx.installment.updateMany({
            where: { id: { in: eligibleIds } },
            data: {
              lateFeeAmount: new Prisma.Decimal(settings.lateFeeAmount),
              lateFeeAppliedAt: new Date(),
            },
          });
          feesApplied = applied.count;
        }
      }

      return {
        markedOverdue: overdueIds.length,
        feesApplied,
        commitmentsBreached: breachedIds.length,
      };
    });
  }
}
