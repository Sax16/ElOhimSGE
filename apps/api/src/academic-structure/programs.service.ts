import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  type PeriodUpdateInput,
  type ProgramCreateInput,
  type ProgramUpdateInput,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { YearAccessService } from './year-access.service';

@Injectable()
export class ProgramsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly access: YearAccessService,
  ) {}

  // ===== Programas =====

  async findAll(yearId: string) {
    const programs = await this.prisma.program.findMany({
      where: { academicYearId: yearId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { enrollmentPrograms: true } } },
    });
    return programs.map((program) => {
      const { _count, ...rest } = program;
      return { ...rest, enrolled: _count.enrollmentPrograms };
    });
  }

  async create(input: ProgramCreateInput, actorId: string) {
    await this.access.assertYearOpenById(input.academicYearId);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const program = await tx.program.create({
          data: {
            academicYearId: input.academicYearId,
            name: input.name,
            type: input.type,
            scheduleText: input.scheduleText,
            capacity: input.capacity,
            enrollmentFee: input.enrollmentFee,
            monthlyFee: input.monthlyFee,
            status: input.status,
          },
        });
        await this.audit.log(
          {
            userId: actorId,
            action: 'program.create',
            entity: 'Program',
            entityId: program.id,
            payload: { name: program.name, type: program.type, academicYearId: input.academicYearId },
          },
          tx,
        );
        return program;
      });
    } catch (error) {
      throw this.mapConflict(error, 'Ya existe un programa con ese nombre en el año');
    }
  }

  async update(id: string, input: ProgramUpdateInput, actorId: string) {
    await this.access.assertYearOpenByProgram(id);
    const data: Prisma.ProgramUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.type !== undefined) data.type = input.type;
    if (input.scheduleText !== undefined) data.scheduleText = input.scheduleText;
    if (input.capacity !== undefined) data.capacity = input.capacity;
    if (input.enrollmentFee !== undefined) data.enrollmentFee = input.enrollmentFee;
    if (input.monthlyFee !== undefined) data.monthlyFee = input.monthlyFee;
    if (input.status !== undefined) data.status = input.status;
    try {
      return await this.prisma.$transaction(async (tx) => {
        const program = await tx.program.update({ where: { id }, data });
        await this.audit.log(
          {
            userId: actorId,
            action: 'program.update',
            entity: 'Program',
            entityId: id,
            payload: data as Prisma.InputJsonValue,
          },
          tx,
        );
        return program;
      });
    } catch (error) {
      throw this.mapConflict(error, 'Ya existe un programa con ese nombre en el año');
    }
  }

  // ===== Periodos =====

  async periods(yearId: string) {
    const year = await this.prisma.academicYear.findUnique({ where: { id: yearId } });
    if (!year) throw new NotFoundException('Año académico no encontrado');
    return this.prisma.period.findMany({
      where: { academicYearId: yearId },
      orderBy: { order: 'asc' },
    });
  }

  async updatePeriod(id: string, input: PeriodUpdateInput, actorId: string) {
    // Editar fechas de un periodo cerrado se permite (no lo reabre); lo que bloquea es el AÑO cerrado.
    await this.access.assertYearOpenByPeriod(id);
    const data: Prisma.PeriodUpdateInput = {};
    if (input.startDate !== undefined) data.startDate = input.startDate;
    if (input.endDate !== undefined) data.endDate = input.endDate;
    if (input.status !== undefined) data.status = input.status;
    return this.prisma.$transaction(async (tx) => {
      const period = await tx.period.update({ where: { id }, data });
      await this.audit.log(
        {
          userId: actorId,
          action: 'period.update',
          entity: 'Period',
          entityId: id,
          payload: this.periodPayload(input),
        },
        tx,
      );
      return period;
    });
  }

  private periodPayload(input: PeriodUpdateInput): Prisma.InputJsonValue {
    const payload: Record<string, unknown> = {};
    if (input.startDate !== undefined) payload.startDate = input.startDate.toISOString();
    if (input.endDate !== undefined) payload.endDate = input.endDate.toISOString();
    if (input.status !== undefined) payload.status = input.status;
    return payload as Prisma.InputJsonValue;
  }

  private mapConflict(error: unknown, message: string): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new ConflictException(message);
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return new NotFoundException('Registro no encontrado');
    }
    return error instanceof Error ? error : new Error(String(error));
  }
}
