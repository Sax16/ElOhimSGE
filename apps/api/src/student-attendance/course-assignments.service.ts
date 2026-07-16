import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  type CourseAssignmentCreateInput,
  type CourseAssignmentUpdateInput,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { type JwtUser } from '../auth/decorators/current-user.decorator';
import { gradeLabel, sectionShortLabel } from './section-label.util';

const YEAR_CLOSED_MESSAGE = 'El año académico está cerrado — solo lectura';

// Asignación con lo necesario para el DTO de la lista.
const assignmentSelect = {
  id: true,
  teacherId: true,
  teacher: { select: { fullName: true } },
  courseId: true,
  course: {
    select: {
      name: true,
      weeklyHours: true,
      gradeLevelId: true,
      gradeLevel: { select: { name: true, level: { select: { name: true } } } },
    },
  },
  sectionId: true,
  section: { select: { name: true, shift: true } },
} satisfies Prisma.CourseAssignmentSelect;

type AssignmentRow = Prisma.CourseAssignmentGetPayload<{ select: typeof assignmentSelect }>;

@Injectable()
export class CourseAssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private toDto(a: AssignmentRow) {
    return {
      id: a.id,
      teacherId: a.teacherId,
      teacherName: a.teacher.fullName,
      courseId: a.courseId,
      courseName: a.course.name,
      weeklyHours: a.course.weeklyHours,
      gradeLevelId: a.course.gradeLevelId,
      gradeLabel: gradeLabel(a.course.gradeLevel.name, a.course.gradeLevel.level.name),
      sectionId: a.sectionId,
      sectionLabel: sectionShortLabel(a.section.name, a.section.shift),
    };
  }

  // ===== GET /course-assignments?yearId= =====
  async list(yearId: string) {
    const assignments = await this.prisma.courseAssignment.findMany({
      where: { course: { gradeLevel: { level: { academicYearId: yearId } } } },
      orderBy: [
        { course: { gradeLevel: { level: { order: 'asc' } } } },
        { course: { gradeLevel: { order: 'asc' } } },
        { section: { name: 'asc' } },
        { course: { name: 'asc' } },
      ],
      select: assignmentSelect,
    });
    return { assignments: assignments.map((a) => this.toDto(a)) };
  }

  // ===== GET /course-assignments/options?yearId= =====
  async options(yearId: string) {
    const year = await this.prisma.academicYear.findUnique({ where: { id: yearId }, select: { id: true } });
    if (!year) throw new NotFoundException('Año académico no encontrado');

    const [teachers, grades] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: 'DOCENTE', status: 'ACTIVO' },
        orderBy: { fullName: 'asc' },
        select: { id: true, fullName: true },
      }),
      this.prisma.gradeLevel.findMany({
        where: { level: { academicYearId: yearId } },
        orderBy: [{ level: { order: 'asc' } }, { order: 'asc' }],
        select: {
          id: true,
          name: true,
          level: { select: { name: true } },
          courses: { orderBy: { name: 'asc' }, select: { id: true, name: true, weeklyHours: true } },
          sections: {
            orderBy: [{ name: 'asc' }, { shift: 'asc' }],
            select: { id: true, name: true, shift: true },
          },
        },
      }),
    ]);

    return {
      teachers,
      grades: grades.map((g) => ({
        gradeLevelId: g.id,
        label: gradeLabel(g.name, g.level.name),
        courses: g.courses,
        sections: g.sections.map((s) => ({ id: s.id, label: sectionShortLabel(s.name, s.shift) })),
      })),
    };
  }

  // ===== POST /course-assignments =====
  async create(input: CourseAssignmentCreateInput, actor: JwtUser) {
    const [course, section, teacher] = await Promise.all([
      this.prisma.course.findUnique({
        where: { id: input.courseId },
        select: {
          gradeLevelId: true,
          gradeLevel: { select: { level: { select: { academicYear: { select: { status: true } } } } } },
        },
      }),
      this.prisma.section.findUnique({ where: { id: input.sectionId }, select: { gradeLevelId: true } }),
      this.prisma.user.findUnique({ where: { id: input.teacherId }, select: { id: true, role: true } }),
    ]);

    if (!course) throw new NotFoundException('Curso no encontrado');
    if (!section) throw new NotFoundException('Sección no encontrada');
    if (!teacher) throw new NotFoundException('Docente no encontrado');
    if (teacher.role !== 'DOCENTE') {
      throw new UnprocessableEntityException('El usuario seleccionado no es docente');
    }
    if (course.gradeLevel.level.academicYear.status === 'CERRADO') {
      throw new ConflictException(YEAR_CLOSED_MESSAGE);
    }
    if (course.gradeLevelId !== section.gradeLevelId) {
      throw new UnprocessableEntityException('El curso y la sección deben ser del mismo grado');
    }

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        const row = await tx.courseAssignment.create({
          data: { courseId: input.courseId, sectionId: input.sectionId, teacherId: input.teacherId },
          select: assignmentSelect,
        });
        await this.audit.log(
          {
            userId: actor.sub,
            action: 'course-assignment.create',
            entity: 'CourseAssignment',
            entityId: row.id,
            payload: { courseId: input.courseId, sectionId: input.sectionId, teacherId: input.teacherId },
          },
          tx,
        );
        return row;
      });
      return this.toDto(created);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Esa sección ya tiene docente asignado para este curso');
      }
      throw error;
    }
  }

  // ===== PATCH /course-assignments/:id =====
  async update(id: string, input: CourseAssignmentUpdateInput, actor: JwtUser) {
    const existing = await this.loadWithYear(id);

    const teacher = await this.prisma.user.findUnique({
      where: { id: input.teacherId },
      select: { id: true, role: true },
    });
    if (!teacher) throw new NotFoundException('Docente no encontrado');
    if (teacher.role !== 'DOCENTE') {
      throw new UnprocessableEntityException('El usuario seleccionado no es docente');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.courseAssignment.update({
        where: { id },
        data: { teacherId: input.teacherId },
        select: assignmentSelect,
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'course-assignment.update',
          entity: 'CourseAssignment',
          entityId: id,
          payload: { teacherId: input.teacherId, previousTeacherId: existing.teacherId },
        },
        tx,
      );
      return row;
    });
    return this.toDto(updated);
  }

  // ===== DELETE /course-assignments/:id =====
  async remove(id: string, actor: JwtUser) {
    const existing = await this.loadWithYear(id);

    await this.prisma.$transaction(async (tx) => {
      await tx.courseAssignment.delete({ where: { id } });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'course-assignment.delete',
          entity: 'CourseAssignment',
          entityId: id,
          payload: {
            courseId: existing.courseId,
            sectionId: existing.sectionId,
            teacherId: existing.teacherId,
          },
        },
        tx,
      );
    });
  }

  // Carga la asignación y valida que su año esté abierto (409 si cerrado).
  private async loadWithYear(id: string) {
    const assignment = await this.prisma.courseAssignment.findUnique({
      where: { id },
      select: {
        id: true,
        courseId: true,
        sectionId: true,
        teacherId: true,
        course: {
          select: { gradeLevel: { select: { level: { select: { academicYear: { select: { status: true } } } } } } },
        },
      },
    });
    if (!assignment) throw new NotFoundException('Asignación no encontrada');
    if (assignment.course.gradeLevel.level.academicYear.status === 'CERRADO') {
      throw new ConflictException(YEAR_CLOSED_MESSAGE);
    }
    return assignment;
  }
}
