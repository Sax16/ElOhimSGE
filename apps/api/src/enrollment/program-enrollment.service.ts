import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { fromCents, type ProgramEnrollInput, type ScheduleItem } from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { centsToDecimal, decimalToCents } from '../common/money.util';
import { programInstallmentConcept, programScheduleItems } from './program-schedule.util';

type DbClient = Prisma.TransactionClient | PrismaService;

// Fecha de hoy (yyyy-mm-dd) con componentes locales — sin corrimiento por TZ.
function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isoToDate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

// Datos de una edición de programa + su cronograma resuelto para inscribir.
interface ResolvedProgramEnrollment {
  program: {
    id: string;
    name: string;
    monthlyFee: Prisma.Decimal;
    enrollmentFee: Prisma.Decimal;
    capacity: number;
  };
  studentId: string;
  items: ScheduleItem[];
}

@Injectable()
export class ProgramEnrollmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private async activeYearId(): Promise<string> {
    const year = await this.prisma.academicYear.findFirst({
      where: { status: 'ACTIVO' },
      select: { id: true },
    });
    if (!year) throw new NotFoundException('No hay un año académico activo');
    return year.id;
  }

  private serializeItem(item: ScheduleItem) {
    return {
      type: item.type,
      concept: item.concept,
      sequence: item.sequence,
      dueDate: item.dueDate,
      baseCents: item.baseCents,
      totalCents: item.totalCents,
      base: fromCents(item.baseCents),
      amount: fromCents(item.totalCents),
    };
  }

  /**
   * Valida la inscripción a un programa y resuelve su cronograma (server-side, nunca del cliente):
   * programa ACTIVO del año activo, estudiante con matrícula ESCOLAR activa del mismo año, no inscrito
   * ya (activo) y con vigencia cobrable. La preview y la creación comparten esta resolución.
   */
  private async resolve(
    client: DbClient,
    programId: string,
    input: ProgramEnrollInput,
    opts: { enrollmentDate: string; checkCapacity: boolean },
  ): Promise<ResolvedProgramEnrollment> {
    const activeYearId = await this.activeYearId();

    const program = await client.program.findUnique({
      where: { id: programId },
      select: {
        id: true,
        name: true,
        monthlyFee: true,
        enrollmentFee: true,
        startMonth: true,
        endMonth: true,
        capacity: true,
        status: true,
        academicYearId: true,
        academicYear: { select: { name: true } },
      },
    });
    if (!program) throw new NotFoundException('Programa no encontrado');
    if (program.academicYearId !== activeYearId) {
      throw new BadRequestException('El programa no pertenece al año activo');
    }
    if (program.status !== 'ACTIVO') {
      throw new BadRequestException('El programa no está activo');
    }

    const settings = await client.billingSettings.findUnique({ where: { id: 1 } });
    if (!settings) throw new NotFoundException('Falta la configuración de cobranza');

    // El estudiante debe existir y tener matrícula ESCOLAR activa del mismo año.
    const student = await client.student.findUnique({
      where: { id: input.studentId },
      select: { id: true },
    });
    if (!student) throw new NotFoundException('Estudiante no encontrado');
    const schoolEnrollment = await client.enrollment.count({
      where: { studentId: input.studentId, academicYearId: activeYearId, canceledAt: null },
    });
    if (schoolEnrollment === 0) {
      throw new BadRequestException('El estudiante necesita matrícula activa');
    }

    // No inscrito ya (activo) en ESTE programa.
    const already = await client.programEnrollment.findFirst({
      where: { programId, studentId: input.studentId, canceledAt: null },
      select: { id: true },
    });
    if (already) throw new ConflictException('El estudiante ya está inscrito en este programa');

    if (opts.checkCapacity) {
      const enrolled = await client.programEnrollment.count({
        where: { programId, canceledAt: null },
      });
      if (enrolled >= program.capacity) throw new ConflictException('El programa está lleno');
    }

    const items = programScheduleItems(program, {
      enrollmentDate: opts.enrollmentDate,
      yearName: Number(program.academicYear.name),
      dueDayOfMonth: settings.dueDayOfMonth,
      cutoffDay: settings.transferCutoffDay,
    });
    if (!items.some((i) => i.type === 'PENSION')) {
      throw new BadRequestException('El programa ya finalizó');
    }

    return {
      program: {
        id: program.id,
        name: program.name,
        monthlyFee: program.monthlyFee,
        enrollmentFee: program.enrollmentFee,
        capacity: program.capacity,
      },
      studentId: student.id,
      items,
    };
  }

  // POST /api/programs/:id/enrollments/preview — cronograma sin persistir.
  async preview(programId: string, input: ProgramEnrollInput) {
    const resolved = await this.resolve(this.prisma, programId, input, {
      enrollmentDate: todayISO(),
      checkCapacity: false,
    });
    const totalCents = resolved.items.reduce((sum, i) => sum + i.totalCents, 0);
    return {
      items: resolved.items.map((i) => this.serializeItem(i)),
      totalCents,
      total: fromCents(totalCents),
    };
  }

  // POST /api/programs/:id/enrollments — inscribe (transacción; recálculo server-side).
  async create(programId: string, input: ProgramEnrollInput, actorId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const resolved = await this.resolve(tx, programId, input, {
          enrollmentDate: todayISO(),
          checkCapacity: true,
        });

        const programEnrollment = await tx.programEnrollment.create({
          data: {
            programId: resolved.program.id,
            studentId: resolved.studentId,
            registeredById: actorId,
            monthlyFeeSnapshot: resolved.program.monthlyFee,
            enrollmentFeeSnapshot: resolved.program.enrollmentFee,
          },
        });

        let totalCents = 0;
        for (const item of resolved.items) {
          await tx.installment.create({
            data: {
              programEnrollmentId: programEnrollment.id,
              type: item.type,
              concept: programInstallmentConcept(item, resolved.program.name),
              sequence: item.sequence,
              dueDate: isoToDate(item.dueDate),
              baseAmount: centsToDecimal(item.baseCents),
              discountAmount: centsToDecimal(item.discountCents),
              programsAmount: centsToDecimal(item.programsCents),
              amount: centsToDecimal(item.totalCents),
              status: 'PENDIENTE',
            },
          });
          totalCents += item.totalCents;
        }

        await this.audit.log(
          {
            userId: actorId,
            action: 'program_enrollment.create',
            entity: 'ProgramEnrollment',
            entityId: programEnrollment.id,
            payload: {
              programId: resolved.program.id,
              studentId: resolved.studentId,
              installments: resolved.items.length,
              totalCents,
            },
          },
          tx,
        );

        return {
          id: programEnrollment.id,
          programId: resolved.program.id,
          schedule: resolved.items.map((i) => this.serializeItem(i)),
          total: fromCents(totalCents),
        };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Unique (programId, studentId): también cubre una inscripción previa cancelada.
        throw new ConflictException('El estudiante ya tiene una inscripción en esta edición del programa');
      }
      throw error;
    }
  }

  // GET /api/programs/:id/enrollments — roster del programa (activas y canceladas, con badge).
  async roster(programId: string) {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      select: { id: true },
    });
    if (!program) throw new NotFoundException('Programa no encontrado');

    const rows = await this.prisma.programEnrollment.findMany({
      where: { programId },
      orderBy: { enrolledAt: 'asc' },
      select: {
        id: true,
        enrolledAt: true,
        canceledAt: true,
        student: { select: { id: true, code: true, firstNames: true, lastNames: true } },
        installments: { select: { status: true, amount: true, dueDate: true } },
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return rows.map((r) => {
      let paidCount = 0;
      let debtCents = 0;
      for (const inst of r.installments) {
        if (inst.status === 'PAGADO') paidCount += 1;
        const overdue =
          inst.status === 'VENCIDO' || (inst.status === 'PENDIENTE' && inst.dueDate < today);
        if (overdue) debtCents += decimalToCents(inst.amount);
      }
      return {
        id: r.id,
        student: r.student,
        enrolledAt: r.enrolledAt,
        canceledAt: r.canceledAt,
        paidCount,
        totalCount: r.installments.length,
        debtCents,
      };
    });
  }

  // POST /api/program-enrollments/:id/cancel — cancela la inscripción y anula sus cuotas pendientes.
  async cancel(id: string, reason: string, actorId: string) {
    const enrollment = await this.prisma.programEnrollment.findUnique({
      where: { id },
      select: { id: true, canceledAt: true },
    });
    if (!enrollment) throw new NotFoundException('Inscripción no encontrada');
    if (enrollment.canceledAt) throw new BadRequestException('La inscripción ya está cancelada');

    const now = new Date();
    return this.prisma.$transaction(async (tx) => {
      await tx.programEnrollment.update({
        where: { id },
        data: { canceledAt: now, cancelReason: reason },
      });
      const anulled = await tx.installment.updateMany({
        where: { programEnrollmentId: id, status: 'PENDIENTE' },
        data: { status: 'ANULADO', cancelReason: reason, canceledAt: now, canceledById: actorId },
      });
      await this.audit.log(
        {
          userId: actorId,
          action: 'program_enrollment.cancel',
          entity: 'ProgramEnrollment',
          entityId: id,
          payload: { reason, canceledInstallments: anulled.count },
        },
        tx,
      );
      return { id, canceledAt: now, canceledInstallments: anulled.count };
    });
  }
}
