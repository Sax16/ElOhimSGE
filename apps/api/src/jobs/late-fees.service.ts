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
          `Job de mora: ${result.markedOverdue} cuotas → VENCIDO, ${result.feesApplied} moras cargadas`,
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
   *   (1) VENCIDO: toda cuota PENDIENTE con dueDate < hoy de matrículas no anuladas y
   *       programEnrollments activos, cuyos años NO estén CERRADO.
   *   (2) Mora (solo si BillingSettings.autoLateFee): pensiones escolares VENCIDO, sin mora,
   *       sin exoneración, con la gracia ya cumplida (isLateFeeEligible de shared).
   * El job automático NO escribe AuditLog (no hay actor); la corrida manual audita aparte.
   */
  async run(): Promise<LateFeesResult> {
    const today = todayISO();
    const threshold = isoToDate(today);

    return this.prisma.$transaction(async (tx) => {
      // (1) Materializa VENCIDO. findMany + updateMany por id (relaciones no van en updateMany).
      const toOverdue = await tx.installment.findMany({
        where: {
          status: 'PENDIENTE',
          dueDate: { lt: threshold },
          OR: [
            { enrollment: { canceledAt: null, academicYear: { status: { not: 'CERRADO' } } } },
            {
              programEnrollment: {
                canceledAt: null,
                program: { academicYear: { status: { not: 'CERRADO' } } },
              },
            },
          ],
        },
        select: { id: true },
      });
      const overdueIds = toOverdue.map((i) => i.id);
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
        const eligibleIds = candidates
          .filter((c) =>
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

      return { markedOverdue: overdueIds.length, feesApplied };
    });
  }
}
