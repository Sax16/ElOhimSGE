import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  type StudentCreateInput,
  type StudentListQuery,
  type StudentUpdateInput,
  type WithdrawInput,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { nextCode } from '../common/code-counter.util';
import { debtCentsByStudent } from '../common/debt.util';
import { decimalToCents } from '../common/money.util';

// Placement = ubicación del estudiante según su matrícula del año activo (no cancelada).
const placementSelect = {
  section: {
    select: {
      id: true,
      name: true,
      gradeLevel: {
        select: { name: true, level: { select: { name: true } } },
      },
    },
  },
} satisfies Prisma.EnrollmentSelect;

type PlacementEnrollment = Prisma.EnrollmentGetPayload<{ select: typeof placementSelect }>;

function toPlacement(enrollment: PlacementEnrollment | undefined) {
  if (!enrollment) return null;
  return {
    levelName: enrollment.section.gradeLevel.level.name,
    gradeName: enrollment.section.gradeLevel.name,
    sectionName: enrollment.section.name,
    sectionId: enrollment.section.id,
  };
}

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // Único año en estado ACTIVO (2026). El árbol/matrícula viven en él.
  private async activeYearId(): Promise<string> {
    const year = await this.prisma.academicYear.findFirst({
      where: { status: 'ACTIVO' },
      select: { id: true },
    });
    if (!year) throw new NotFoundException('No hay un año académico activo');
    return year.id;
  }

  async list(query: StudentListQuery) {
    const yearId = await this.activeYearId();

    // Filtro por ubicación (matrícula del año activo, no cancelada).
    const placementFilter: Prisma.EnrollmentWhereInput = { academicYearId: yearId, canceledAt: null };
    if (query.sectionId) placementFilter.sectionId = query.sectionId;
    if (query.gradeLevelId) placementFilter.section = { gradeLevelId: query.gradeLevelId };
    if (query.levelId)
      placementFilter.section = { gradeLevel: { levelId: query.levelId } };

    const where: Prisma.StudentWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.sectionId || query.gradeLevelId || query.levelId) {
      where.enrollments = { some: placementFilter };
    }
    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { code: { contains: term, mode: 'insensitive' } },
        { dni: { contains: term, mode: 'insensitive' } },
        { firstNames: { contains: term, mode: 'insensitive' } },
        { lastNames: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [total, students] = await this.prisma.$transaction([
      this.prisma.student.count({ where }),
      this.prisma.student.findMany({
        where,
        orderBy: [{ lastNames: 'asc' }, { firstNames: 'asc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        select: {
          id: true,
          code: true,
          firstNames: true,
          lastNames: true,
          dni: true,
          status: true,
          shift: true,
          photoUrl: true,
          enrollments: {
            where: { academicYearId: yearId, canceledAt: null },
            select: placementSelect,
            take: 1,
          },
          guardians: {
            where: { isPrimary: true, active: true },
            select: { guardian: { select: { fullName: true } } },
            take: 1,
          },
        },
      }),
    ]);

    const debt = await debtCentsByStudent(
      this.prisma,
      students.map((s) => s.id),
    );

    const items = students.map((s) => ({
      id: s.id,
      code: s.code,
      firstNames: s.firstNames,
      lastNames: s.lastNames,
      dni: s.dni,
      status: s.status,
      shift: s.shift,
      photoUrl: s.photoUrl,
      placement: toPlacement(s.enrollments[0]),
      debtCents: debt.get(s.id) ?? 0,
      primaryGuardian: s.guardians[0]
        ? { fullName: s.guardians[0].guardian.fullName }
        : null,
    }));

    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async create(input: StudentCreateInput, actorId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const code = await nextCode(tx, 'student', 'E-', 4, 1001);
        const student = await tx.student.create({
          data: {
            code,
            firstNames: input.firstNames,
            lastNames: input.lastNames,
            dni: input.dni,
            birthDate: input.birthDate,
            sex: input.sex,
            address: input.address,
            previousSchool: input.previousSchool ?? null,
            shift: input.shift ?? null,
            allergies: input.allergies ?? null,
            insuranceType: input.insuranceType,
            emergencyContactName: input.emergencyContactName ?? null,
            emergencyContactPhone: input.emergencyContactPhone ?? null,
            authorizedPickups: input.authorizedPickups as unknown as Prisma.InputJsonValue,
          },
        });
        await this.audit.log(
          {
            userId: actorId,
            action: 'student.create',
            entity: 'Student',
            entityId: student.id,
            payload: { code: student.code, dni: student.dni },
          },
          tx,
        );
        return student;
      });
    } catch (error) {
      throw this.mapConflict(error, 'Ya existe un estudiante con ese DNI');
    }
  }

  async findOne(id: string) {
    const yearId = await this.activeYearId();
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        guardians: {
          where: { active: true },
          select: {
            relation: true,
            isPrimary: true,
            guardian: {
              select: { id: true, code: true, fullName: true, dni: true, phone: true, email: true },
            },
          },
        },
        enrollments: {
          where: { academicYearId: yearId, canceledAt: null },
          take: 1,
          select: {
            id: true,
            code: true,
            type: true,
            status: true,
            academicYear: { select: { name: true } },
            section: {
              select: {
                id: true,
                name: true,
                gradeLevel: { select: { name: true, level: { select: { name: true } } } },
              },
            },
            installments: {
              orderBy: { sequence: 'asc' },
              select: {
                id: true,
                type: true,
                concept: true,
                sequence: true,
                dueDate: true,
                amount: true,
                status: true,
              },
            },
          },
        },
      },
    });
    if (!student) throw new NotFoundException('Estudiante no encontrado');

    // Programas complementarios: inscripciones ACTIVAS del año activo (cuotas propias del programa).
    const programEnrollments = await this.prisma.programEnrollment.findMany({
      where: {
        studentId: id,
        canceledAt: null,
        program: { academicYearId: yearId },
      },
      orderBy: { enrolledAt: 'asc' },
      select: {
        id: true,
        canceledAt: true,
        program: { select: { id: true, name: true, scheduleText: true } },
        installments: { select: { status: true, amount: true, dueDate: true } },
      },
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const programs = programEnrollments.map((pe) => {
      let debtCents = 0;
      for (const inst of pe.installments) {
        const overdue =
          inst.status === 'VENCIDO' || (inst.status === 'PENDIENTE' && inst.dueDate < today);
        if (overdue) debtCents += decimalToCents(inst.amount);
      }
      return {
        programEnrollmentId: pe.id,
        programId: pe.program.id,
        name: pe.program.name,
        scheduleText: pe.program.scheduleText,
        canceledAt: pe.canceledAt,
        debtCents,
      };
    });

    const enrollment = student.enrollments[0] ?? null;
    const { enrollments: _drop, guardians, ...rest } = student;

    return {
      ...rest,
      guardians: guardians.map((g) => ({
        relation: g.relation,
        isPrimary: g.isPrimary,
        guardian: g.guardian,
      })),
      programs,
      enrollment: enrollment
        ? {
            id: enrollment.id,
            code: enrollment.code,
            type: enrollment.type,
            status: enrollment.status,
            year: enrollment.academicYear.name,
            levelName: enrollment.section.gradeLevel.level.name,
            gradeName: enrollment.section.gradeLevel.name,
            sectionName: enrollment.section.name,
            sectionId: enrollment.section.id,
            installments: enrollment.installments,
          }
        : null,
    };
  }

  async update(id: string, input: StudentUpdateInput, actorId: string) {
    const existing = await this.prisma.student.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new NotFoundException('Estudiante no encontrado');

    const data: Prisma.StudentUpdateInput = {};
    const payload: Record<string, unknown> = {};
    const assign = <K extends keyof StudentUpdateInput>(key: K) => {
      if (input[key] !== undefined) {
        (data as Record<string, unknown>)[key] = input[key] ?? null;
        payload[key] = input[key];
      }
    };
    assign('firstNames');
    assign('lastNames');
    assign('dni');
    assign('birthDate');
    assign('sex');
    assign('address');
    assign('previousSchool');
    assign('shift');
    assign('allergies');
    assign('insuranceType');
    assign('emergencyContactName');
    assign('emergencyContactPhone');
    assign('status');
    if (input.authorizedPickups !== undefined) {
      data.authorizedPickups = input.authorizedPickups as unknown as Prisma.InputJsonValue;
      payload.authorizedPickups = input.authorizedPickups;
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const student = await tx.student.update({ where: { id }, data });
        await this.audit.log(
          {
            userId: actorId,
            action: 'student.update',
            entity: 'Student',
            entityId: id,
            payload: payload as Prisma.InputJsonValue,
          },
          tx,
        );
        return student;
      });
    } catch (error) {
      throw this.mapConflict(error, 'Ya existe un estudiante con ese DNI');
    }
  }

  async setPhoto(id: string, photoUrl: string, actorId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.student.update({ where: { id }, data: { photoUrl } });
      await this.audit.log(
        { userId: actorId, action: 'student.photo', entity: 'Student', entityId: id, payload: { photoUrl } },
        tx,
      );
    });
    return { photoUrl };
  }

  async withdraw(id: string, input: WithdrawInput, actorId: string) {
    const yearId = await this.activeYearId();
    const student = await this.prisma.student.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!student) throw new NotFoundException('Estudiante no encontrado');
    if (!['ACTIVO', 'BECADO', 'RESERVADO'].includes(student.status)) {
      throw new BadRequestException('El estudiante no está activo; ya fue retirado o egresó');
    }

    const isRetiro = input.type === 'RETIRO';
    const newStatus = isRetiro ? 'RETIRADO' : 'TRASLADADO';
    const cancelReason = `${isRetiro ? 'Retiro' : 'Traslado'}: ${input.reason}`;
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.student.update({
        where: { id },
        data: {
          status: newStatus,
          withdrawalReason: input.reason,
          withdrawnAt: input.effectiveDate,
        },
      });

      // Matrícula activa del año en curso → se anula (libera la vacante) y se anulan sus cuotas pendientes.
      const enrollment = await tx.enrollment.findFirst({
        where: { studentId: id, academicYearId: yearId, canceledAt: null },
        select: { id: true },
      });
      if (enrollment) {
        await tx.enrollment.update({
          where: { id: enrollment.id },
          data: { canceledAt: now, cancelReason },
        });
        await tx.installment.updateMany({
          where: { enrollmentId: enrollment.id, status: 'PENDIENTE' },
          data: { status: 'ANULADO', cancelReason, canceledAt: now, canceledById: actorId },
        });
      }

      await this.audit.log(
        {
          userId: actorId,
          action: 'student.withdraw',
          entity: 'Student',
          entityId: id,
          payload: {
            type: input.type,
            reason: input.reason,
            destinationSchool: input.destinationSchool ?? null,
          },
        },
        tx,
      );
    });

    return { id, status: newStatus, certificateStub: true };
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
