import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  type CourseAssignmentCreateInput,
  type CourseAssignmentUpdateInput,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { type JwtUser } from '../auth/decorators/current-user.decorator';
import { teachingStaffWhere } from '../common/teaching-staff.util';
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

    const [activeTeachers, licenseAssigned, grades] = await Promise.all([
      // Elegibles para asignar: personal con cargo docente (Staff.role DOCENTE) y estado ACTIVO.
      this.prisma.staff.findMany({
        where: { ...teachingStaffWhere, status: 'ACTIVO' },
        orderBy: { code: 'asc' },
        select: { id: true, code: true, fullName: true, status: true },
      }),
      // Docentes en LICENCIA que ya tienen asignación/tutoría en el año: se incluyen marcados
      // (status LICENCIA) para que el front los muestre deshabilitados donde ya aparezcan.
      this.prisma.staff.findMany({
        where: {
          ...teachingStaffWhere,
          status: 'LICENCIA',
          OR: [
            { courseAssignments: { some: { section: { gradeLevel: { level: { academicYearId: yearId } } } } } },
            { tutorOf: { some: { gradeLevel: { level: { academicYearId: yearId } } } } },
          ],
        },
        orderBy: { code: 'asc' },
        select: { id: true, code: true, fullName: true, status: true },
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

    // ACTIVO (elegibles) + LICENCIA ya asignados (deshabilitados), ordenados por código de empleado.
    const teachers = [...activeTeachers, ...licenseAssigned].sort((a, b) => a.code.localeCompare(b.code));

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
      this.loadEligibleTeacher(input.teacherId),
    ]);

    if (!course) throw new NotFoundException('Curso no encontrado');
    if (!section) throw new NotFoundException('Sección no encontrada');
    void teacher; // validado en loadEligibleTeacher (cargo docente + ACTIVO)
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

    await this.loadEligibleTeacher(input.teacherId);

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

  // Valida que el docente sea un EMPLEADO con cargo docente (Staff.role DOCENTE) y ACTIVO.
  // LICENCIA conserva asignaciones existentes pero no es elegible para nuevas; INACTIVO nunca.
  private async loadEligibleTeacher(teacherId: string) {
    const teacher = await this.prisma.staff.findUnique({
      where: { id: teacherId },
      select: { id: true, role: true, status: true },
    });
    if (!teacher) throw new NotFoundException('Docente no encontrado');
    if (teacher.role !== 'DOCENTE') {
      throw new UnprocessableEntityException('El empleado seleccionado no tiene cargo docente');
    }
    if (teacher.status !== 'ACTIVO') {
      throw new UnprocessableEntityException('Solo el personal docente activo puede recibir asignaciones');
    }
    return teacher;
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
