import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  type GuardianCreateInput,
  type GuardianListQuery,
  type GuardianUpdateInput,
  type LinkGuardianInput,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { nextCode } from '../common/code-counter.util';
import { debtCentsByStudent } from '../common/debt.util';

// Máximo de apoderados vinculados por estudiante.
const MAX_GUARDIANS = 3;

const childPlacementSelect = {
  section: {
    select: {
      id: true,
      name: true,
      gradeLevel: { select: { name: true, level: { select: { name: true } } } },
    },
  },
} satisfies Prisma.EnrollmentSelect;

type ChildEnrollment = Prisma.EnrollmentGetPayload<{ select: typeof childPlacementSelect }>;

function toPlacement(enrollment: ChildEnrollment | undefined) {
  if (!enrollment) return null;
  return {
    levelName: enrollment.section.gradeLevel.level.name,
    gradeName: enrollment.section.gradeLevel.name,
    sectionName: enrollment.section.name,
    sectionId: enrollment.section.id,
  };
}

// '' del formulario → null en la BD (el correo es opcional).
function normalizeEmail(email: string | null | undefined): string | null | undefined {
  if (email === undefined) return undefined;
  return email ? email : null;
}

@Injectable()
export class GuardiansService {
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

  async list(query: GuardianListQuery) {
    const where: Prisma.GuardianWhereInput = {};
    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { fullName: { contains: term, mode: 'insensitive' } },
        { dni: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
        { code: { contains: term, mode: 'insensitive' } },
      ];
    }

    // Escala de un solo colegio (~25 apoderados): el filtro por deuda es post-cálculo,
    // así que resolvemos el conjunto filtrado por búsqueda y paginamos en memoria.
    const guardians = await this.prisma.guardian.findMany({
      where,
      orderBy: { fullName: 'asc' },
      select: {
        id: true,
        code: true,
        fullName: true,
        dni: true,
        phone: true,
        email: true,
        notificationChannel: true,
        students: { where: { active: true }, select: { studentId: true } },
      },
    });

    const studentIds = [...new Set(guardians.flatMap((g) => g.students.map((s) => s.studentId)))];
    const debt = await debtCentsByStudent(this.prisma, studentIds);

    const rows = guardians.map((g) => ({
      id: g.id,
      code: g.code,
      fullName: g.fullName,
      dni: g.dni,
      phone: g.phone,
      email: g.email,
      notificationChannel: g.notificationChannel,
      childrenCount: g.students.length,
      debtCents: g.students.reduce((acc, s) => acc + (debt.get(s.studentId) ?? 0), 0),
    }));

    const filtered =
      query.account === 'con_deuda'
        ? rows.filter((r) => r.debtCents > 0)
        : query.account === 'al_dia'
          ? rows.filter((r) => r.debtCents === 0)
          : rows;

