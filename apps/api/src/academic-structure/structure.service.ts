import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  type CourseCreateInput,
  type CoursesCopyInput,
  type CourseUpdateInput,
  type GradeCreateInput,
  type GradeUpdateInput,
  type LevelCreateInput,
  type LevelUpdateInput,
  type SectionCreateInput,
  type SectionUpdateInput,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { YearAccessService } from './year-access.service';

@Injectable()
export class StructureService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly access: YearAccessService,
  ) {}

  // ===== Árbol Nivel → Grado → Sección =====

  async tree(yearId: string) {
    const year = await this.prisma.academicYear.findUnique({ where: { id: yearId } });
    if (!year) throw new NotFoundException('Año académico no encontrado');

    const levels = await this.prisma.level.findMany({
      where: { academicYearId: yearId },
      orderBy: { order: 'asc' },
      include: {
        grades: {
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { courses: true } },
            sections: {
              orderBy: [{ name: 'asc' }, { shift: 'asc' }],
              include: {
                tutor: { select: { id: true, fullName: true } },
                _count: { select: { enrollments: { where: { canceledAt: null } } } },
              },
            },
          },
        },
      },
    });

    return levels.map((level) => ({
      id: level.id,
      name: level.name,
      description: level.description,
      order: level.order,
      grades: level.grades.map((grade) => ({
        id: grade.id,
        name: grade.name,
        order: grade.order,
        coursesCount: grade._count.courses,
        sections: grade.sections.map((section) => ({
          id: section.id,
          name: section.name,
          shift: section.shift,
          capacity: section.capacity,
          assistantName: section.assistantName,
          tutor: section.tutor,
          enrolled: section._count.enrollments,
        })),
      })),
    }));
  }

  // ===== Niveles =====

  async createLevel(input: LevelCreateInput, actorId: string) {
    await this.access.assertYearOpenById(input.academicYearId);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const max = await tx.level.aggregate({
          where: { academicYearId: input.academicYearId },
          _max: { order: true },
        });
        const level = await tx.level.create({
          data: {
            academicYearId: input.academicYearId,
            name: input.name,
            description: input.description ?? null,
            order: (max._max.order ?? 0) + 1,
          },
        });
        await this.audit.log(
          {
            userId: actorId,
            action: 'level.create',
            entity: 'Level',
            entityId: level.id,
            payload: { name: level.name, academicYearId: input.academicYearId },
          },
          tx,
        );
        return level;
      });
    } catch (error) {
      throw this.mapConflict(error, 'Ya existe un nivel con ese nombre en el año');
    }
  }

  async updateLevel(id: string, input: LevelUpdateInput, actorId: string) {
    await this.access.assertYearOpenByLevel(id);
    const data: Prisma.LevelUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    try {
      return await this.prisma.$transaction(async (tx) => {
        const level = await tx.level.update({ where: { id }, data });
        const payload: Record<string, unknown> = {};
        if (input.name !== undefined) payload.name = input.name;
        if (input.description !== undefined) payload.description = input.description;
        await this.audit.log(
          {
            userId: actorId,
            action: 'level.update',
            entity: 'Level',
            entityId: id,
            payload: payload as Prisma.InputJsonValue,
          },
          tx,
        );
        return level;
      });
    } catch (error) {
      throw this.mapConflict(error, 'Ya existe un nivel con ese nombre en el año');
    }
  }

  async deleteLevel(id: string, actorId: string) {
    await this.access.assertYearOpenByLevel(id);
    const level = await this.prisma.level.findUnique({
      where: { id },
      include: { _count: { select: { grades: true } } },
    });
    if (!level) throw new NotFoundException('Nivel no encontrado');
    if (level._count.grades > 0) {
      throw new ConflictException(
        `No se puede eliminar: el nivel tiene ${level._count.grades} ${level._count.grades === 1 ? 'grado' : 'grados'}. Elimínalos primero.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // La tarifa del nivel (LevelFee) se elimina con él en la misma transacción.
      await tx.levelFee.deleteMany({ where: { levelId: id } });
      await tx.level.delete({ where: { id } });
      await this.audit.log(
        {
          userId: actorId,
          action: 'level.delete',
          entity: 'Level',
          entityId: id,
          payload: { name: level.name, academicYearId: level.academicYearId },
        },
        tx,
      );
      return { id };
    });
  }

  // ===== Grados =====

  async createGrade(input: GradeCreateInput, actorId: string) {
    await this.access.assertYearOpenByLevel(input.levelId);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const max = await tx.gradeLevel.aggregate({
          where: { levelId: input.levelId },
          _max: { order: true },
        });
        const grade = await tx.gradeLevel.create({
          data: { levelId: input.levelId, name: input.name, order: (max._max.order ?? 0) + 1 },
        });
        await this.audit.log(
          {
            userId: actorId,
            action: 'grade.create',
            entity: 'GradeLevel',
            entityId: grade.id,
            payload: { name: grade.name, levelId: input.levelId },
          },
          tx,
        );
        return grade;
      });
    } catch (error) {
      throw this.mapConflict(error, 'Ya existe un grado con ese nombre en el nivel');
    }
  }

  async updateGrade(id: string, input: GradeUpdateInput, actorId: string) {
    await this.access.assertYearOpenByGrade(id);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const grade = await tx.gradeLevel.update({ where: { id }, data: { name: input.name } });
        await this.audit.log(
          {
            userId: actorId,
            action: 'grade.update',
            entity: 'GradeLevel',
            entityId: id,
            payload: { name: input.name },
          },
          tx,
        );
        return grade;
      });
    } catch (error) {
      throw this.mapConflict(error, 'Ya existe un grado con ese nombre en el nivel');
    }
  }

  async deleteGrade(id: string, actorId: string) {
    await this.access.assertYearOpenByGrade(id);
    const grade = await this.prisma.gradeLevel.findUnique({
      where: { id },
      include: { _count: { select: { sections: true, courses: true } } },
    });
    if (!grade) throw new NotFoundException('Grado no encontrado');
    const { sections, courses } = grade._count;
    if (sections > 0 || courses > 0) {
      const parts: string[] = [];
      if (sections > 0) parts.push(`${sections} ${sections === 1 ? 'sección' : 'secciones'}`);
      if (courses > 0) parts.push(`${courses} ${courses === 1 ? 'curso' : 'cursos'}`);
      throw new ConflictException(
        `No se puede eliminar: el grado tiene ${parts.join(' y ')}. Elimínalos primero.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.gradeLevel.delete({ where: { id } });
      await this.audit.log(
        {
          userId: actorId,
          action: 'grade.delete',
          entity: 'GradeLevel',
          entityId: id,
          payload: { name: grade.name, levelId: grade.levelId },
        },
        tx,
      );
      return { id };
    });
  }

  // ===== Secciones =====

  async createSection(input: SectionCreateInput, actorId: string) {
    await this.access.assertYearOpenByGrade(input.gradeLevelId);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const section = await tx.section.create({
          data: {
            gradeLevelId: input.gradeLevelId,
            name: input.name,
            shift: input.shift,
            capacity: input.capacity,
            tutorId: input.tutorId ?? null,
            assistantName: input.assistantName ?? null,
          },
        });
        await this.audit.log(
          {
            userId: actorId,
            action: 'section.create',
            entity: 'Section',
            entityId: section.id,
            payload: { name: section.name, shift: section.shift, gradeLevelId: input.gradeLevelId },
          },
          tx,
        );
        return section;
      });
    } catch (error) {
      throw this.mapConflict(error, 'Ya existe una sección con ese nombre y turno en el grado');
    }
  }

  async updateSection(id: string, input: SectionUpdateInput, actorId: string) {
    await this.access.assertYearOpenBySection(id);

    if (input.capacity !== undefined) {
      const enrolled = await this.prisma.enrollment.count({
        where: { sectionId: id, canceledAt: null },
      });
      if (input.capacity < enrolled) {
        throw new BadRequestException(
          `Hay ${enrolled} estudiantes matriculados; no puedes reducir por debajo de eso`,
        );
      }
    }

    const data: Prisma.SectionUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.shift !== undefined) data.shift = input.shift;
    if (input.capacity !== undefined) data.capacity = input.capacity;
    if (input.assistantName !== undefined) data.assistantName = input.assistantName;
    if (input.tutorId !== undefined) {
      data.tutor = input.tutorId ? { connect: { id: input.tutorId } } : { disconnect: true };
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const section = await tx.section.update({ where: { id }, data });
        await this.audit.log(
          {
            userId: actorId,
            action: 'section.update',
            entity: 'Section',
            entityId: id,
            payload: this.sectionPayload(input),
          },
          tx,
        );
        return section;
      });
    } catch (error) {
      throw this.mapConflict(error, 'Ya existe una sección con ese nombre y turno en el grado');
    }
  }

  async deleteSection(id: string, actorId: string) {
    await this.access.assertYearOpenBySection(id);
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: { _count: { select: { enrollments: true } } },
    });
    if (!section) throw new NotFoundException('Sección no encontrada');
    // Ninguna matrícula, ni siquiera anuladas (son historial): _count cuenta todas.
    if (section._count.enrollments > 0) {
      throw new ConflictException(
        `No se puede eliminar: la sección tiene ${section._count.enrollments} ${
          section._count.enrollments === 1 ? 'estudiante matriculado' : 'estudiantes matriculados'
        }.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.section.delete({ where: { id } });
      await this.audit.log(
        {
          userId: actorId,
          action: 'section.delete',
          entity: 'Section',
          entityId: id,
          payload: { name: section.name, shift: section.shift, gradeLevelId: section.gradeLevelId },
        },
        tx,
      );
      return { id };
    });
  }

  async roster(sectionId: string) {
    const section = await this.prisma.section.findUnique({ where: { id: sectionId } });
    if (!section) throw new NotFoundException('Sección no encontrada');

    const enrollments = await this.prisma.enrollment.findMany({
      where: { sectionId, canceledAt: null },
      select: {
        id: true,
        student: {
          select: {
            id: true,
            code: true,
            firstNames: true,
            paternalLastName: true,
            maternalLastName: true,
            status: true,
          },
        },
      },
      orderBy: [{ student: { paternalLastName: 'asc' } }, { student: { maternalLastName: 'asc' } }],
    });
    return enrollments.map((e) => e.student);
  }

  teachers() {
    return this.prisma.user.findMany({
      where: { role: 'DOCENTE', status: 'ACTIVO' },
      select: { id: true, fullName: true },
      orderBy: { fullName: 'asc' },
    });
  }

  // ===== Cursos (plan de estudios) =====

  async courses(gradeLevelId: string) {
    const grade = await this.prisma.gradeLevel.findUnique({ where: { id: gradeLevelId } });
    if (!grade) throw new NotFoundException('Grado no encontrado');
    return this.prisma.course.findMany({
      where: { gradeLevelId },
      include: { teacher: { select: { id: true, fullName: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createCourse(input: CourseCreateInput, actorId: string) {
    await this.access.assertYearOpenByGrade(input.gradeLevelId);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const course = await tx.course.create({
          data: {
            gradeLevelId: input.gradeLevelId,
            name: input.name,
            weeklyHours: input.weeklyHours,
            teacherId: input.teacherId ?? null,
          },
        });
        await this.audit.log(
          {
            userId: actorId,
            action: 'course.create',
            entity: 'Course',
            entityId: course.id,
            payload: { name: course.name, gradeLevelId: input.gradeLevelId },
          },
          tx,
        );
        return course;
      });
    } catch (error) {
      throw this.mapConflict(error, 'Ya existe un curso con ese nombre en el grado');
    }
  }

  async updateCourse(id: string, input: CourseUpdateInput, actorId: string) {
    await this.access.assertYearOpenByCourse(id);
    const data: Prisma.CourseUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.weeklyHours !== undefined) data.weeklyHours = input.weeklyHours;
    if (input.teacherId !== undefined) {
      data.teacher = input.teacherId ? { connect: { id: input.teacherId } } : { disconnect: true };
    }
    try {
      return await this.prisma.$transaction(async (tx) => {
        const course = await tx.course.update({ where: { id }, data });
        await this.audit.log(
          { userId: actorId, action: 'course.update', entity: 'Course', entityId: id, payload: this.coursePayload(input) },
          tx,
        );
        return course;
      });
    } catch (error) {
      throw this.mapConflict(error, 'Ya existe un curso con ese nombre en el grado');
    }
  }

  async deleteCourse(id: string, actorId: string) {
    await this.access.assertYearOpenByCourse(id);
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Curso no encontrado');
    // R1: el curso no tiene dependientes → se elimina siempre (en años abiertos).
    return this.prisma.$transaction(async (tx) => {
      await tx.course.delete({ where: { id } });
      await this.audit.log(
        {
          userId: actorId,
          action: 'course.delete',
          entity: 'Course',
          entityId: id,
          payload: { name: course.name, gradeLevelId: course.gradeLevelId },
        },
        tx,
      );
      return { id };
    });
  }

  async copyCourses(input: CoursesCopyInput, actorId: string) {
    const from = await this.prisma.gradeLevel.findUnique({ where: { id: input.fromGradeLevelId } });
    if (!from) throw new NotFoundException('Grado de origen no encontrado');

    const sourceCourses = await this.prisma.course.findMany({
      where: { gradeLevelId: input.fromGradeLevelId },
    });

    return this.prisma.$transaction(async (tx) => {
      let copied = 0;
      let skipped = 0;

      for (const targetId of input.toGradeLevelIds) {
        // El destino debe existir y pertenecer a un año abierto.
        await this.access.assertYearOpenByGrade(targetId, tx);

        const existing = await tx.course.findMany({
          where: { gradeLevelId: targetId },
          select: { name: true },
        });
        const existingNames = new Set(existing.map((c) => c.name));

        for (const course of sourceCourses) {
          if (existingNames.has(course.name)) {
            skipped += 1;
            continue;
          }
          await tx.course.create({
            data: {
              gradeLevelId: targetId,
              name: course.name,
              weeklyHours: course.weeklyHours,
              teacherId: course.teacherId,
            },
          });
          copied += 1;
        }
      }

      await this.audit.log(
        {
          userId: actorId,
          action: 'course.copy',
          entity: 'GradeLevel',
          entityId: input.fromGradeLevelId,
          payload: { from: input.fromGradeLevelId, to: input.toGradeLevelIds, copied, skipped },
        },
        tx,
      );

      return { copied, skipped };
    });
  }

  private sectionPayload(input: SectionUpdateInput): Prisma.InputJsonValue {
    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.shift !== undefined) payload.shift = input.shift;
    if (input.capacity !== undefined) payload.capacity = input.capacity;
    if (input.tutorId !== undefined) payload.tutorId = input.tutorId;
    if (input.assistantName !== undefined) payload.assistantName = input.assistantName;
    return payload as Prisma.InputJsonValue;
  }

  private coursePayload(input: CourseUpdateInput): Prisma.InputJsonValue {
    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.weeklyHours !== undefined) payload.weeklyHours = input.weeklyHours;
    if (input.teacherId !== undefined) payload.teacherId = input.teacherId;
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
