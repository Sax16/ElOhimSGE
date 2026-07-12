import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  fromCents,
  type RefundCreateInput,
  type RefundExecuteInput,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { nextCode } from '../common/code-counter.util';
import { decimalToCents } from '../common/money.util';
import { todayISO, isoToDate } from '../common/installment-view.util';
import { recalcEnrollmentStatuses } from '../common/enrollment-status.util';
import { recalcCommitmentsForInstallments } from '../common/commitment-recalc.util';
import { type JwtUser } from '../auth/decorators/current-user.decorator';

function money(value: Prisma.Decimal): string {
  return value.toFixed(2);
}
function fullName(s: {
  firstNames: string;
  paternalLastName: string;
  maternalLastName: string | null;
}): string {
  return [s.firstNames, s.paternalLastName, s.maternalLastName].filter(Boolean).join(' ');
}

const refundInclude = {
  receipt: { select: { code: true } },
  student: { select: { firstNames: true, paternalLastName: true, maternalLastName: true } },
  requestedBy: { select: { fullName: true } },
  approvedBy: { select: { fullName: true } },
  executedBy: { select: { fullName: true } },
  targetInstallment: { select: { concept: true } },
} satisfies Prisma.RefundInclude;

type RefundRow = Prisma.RefundGetPayload<{ include: typeof refundInclude }>;

/**
 * Devoluciones (R2 — E3): flujo de dos pasos vinculado a un recibo EMITIDO.
 * Secretaría solicita → Admin aprueba/rechaza → Caja ejecuta (efectivo / transferencia /
 * aplicación exacta a una cuota pendiente del mismo estudiante). Sin saldo a favor.
 */
