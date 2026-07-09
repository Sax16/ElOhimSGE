import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  type StartNextYearInput,
  type YearCreateInput,
  type YearUpdateInput,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { YearAccessService } from './year-access.service';

@Injectable()
export class YearsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly access: YearAccessService,
  ) {}

  async findAll() {
    const years = await this.prisma.academicYear.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
        periodType: true,
        enrollmentStart: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { name: 'desc' },
    });
    return years.map(({ _count, ...year }) => ({ ...year, enrollmentsCount: _count.enrollments }));
  }

  async create(input: YearCreateInput, actorId: string) {
    const periods = YearAccessService.generatePeriods(
      input.startDate,
      input.endDate,
      input.periodType,
    );
    try {
      return await this.prisma.$transaction(async (tx) => {
        const year = await tx.academicYear.create({
          data: {
            name: input.name,
            startDate: input.startDate,
            endDate: input.endDate,
            periodType: input.periodType,
            enrollmentStart: input.enrollmentStart,
            periods: { create: periods },
          },
        });
        await this.audit.log(
          {
            userId: actorId,
            action: 'year.create',
            entity: 'AcademicYear',
            entityId: year.id,
            payload: { name: year.name, periodType: year.periodType, periods: periods.length },
          },
          tx,
        );
        return year;
      });
    } catch (error) {
      throw this.mapYearNameConflict(error, input.name);
    }
  }

  async update(id: string, input: YearUpdateInput, actorId: string) {
    await this.access.assertYearOpenById(id);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const year = await tx.academicYear.update({ where: { id }, data: input });
        await this.audit.log(
          {
            userId: actorId,
            action: 'year.update',
            entity: 'AcademicYear',
            entityId: id,
            payload: this.datePayload(input),
          },
          tx,
        );
        return year;
      });
    } catch (error) {
      throw this.mapYearNameConflict(error, input.name);
    }
  }

  async close(id: string, actorId: string) {
    const year = await this.prisma.academicYear.findUnique({ where: { id }, select: { status: true } });
    if (!year) throw new NotFoundException('Año académico no encontrado');
    if (year.status === 'CERRADO') throw new ConflictException('El año académico ya está cerrado');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.academicYear.update({
        where: { id },
        data: { status: 'CERRADO' },
      });
      await tx.period.updateMany({
        where: { academicYearId: id },
        data: { status: 'CERRADO' },
      });
      await this.audit.log(
        { userId: actorId, action: 'year.close', entity: 'AcademicYear', entityId: id },
        tx,
      );
      return updated;
    });
  }

  async delete(id: string, actorId: string) {
    const year = await this.prisma.academicYear.findUnique({
      where: { id },
      include: { _count: { select: { enrollments: true } } },
    });
    if (!year) throw new NotFoundException('Año académico no encontrado');
    if (year.status === 'CERRADO') {
      throw new ConflictException('El año académico está cerrado — solo lectura');
    }
    if (year._count.enrollments > 0) {
      throw new ConflictException(
        `No se puede eliminar: el año tiene ${year._count.enrollments} ${
          year._count.enrollments === 1 ? 'matrícula' : 'matrículas'
        }.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Cascada: hijos antes que padres para respetar las FKs.
      // periodos → cursos → secciones → grados → tarifas → niveles → programas → año.
      await tx.period.deleteMany({ where: { academicYearId: id } });
      await tx.course.deleteMany({ where: { gradeLevel: { level: { academicYearId: id } } } });
      await tx.section.deleteMany({ where: { gradeLevel: { level: { academicYearId: id } } } });
      await tx.gradeLevel.deleteMany({ where: { level: { academicYearId: id } } });
      await tx.levelFee.deleteMany({ where: { level: { academicYearId: id } } });
      await tx.level.deleteMany({ where: { academicYearId: id } });
      await tx.program.deleteMany({ where: { academicYearId: id } });
      await tx.academicYear.delete({ where: { id } });
      await this.audit.log(
        {
          userId: actorId,
          action: 'year.delete',
          entity: 'AcademicYear',
          entityId: id,
          payload: { name: year.name, status: year.status },
        },
        tx,
      );
      return { id };
    });
  }

  async startNext(sourceYearId: string, input: StartNextYearInput, actorId: string) {
    const source = await this.prisma.academicYear.findUnique({ where: { id: sourceYearId } });
    if (!source) throw new NotFoundException('Año académico de origen no encontrado');

    const existing = await this.prisma.academicYear.findUnique({ where: { name: input.name } });
    if (existing) throw new ConflictException(`Ya existe un año académico llamado ${input.name}`);

    const periods = YearAccessService.generatePeriods(
      input.startDate,
      input.endDate,
      input.periodType,
    );
    const { copy } = input;

    return this.prisma.$transaction(async (tx) => {
      const newYear = await tx.academicYear.create({
        data: {
          name: input.name,
          startDate: input.startDate,
          endDate: input.endDate,
          periodType: input.periodType,
          enrollmentStart: input.enrollmentStart,
          periods: { create: periods },
        },
      });

      const counts = { levels: 0, grades: 0, sections: 0, courses: 0, programs: 0 };

      if (copy.structure) {
        const sourceLevels = await tx.level.findMany({
          where: { academicYearId: sourceYearId },
          orderBy: { order: 'asc' },
          include: {
            fee: true,
            grades: {
              orderBy: { order: 'asc' },
              include: { sections: true, courses: true },
            },
          },
        });

        for (const level of sourceLevels) {
          const newLevel = await tx.level.create({
            data: {
              academicYearId: newYear.id,
              name: level.name,
              description: level.description,
              order: level.order,
            },
          });
          counts.levels += 1;

          if (level.fee) {
            await tx.levelFee.create({
              data: {
                levelId: newLevel.id,
                enrollmentFee: level.fee.enrollmentFee,
                monthlyFee: level.fee.monthlyFee,
                installmentsCount: level.fee.installmentsCount,
              },
            });
          }

          for (const grade of level.grades) {
            const newGrade = await tx.gradeLevel.create({
              data: { levelId: newLevel.id, name: grade.name, order: grade.order },
            });
            counts.grades += 1;

            for (const section of grade.sections) {
              await tx.section.create({
                data: {
                  gradeLevelId: newGrade.id,
                  name: section.name,
                  shift: section.shift,
                  capacity: section.capacity,
                  tutorId: copy.tutors ? section.tutorId : null,
                  assistantName: copy.tutors ? section.assistantName : null,
                },
              });
              counts.sections += 1;
            }

            if (copy.plan) {
              for (const course of grade.courses) {
                await tx.course.create({
                  data: {
                    gradeLevelId: newGrade.id,
                    name: course.name,
                    weeklyHours: course.weeklyHours,
                    teacherId: copy.tutors ? course.teacherId : null,
                  },
                });
                counts.courses += 1;
              }
            }
          }
        }
      }

      if (copy.programs) {
        const sourcePrograms = await tx.program.findMany({
          where: { academicYearId: sourceYearId },
        });
        for (const program of sourcePrograms) {
          await tx.program.create({
            data: {
              academicYearId: newYear.id,
              name: program.name,
              type: program.type,
              scheduleText: program.scheduleText,
              capacity: program.capacity,
              enrollmentFee: program.enrollmentFee,
              monthlyFee: program.monthlyFee,
              status: 'ACTIVO',
            },
          });
          counts.programs += 1;
        }
      }

      await this.audit.log(
        {
          userId: actorId,
          action: 'year.start_next',
          entity: 'AcademicYear',
          entityId: newYear.id,
          payload: { from: source.name, name: newYear.name, copy, counts },
        },
        tx,
      );

      return { id: newYear.id, name: newYear.name, counts };
    });
  }

  private datePayload(input: YearUpdateInput): Prisma.InputJsonValue {
    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.startDate !== undefined) payload.startDate = input.startDate.toISOString();
    if (input.endDate !== undefined) payload.endDate = input.endDate.toISOString();
    if (input.periodType !== undefined) payload.periodType = input.periodType;
    if (input.enrollmentStart !== undefined)
      payload.enrollmentStart = input.enrollmentStart.toISOString();
    return payload as Prisma.InputJsonValue;
  }

  private mapYearNameConflict(error: unknown, name?: string): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new ConflictException(
        name ? `Ya existe un año académico llamado ${name}` : 'El año académico ya existe',
      );
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return new NotFoundException('Año académico no encontrado');
    }
    return error instanceof Error ? error : new Error(String(error));
  }
}
