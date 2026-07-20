import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomInt } from 'node:crypto';
import bcrypt from 'bcryptjs';
import {
  DEFAULT_PERMISSIONS,
  type StaffAccessInput,
  type StaffCreateInput,
  type StaffListQuery,
  type StaffUpdateInput,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { nextCode } from '../common/code-counter.util';
import { dateToISO, isoToDate } from '../common/installment-view.util';
import { effectiveSchedule, type MarkingGroupRow } from './effective-schedule.util';

// Clave temporal legible de 8 caracteres, sin caracteres ambiguos (0/O/1/l/I).
const TEMP_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
function generateTempPassword(): string {
  let raw = '';
  for (let i = 0; i < 8; i++) raw += TEMP_ALPHABET[randomInt(TEMP_ALPHABET.length)];
  return raw;
}

// Normaliza un token de nombre a slug de username: sin tildes, ñ→n, minúsculas, solo [a-z0-9].
function normalizeToken(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/Ñ/g, 'n')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

// "Lucía Díaz Paredes" → "lucia.diaz" (nombre.apellido). Base para el username sugerido.
function baseUsername(fullName: string): string {
  const tokens = fullName.trim().split(/\s+/).map(normalizeToken).filter(Boolean);
  const first = tokens[0] ?? 'docente';
  const second = tokens[1] ?? '';
  return second ? `${first}.${second}` : first;
}

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

  // ===== Acceso al sistema desde la ficha (solo personal docente) =====

  // Primer username libre a partir de la base (agrega sufijo numérico si colisiona). excludeUserId
  // permite ignorar la cuenta del propio empleado al calcular el sugerido.
  private async uniqueUsername(base: string, excludeUserId?: string): Promise<string> {
    let candidate = base;
    let n = 1;
    for (;;) {
      const taken = await this.prisma.user.findFirst({
        where: { username: candidate, ...(excludeUserId ? { id: { not: excludeUserId } } : {}) },
        select: { id: true },
      });
      if (!taken) return candidate;
      n += 1;
      candidate = `${base}${n}`;
    }
  }

  // GET /staff/:id/access — estado de la cuenta del sistema del empleado.
  async getAccess(id: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        role: true,
        user: { select: { id: true, username: true, role: true } },
      },
    });
    if (!staff) throw new NotFoundException('Empleado no encontrado');

    if (!staff.user) {
      return {
        status: 'SIN_ACCESO' as const,
        username: null,
        role: null,
        suggestedUsername: await this.uniqueUsername(baseUsername(staff.fullName)),
      };
    }
    return {
      status: 'ACTIVO' as const,
      username: staff.user.username,
      role: staff.user.role,
      // Con cuenta ya no se sugiere (el reset ignora el username): se devuelve el actual.
      suggestedUsername: staff.user.username,
    };
  }

  // POST /staff/:id/access — genera (o regenera) el acceso del docente.
  // Sin cuenta: crea el User rol DOCENTE (username sugerido o el del body) y vincula Staff.userId.
  // Con cuenta: reinicia la clave temporal (ignora el username del body) y fuerza el cambio.
  async generateAccess(id: string, input: StaffAccessInput, actorId: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
      select: { id: true, fullName: true, email: true, role: true, userId: true },
    });
    if (!staff) throw new NotFoundException('Empleado no encontrado');
    // Solo el personal con cargo docente (Staff.role DOCENTE) recibe acceso.
    if (staff.role !== 'DOCENTE') {
      throw new UnprocessableEntityException('Solo el personal docente recibe acceso al sistema');
    }

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Ya tiene cuenta → reset de clave temporal (ignora el username del body).
    if (staff.userId) {
      const userId = staff.userId;
      await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { passwordHash, mustChangePassword: true },
        });
        await this.audit.log(
          {
            userId: actorId,
            action: 'staff.access-reset',
            entity: 'Staff',
            entityId: staff.id,
            payload: { staffId: staff.id, userId },
          },
          tx,
        );
      });
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { username: true },
      });
      return { username: user.username, tempPassword };
    }

    // Sin cuenta → crear User rol DOCENTE. username: el del body o el sugerido (normalizado, único).
    const username = input.username?.trim() || (await this.uniqueUsername(baseUsername(staff.fullName)));
    const clash = await this.prisma.user.findFirst({ where: { username }, select: { id: true } });
    if (clash) throw new ConflictException(`El usuario ${username} ya está en uso`);

    // La institución no tiene dominio propio y el correo del User es único y obligatorio: se usa el
    // correo de la ficha si existe; si no, uno sintético a partir del username.
    const email = staff.email && staff.email.trim() ? staff.email.trim() : `${username}@personal.local`;

    try {
      await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            username,
            email,
            passwordHash,
            fullName: staff.fullName,
            role: 'DOCENTE',
            permissions: DEFAULT_PERMISSIONS.DOCENTE as Prisma.InputJsonValue,
            mustChangePassword: true,
          },
          select: { id: true },
        });
        await tx.staff.update({ where: { id: staff.id }, data: { userId: user.id } });
        await this.audit.log(
          {
            userId: actorId,
            action: 'staff.access',
            entity: 'Staff',
            entityId: staff.id,
            payload: { staffId: staff.id, userId: user.id, username },
          },
          tx,
        );
      });
    } catch (error) {
      // username o correo ya en uso por otra cuenta.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`El usuario ${username} o el correo ${email} ya están en uso`);
      }
      throw error;
    }

    return { username, tempPassword };
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