@Injectable()
export class RefundsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private mapRefund(r: RefundRow) {
    return {
      id: r.id,
      code: r.code,
      receiptId: r.receiptId,
      receiptCode: r.receipt.code,
      studentId: r.studentId,
      studentName: fullName(r.student),
      amount: money(r.amount),
      reason: r.reason,
      method: r.method,
      targetInstallmentId: r.targetInstallmentId,
      targetConcept: r.targetInstallment?.concept ?? null,
      status: r.status,
      requestedByName: r.requestedBy.fullName,
      approvedByName: r.approvedBy?.fullName ?? null,
      rejectReason: r.rejectReason,
      executedByName: r.executedBy?.fullName ?? null,
      executedAt: r.executedAt ? r.executedAt.toISOString() : null,
      operationNumber: r.operationNumber,
      createdAt: r.createdAt.toISOString(),
    };
  }

  private async getDto(id: string) {
    const row = await this.prisma.refund.findUnique({ where: { id }, include: refundInclude });
    if (!row) throw new NotFoundException('Devolución no encontrada');
    return this.mapRefund(row);
  }

  // GET /cashier/refunds?status&page&pageSize
  async list(status: string | undefined, page: number, pageSize: number) {
    const where: Prisma.RefundWhereInput = {};
    if (status) where.status = status as Prisma.RefundWhereInput['status'];
    const total = await this.prisma.refund.count({ where });
    const rows = await this.prisma.refund.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: refundInclude,
    });
    return { total, items: rows.map((r) => this.mapRefund(r)) };
  }

  // POST /cashier/refunds — solicita (PENDIENTE_APROBACION). Valida recibo, monto y (si aplica) cuota destino.
  async create(input: RefundCreateInput, actor: JwtUser) {
    const id = await this.prisma.$transaction(async (tx) => {
      const receipt = await tx.receipt.findUnique({
        where: { id: input.receiptId },
        select: { id: true, status: true, studentId: true, totalAmount: true },
      });
      if (!receipt) throw new NotFoundException('Recibo no encontrado');
      if (receipt.status !== 'EMITIDO') {
        throw new ConflictException('Solo se puede devolver sobre un recibo emitido');
      }

      const amountCents = decimalToCents(input.amount);
      if (amountCents <= 0) throw new BadRequestException('El monto debe ser mayor a cero');
      if (amountCents > decimalToCents(receipt.totalAmount)) {
        throw new BadRequestException('El monto no puede superar el total del recibo');
      }

      // Aplicación a cuota: cuota del MISMO estudiante, no pagada/anulada, monto exacto.
      if (input.method === 'APLICACION_CUOTA') {
        await this.validateTargetInstallment(tx, input.targetInstallmentId!, receipt.studentId, amountCents);
      }

      const code = await nextCode(tx, 'refund', 'D-', 4);
      const created = await tx.refund.create({
        data: {
          code,
          receiptId: receipt.id,
          studentId: receipt.studentId,
          requestedById: actor.sub,
          amount: new Prisma.Decimal(fromCents(amountCents)),
          reason: input.reason,
          method: input.method,
          targetInstallmentId:
            input.method === 'APLICACION_CUOTA' ? input.targetInstallmentId! : null,
          status: 'PENDIENTE_APROBACION',
        },
        select: { id: true },
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'refund.request',
          entity: 'Refund',
          entityId: created.id,
          payload: {
            code,
            receiptId: receipt.id,
            amount: fromCents(amountCents),
            method: input.method,
          },
        },
        tx,
      );
      return created.id;
    });
    return this.getDto(id);
  }

  // Valida que la cuota destino sea del estudiante, cobrable y de monto EXACTO. Devuelve la cuota.
  private async validateTargetInstallment(
    tx: Prisma.TransactionClient,
    targetInstallmentId: string,
    studentId: string,
    amountCents: number,
  ) {
    const target = await tx.installment.findUnique({
      where: { id: targetInstallmentId },
      select: {
        id: true,
        status: true,
        amount: true,
        lateFeeAmount: true,
        enrollment: { select: { studentId: true } },
        programEnrollment: { select: { studentId: true } },
      },
    });
    if (!target) throw new NotFoundException('Cuota destino no encontrada');
    const ownerStudentId = target.enrollment?.studentId ?? target.programEnrollment?.studentId;
    if (ownerStudentId !== studentId) {
      throw new BadRequestException('La cuota destino no pertenece al estudiante del recibo');
    }
    if (target.status !== 'PENDIENTE' && target.status !== 'VENCIDO') {
      throw new ConflictException('La cuota destino ya no está pendiente');
    }
    const targetCents = decimalToCents(target.amount) + decimalToCents(target.lateFeeAmount);
    if (targetCents !== amountCents) {
      throw new ConflictException(
        `El monto no coincide con la cuota destino (${money(target.amount)} + mora). ` +
          'La aplicación a cuota exige coincidencia exacta.',
      );
    }
    return target;
  }

  // POST /cashier/refunds/:id/approve (ADMIN) → APROBADA.
  async approve(id: string, actor: JwtUser) {
    if (actor.role !== 'ADMIN') {
      throw new ForbiddenException('Solo un administrador puede aprobar devoluciones');
    }
    await this.prisma.$transaction(async (tx) => {
      const refund = await tx.refund.findUnique({ where: { id }, select: { status: true } });
      if (!refund) throw new NotFoundException('Devolución no encontrada');
      if (refund.status !== 'PENDIENTE_APROBACION') {
        throw new ConflictException('La devolución ya no está pendiente de aprobación');
      }
      await tx.refund.update({
        where: { id },
        data: { status: 'APROBADA', approvedById: actor.sub, approvedAt: new Date() },
      });
      await this.audit.log(
        { userId: actor.sub, action: 'refund.approve', entity: 'Refund', entityId: id },
        tx,
      );
    });
    return this.getDto(id);
  }

  // POST /cashier/refunds/:id/reject (ADMIN) → RECHAZADA.
  async reject(id: string, reason: string, actor: JwtUser) {
    if (actor.role !== 'ADMIN') {
      throw new ForbiddenException('Solo un administrador puede rechazar devoluciones');
    }
    await this.prisma.$transaction(async (tx) => {
      const refund = await tx.refund.findUnique({ where: { id }, select: { status: true } });
      if (!refund) throw new NotFoundException('Devolución no encontrada');
      if (refund.status !== 'PENDIENTE_APROBACION') {
        throw new ConflictException('La devolución ya no está pendiente de aprobación');
      }
      await tx.refund.update({
        where: { id },
        data: { status: 'RECHAZADA', rejectReason: reason },
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'refund.reject',
          entity: 'Refund',
          entityId: id,
          payload: { reason },
        },
        tx,
      );
    });
    return this.getDto(id);
  }

  // POST /cashier/refunds/:id/execute → DEVUELTA. Según el método pactado.
  async execute(id: string, input: RefundExecuteInput, actor: JwtUser) {
    await this.prisma.$transaction(async (tx) => {
      const refund = await tx.refund.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          method: true,
          amount: true,
          studentId: true,
          targetInstallmentId: true,
        },
      });
      if (!refund) throw new NotFoundException('Devolución no encontrada');
      if (refund.status !== 'APROBADA') {
        throw new ConflictException('Solo se puede ejecutar una devolución aprobada');
      }

      const amountCents = decimalToCents(refund.amount);
      let cashSessionId: string | null = null;
      const todayDate = isoToDate(todayISO());

      if (refund.method === 'EFECTIVO') {
        // Exige la caja del día ABIERTA; el egreso descuenta del arqueo.
        const session = await tx.cashSession.findUnique({
          where: { date: todayDate },
          select: { id: true, status: true },
        });
        if (!session || session.status !== 'ABIERTA') {
          throw new ConflictException('La caja del día no está abierta');
        }
        cashSessionId = session.id;
      } else if (refund.method === 'TRANSFERENCIA') {
        // No exige caja; si hay caja de hoy, se enlaza para que figure en sus movimientos.
        const session = await tx.cashSession.findUnique({
          where: { date: todayDate },
          select: { id: true },
        });
        cashSessionId = session?.id ?? null;
      } else {
        // APLICACION_CUOTA: revalida y marca la cuota PAGADO (como un cobro normal), sin recibo.
        const target = await this.validateTargetInstallment(
          tx,
          refund.targetInstallmentId!,
          refund.studentId,
          amountCents,
        );
        await tx.installment.update({ where: { id: target.id }, data: { status: 'PAGADO' } });
        const enrollmentId = (
          await tx.installment.findUnique({
            where: { id: target.id },
            select: { enrollmentId: true },
          })
        )?.enrollmentId;
        if (enrollmentId) await recalcEnrollmentStatuses(tx, [enrollmentId]);
        const transitions = await recalcCommitmentsForInstallments(tx, [target.id]);
        for (const t of transitions) {
          await this.audit.log(
            {
              userId: actor.sub,
              action: t.to === 'CUMPLIDO' ? 'commitment.fulfill' : 'commitment.reopen',
              entity: 'PaymentCommitment',
              entityId: t.commitmentId,
              payload: { code: t.code, from: t.from, to: t.to },
            },
            tx,
          );
        }
      }

      await tx.refund.update({
        where: { id },
        data: {
          status: 'DEVUELTA',
          executedById: actor.sub,
          executedAt: new Date(),
          cashSessionId,
          operationNumber:
            refund.method === 'TRANSFERENCIA' ? input.operationNumber ?? null : null,
        },
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'refund.execute',
          entity: 'Refund',
          entityId: id,
          payload: {
            method: refund.method,
            amount: fromCents(amountCents),
            cashSessionId,
          },
        },
        tx,
      );
    });
    return this.getDto(id);
  }
}
