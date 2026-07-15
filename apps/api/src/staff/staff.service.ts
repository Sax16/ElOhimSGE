import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  type StaffCreateInput,
  type StaffListQuery,
  type StaffUpdateInput,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { nextCode } from '../common/code-counter.util';
import { dateToISO, isoToDate } from '../common/installment-view.util';
import { effectiveSchedule, type MarkingGroupRow } from './effective-schedule.util';

const staffSelect = {
  id: true,
  code: true,
  fullName: true,
  dni: true,
  phone: true,
  email: true,
  role: true,
  area: true,
  employmentType: true,
  status: true,
  baseSalary: true,
  hireDate: true,
  useIndividualSchedule: true,
  individualEntryTime: true,
  individualToleranceMin: true,
  userId: true,
  pensionScheme: { select: { id: true, name: true, kind: true } },
} satisfies Prisma.StaffSelect;

type StaffRow = Prisma.StaffGetPayload<{ select: typeof staffSelect }>;

// '' del formulario → null en la BD (campos opcionales).
function blankToNull(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  return value === '' ? null : value;
}

@Injectable()
export class StaffService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private toDto(staff: StaffRow, groups: MarkingGroupRow[]) {
    return {
      id: staff.id,
      code: staff.code,
      fullName: staff.fullName,
      dni: staff.dni,
      phone: staff.phone,
      email: staff.email,
      role: staff.role,
      area: staff.area,
      employmentType: staff.employmentType,
      status: staff.status,
      baseSalary: staff.baseSalary.toFixed(2),
      hireDate: staff.hireDate ? dateToISO(staff.hireDate) : null,
      pensionScheme: staff.pensionScheme,
      useIndividualSchedule: staff.useIndividualSchedule,
      individualEntryTime: staff.individualEntryTime,
      individualToleranceMin: staff.individualToleranceMin,
      userId: staff.userId,
      effectiveSchedule: effectiveSchedule(staff, groups),
    };
  }

  private async markingGroups(): Promise<MarkingGroupRow[]> {
    return this.prisma.markingGroup.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { name: true, entryTime: true, toleranceMin: true, roles: true },
    });
  }

  async list(query: StaffListQuery) {
    const where: Prisma.StaffWhereInput = {};
    if (query.role) where.role = query.role;
    if (query.status) where.status = query.status;
    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { code: { contains: term, mode: 'insensitive' } },
        { fullName: { contains: term, mode: 'insensitive' } },
        { dni: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [staff, groups] = await Promise.all([
      this.prisma.staff.findMany({
        where,
        orderBy: { code: 'asc' },
        select: staffSelect,
      }),
      this.markingGroups(),
    ]);
    return staff.map((s) => this.toDto(s, groups));
  }

  async findOne(id: string) {
    const [staff, groups] = await Promise.all([
      this.prisma.staff.findUnique({ where: { id }, select: staffSelect }),
      this.markingGroups(),
    ]);
    if (!staff) throw new NotFoundException('Empleado no encontrado');
    return this.toDto(staff, groups);
  }

  async catalogs() {
    const [pensionSchemes, markingGroups] = await Promise.all([
      this.prisma.pensionScheme.findMany({
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          kind: true,
          active: true,
          sortOrder: true,
          onpRatePct: true,
          fundRatePct: true,
          commissionRatePct: true,
          insuranceRatePct: true,
        },
      }),
      this.prisma.markingGroup.findMany({
        orderBy: { sortOrder: 'asc' },
        select: { id: true, name: true, entryTime: true, toleranceMin: true, roles: true, sortOrder: true },
      }),
    ]);
    return {
      pensionSchemes: pensionSchemes.map((p) => ({
        id: p.id,
        name: p.name,
        kind: p.kind,
        active: p.active,
        sortOrder: p.sortOrder,
        onpRatePct: p.onpRatePct ? p.onpRatePct.toFixed(2) : null,
        fundRatePct: p.fundRatePct ? p.fundRatePct.toFixed(2) : null,
        commissionRatePct: p.commissionRatePct ? p.commissionRatePct.toFixed(2) : null,
        insuranceRatePct: p.insuranceRatePct ? p.insuranceRatePct.toFixed(2) : null,
      })),
      markingGroups,
    };
  }

  async create(input: StaffCreateInput, actorId: string) {
    const scheme = await this.prisma.pensionScheme.findUnique({
      where: { id: input.pensionSchemeId },
      select: { id: true },
    });
    if (!scheme) throw new NotFoundException('Régimen pensionario no encontrado');

    // Con horario individual conservamos hora/tolerancia; sin él, se limpian a null.
    const individual = input.useIndividualSchedule ?? false;
    const entryTime = individual ? blankToNull(input.individualEntryTime) : null;
    const toleranceMin =
      individual && input.individualToleranceMin !== undefined && input.individualToleranceMin !== null
        ? input.individualToleranceMin
        : null;

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        const code = await nextCode(tx, 'staff', 'P-', 3, 1);
        const staff = await tx.staff.create({
          data: {
            code,
            fullName: input.fullName,
            dni: input.dni,
            phone: blankToNull(input.phone),
            email: blankToNull(input.email),
            role: input.role,
            area: blankToNull(input.area),
            employmentType: input.employmentType,
            status: input.status ?? 'ACTIVO',
            baseSalary: new Prisma.Decimal(String(input.baseSalary)),
            hireDate: input.hireDate ? isoToDate(input.hireDate) : null,
            pensionSchemeId: input.pensionSchemeId,
            useIndividualSchedule: individual,
            individualEntryTime: entryTime,
            individualToleranceMin: toleranceMin,
          },
          select: staffSelect,
        });
        await this.audit.log(
          {
            userId: actorId,
            action: 'staff.create',
            entity: 'Staff',
            entityId: staff.id,
            payload: { code: staff.code, dni: staff.dni, role: staff.role },
          },
          tx,
        );
        return staff;
      });
      return this.toDto(created, await this.markingGroups());
    } catch (error) {
      throw this.mapConflict(error, 'Ya existe un empleado con ese DNI');
    }
  }

  async update(id: string, input: StaffUpdateInput, actorId: string) {
    const existing = await this.prisma.staff.findUnique({
      where: { id },
      select: { id: true, useIndividualSchedule: true },
    });
    if (!existing) throw new NotFoundException('Empleado no encontrado');

    if (input.pensionSchemeId !== undefined) {
      const scheme = await this.prisma.pensionScheme.findUnique({
        where: { id: input.pensionSchemeId },
        select: { id: true },
      });
      if (!scheme) throw new NotFoundException('Régimen pensionario no encontrado');
    }

    const data: Prisma.StaffUpdateInput = {};
    const payload: Record<string, unknown> = {};

    if (input.fullName !== undefined) {
      data.fullName = input.fullName;
      payload.fullName = input.fullName;
    }
    if (input.dni !== undefined) {
      data.dni = input.dni;
      payload.dni = input.dni;
    }
    if (input.phone !== undefined) {
      data.phone = blankToNull(input.phone);
      payload.phone = data.phone;
    }
    if (input.email !== undefined) {
      data.email = blankToNull(input.email);
      payload.email = data.email;
    }
    if (input.role !== undefined) {
      data.role = input.role;
      payload.role = input.role;
    }
    if (input.area !== undefined) {
      data.area = blankToNull(input.area);
      payload.area = data.area;
    }
    if (input.employmentType !== undefined) {
      data.employmentType = input.employmentType;
      payload.employmentType = input.employmentType;
    }
    if (input.status !== undefined) {
      data.status = input.status;
      payload.status = input.status;
    }
    if (input.baseSalary !== undefined) {
      data.baseSalary = new Prisma.Decimal(String(input.baseSalary));
      payload.baseSalary = data.baseSalary.toString();
    }
    if (input.hireDate !== undefined) {
      data.hireDate = input.hireDate ? isoToDate(input.hireDate) : null;
      payload.hireDate = input.hireDate || null;
    }
    if (input.pensionSchemeId !== undefined) {
      data.pensionScheme = { connect: { id: input.pensionSchemeId } };
      payload.pensionSchemeId = input.pensionSchemeId;
    }

    // Horario: si el update fija useIndividualSchedule, se decide; si no viene pero llegan
    // hora/tolerancia sueltas, se respeta el estado actual del empleado.
    const willBeIndividual =
      input.useIndividualSchedule !== undefined
        ? input.useIndividualSchedule
        : existing.useIndividualSchedule;
    if (input.useIndividualSchedule !== undefined) {
      data.useIndividualSchedule = input.useIndividualSchedule;
      payload.useIndividualSchedule = input.useIndividualSchedule;
    }
    if (!willBeIndividual) {
      // Sin horario individual: se limpian hora y tolerancia.
      data.individualEntryTime = null;
      data.individualToleranceMin = null;
    } else {
      if (input.individualEntryTime !== undefined) {
        data.individualEntryTime = blankToNull(input.individualEntryTime);
        payload.individualEntryTime = data.individualEntryTime;
      }
      if (input.individualToleranceMin !== undefined) {
        data.individualToleranceMin = input.individualToleranceMin ?? null;
        payload.individualToleranceMin = data.individualToleranceMin;
      }
    }

    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        const staff = await tx.staff.update({ where: { id }, data, select: staffSelect });
        await this.audit.log(
          {
            userId: actorId,
            action: 'staff.update',
            entity: 'Staff',
            entityId: id,
            payload: payload as Prisma.InputJsonValue,
          },
          tx,
        );
        return staff;
      });
      return this.toDto(updated, await this.markingGroups());
    } catch (error) {
      throw this.mapConflict(error, 'Ya existe un empleado con ese DNI');
    }
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