    const total = filtered.length;
    const items = filtered.slice((query.page - 1) * query.pageSize, query.page * query.pageSize);
    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async create(input: GuardianCreateInput, actorId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const code = await nextCode(tx, 'guardian', 'A-', 4, 201);
        const guardian = await tx.guardian.create({
          data: {
            code,
            fullName: input.fullName,
            dni: input.dni,
            phone: input.phone,
            email: normalizeEmail(input.email) ?? null,
            address: input.address,
            notificationChannel: input.notificationChannel,
          },
        });
        await this.audit.log(
          {
            userId: actorId,
            action: 'guardian.create',
            entity: 'Guardian',
            entityId: guardian.id,
            payload: { code: guardian.code, dni: guardian.dni },
          },
          tx,
        );
        return guardian;
      });
    } catch (error) {
      throw this.mapConflict(error, 'Ya existe un apoderado con ese DNI');
    }
  }

  async findOne(id: string) {
    const yearId = await this.activeYearId();
    const guardian = await this.prisma.guardian.findUnique({
      where: { id },
      include: {
        students: {
          where: { active: true },
          select: {
            relation: true,
            isPrimary: true,
            student: {
              select: {
                id: true,
                code: true,
                firstNames: true,
                lastNames: true,
                status: true,
                enrollments: {
                  where: { academicYearId: yearId, canceledAt: null },
                  select: childPlacementSelect,
                  take: 1,
                },
              },
            },
          },
        },
      },
    });
    if (!guardian) throw new NotFoundException('Apoderado no encontrado');

    const debt = await debtCentsByStudent(
      this.prisma,
      guardian.students.map((s) => s.student.id),
    );

    const { students, ...rest } = guardian;
    return {
      ...rest,
      children: students.map((s) => ({
        relation: s.relation,
        isPrimary: s.isPrimary,
        student: {
          id: s.student.id,
          code: s.student.code,
          firstNames: s.student.firstNames,
          lastNames: s.student.lastNames,
          status: s.student.status,
        },
        placement: toPlacement(s.student.enrollments[0]),
        debtCents: debt.get(s.student.id) ?? 0,
      })),
    };
  }

  async update(id: string, input: GuardianUpdateInput, actorId: string) {
    const existing = await this.prisma.guardian.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new NotFoundException('Apoderado no encontrado');

    const data: Prisma.GuardianUpdateInput = {};
    const payload: Record<string, unknown> = {};
    const assign = (key: 'fullName' | 'dni' | 'phone' | 'address' | 'notificationChannel') => {
      if (input[key] !== undefined) {
        (data as Record<string, unknown>)[key] = input[key];
        payload[key] = input[key];
      }
    };
    assign('fullName');
    assign('dni');
    assign('phone');
    assign('address');
    assign('notificationChannel');
    if (input.email !== undefined) {
      data.email = normalizeEmail(input.email) ?? null;
      payload.email = data.email;
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const guardian = await tx.guardian.update({ where: { id }, data });
        await this.audit.log(
          {
            userId: actorId,
            action: 'guardian.update',
            entity: 'Guardian',
            entityId: id,
            payload: payload as Prisma.InputJsonValue,
          },
          tx,
        );
        return guardian;
      });
    } catch (error) {
      throw this.mapConflict(error, 'Ya existe un apoderado con ese DNI');
    }
  }

  async link(studentId: string, guardianId: string, input: LinkGuardianInput, actorId: string) {
    const [student, guardian] = await Promise.all([
      this.prisma.student.findUnique({ where: { id: studentId }, select: { id: true } }),
      this.prisma.guardian.findUnique({ where: { id: guardianId }, select: { id: true } }),
    ]);
    if (!student) throw new NotFoundException('Estudiante no encontrado');
    if (!guardian) throw new NotFoundException('Apoderado no encontrado');

    return this.prisma.$transaction(async (tx) => {
      const activeCount = await tx.studentGuardian.count({ where: { studentId, active: true } });
      const current = await tx.studentGuardian.findUnique({
        where: { studentId_guardianId: { studentId, guardianId } },
      });
      const addsNewActive = !current || !current.active;

      // Máximo 3 apoderados por estudiante (madre + padre + un tercero).
      if (addsNewActive && activeCount >= MAX_GUARDIANS) {
        throw new ConflictException(
          `Un estudiante puede tener hasta ${MAX_GUARDIANS} apoderados. Quita uno antes de agregar otro.`,
        );
      }

      // El primer apoderado siempre queda como contacto principal.
      const makePrimary = input.isPrimary || (addsNewActive && activeCount === 0);

      const link = await tx.studentGuardian.upsert({
        where: { studentId_guardianId: { studentId, guardianId } },
        create: {
          studentId,
          guardianId,
          relation: input.relation,
          isPrimary: makePrimary,
          active: true,
        },
        update: { relation: input.relation, isPrimary: makePrimary, active: true },
      });

      // Un solo apoderado principal por estudiante.
      if (makePrimary) {
        await tx.studentGuardian.updateMany({
          where: { studentId, guardianId: { not: guardianId } },
          data: { isPrimary: false },
        });
      }

      await this.audit.log(
        {
          userId: actorId,
          action: 'student.guardian_link',
          entity: 'StudentGuardian',
          entityId: `${studentId}:${guardianId}`,
          payload: { studentId, guardianId, relation: input.relation, isPrimary: makePrimary },
        },
        tx,
      );
      return link;
    });
  }

  async unlink(studentId: string, guardianId: string, actorId: string) {
    const link = await this.prisma.studentGuardian.findUnique({
      where: { studentId_guardianId: { studentId, guardianId } },
    });
    if (!link) throw new NotFoundException('Vínculo no encontrado');

    return this.prisma.$transaction(async (tx) => {
      await tx.studentGuardian.update({
        where: { studentId_guardianId: { studentId, guardianId } },
        data: { active: false, isPrimary: false },
      });

      // Si se quita al contacto principal y quedan otros, se promueve al siguiente
      // (nunca queda un estudiante con apoderados pero sin principal).
      let promotedGuardianId: string | null = null;
      if (link.isPrimary) {
        const next = await tx.studentGuardian.findFirst({
          where: { studentId, active: true, guardianId: { not: guardianId } },
          orderBy: { guardian: { code: 'asc' } },
          select: { guardianId: true },
        });
        if (next) {
          await tx.studentGuardian.update({
            where: { studentId_guardianId: { studentId, guardianId: next.guardianId } },
            data: { isPrimary: true },
          });
          promotedGuardianId = next.guardianId;
        }
      }

      await this.audit.log(
        {
          userId: actorId,
          action: 'student.guardian_unlink',
          entity: 'StudentGuardian',
          entityId: `${studentId}:${guardianId}`,
          payload: { studentId, guardianId, wasPrimary: link.isPrimary, promotedGuardianId },
        },
        tx,
      );
      return { studentId, guardianId, active: false, promotedGuardianId };
    });
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
