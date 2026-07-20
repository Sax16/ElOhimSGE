import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  timeToMinutes,
  type ScheduleBlocksPutInput,
  type ScheduleCopyInput,
  type ScheduleSlotPutInput,
  type Shift,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { type JwtUser } from '../auth/decorators/current-user.decorator';
import { sectionShortLabel } from '../student-attendance/section-label.util';

const YEAR_CLOSED_MESSAGE = 'El año académico está cerrado — solo lectura';

// Bloque tal como lo exponen los DTOs.
const blockSelect = {
  id: true,
  order: true,
  startTime: true,
  endTime: true,
  isBreak: true,
  label: true,
} satisfies Prisma.ScheduleBlockSelect;

type BlockRow = Prisma.ScheduleBlockGetPayload<{ select: typeof blockSelect }>;

// Sección con lo necesario para resolver nivel, grado, turno y estado del año.
const sectionSelect = {
  id: true,
  name: true,
  shift: true,
  gradeLevelId: true,
  gradeLevel: {
    select: {
      id: true,
      name: true,
      levelId: true,
      level: { select: { id: true, name: true, academicYearId: true, academicYear: { select: { status: true } } } },
    },
  },
} satisfies Prisma.SectionSelect;

type SectionRow = Prisma.SectionGetPayload<{ select: typeof sectionSelect }>;

@Injectable()
export class ScheduleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ===== Helpers de carga =====

  private toBlockDto(b: BlockRow) {
    return {
      id: b.id,
      order: b.order,
      startTime: b.startTime,
      endTime: b.endTime,
      isBreak: b.isBreak,
      label: b.label,
    };
  }

  private async loadLevel(levelId: string) {
    const level = await this.prisma.level.findUnique({
      where: { id: levelId },
      select: { id: true, academicYear: { select: { status: true } } },
    });
    if (!level) throw new NotFoundException('Nivel no encontrado');
    return level;
  }

  private async loadSection(sectionId: string): Promise<SectionRow> {
    const section = await this.prisma.section.findUnique({ where: { id: sectionId }, select: sectionSelect });
    if (!section) throw new NotFoundException('Sección no encontrada');
    return section;
  }

  private assertYearOpen(status: string) {
    if (status === 'CERRADO') throw new ConflictException(YEAR_CLOSED_MESSAGE);
  }

  // ===== GET /schedule/blocks?levelId=&shift= =====

  async blocks(levelId: string, shift: Shift) {
    await this.loadLevel(levelId);
    const blocks = await this.prisma.scheduleBlock.findMany({
      where: { levelId, shift },
      orderBy: { order: 'asc' },
      select: blockSelect,
    });
    return { blocks: blocks.map((b) => this.toBlockDto(b)) };
  }

  // ===== PUT /schedule/blocks — reemplaza la plantilla del nivel+turno =====

  async putBlocks(input: ScheduleBlocksPutInput, actor: JwtUser) {
    const level = await this.loadLevel(input.levelId);
    this.assertYearOpen(level.academicYear.status);

    const existing = await this.prisma.scheduleBlock.findMany({
      where: { levelId: input.levelId, shift: input.shift },
      select: { id: true, order: true, isBreak: true },
    });
    const byOrder = new Map(existing.map((b) => [b.order, b]));
    const incomingOrders = new Set(input.blocks.map((b) => b.order));

    // Bloques que se eliminan (order ya no presente) o que pasan a recreo: no pueden tener slots.
    const removedIds = existing.filter((b) => !incomingOrders.has(b.order)).map((b) => b.id);
    const becomeBreakIds = input.blocks
      .filter((b) => b.isBreak)
      .map((b) => byOrder.get(b.order))
      .filter((b): b is (typeof existing)[number] => Boolean(b) && !b!.isBreak)
      .map((b) => b.id);

    const guardedIds = [...removedIds, ...becomeBreakIds];
    if (guardedIds.length > 0) {
      const slotCount = await this.prisma.scheduleSlot.count({ where: { blockId: { in: guardedIds } } });
      if (slotCount > 0) {
        throw new ConflictException('No puedes eliminar un bloque con clases programadas — vacíalo primero');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      // Elimina los bloques sobrantes.
      if (removedIds.length > 0) {
        await tx.scheduleBlock.deleteMany({ where: { id: { in: removedIds } } });
      }
      // Upsert por (levelId, shift, order).
      for (const b of input.blocks) {
        const label = b.label && b.label.trim().length > 0 ? b.label.trim() : null;
        await tx.scheduleBlock.upsert({
          where: { levelId_shift_order: { levelId: input.levelId, shift: input.shift, order: b.order } },
          update: { startTime: b.startTime, endTime: b.endTime, isBreak: b.isBreak, label },
          create: {
            levelId: input.levelId,
            shift: input.shift,
            order: b.order,
            startTime: b.startTime,
            endTime: b.endTime,
            isBreak: b.isBreak,
            label,
          },
        });
      }
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'schedule.blocks',
          entity: 'ScheduleBlock',
          entityId: `${input.levelId}:${input.shift}`,
          payload: { levelId: input.levelId, shift: input.shift, count: input.blocks.length },
        },
        tx,
      );
    });

    return this.blocks(input.levelId, input.shift);
  }

  // ===== GET /schedule?sectionId= =====

  async schedule(sectionId: string) {
    const section = await this.loadSection(sectionId);
    const levelId = section.gradeLevel.levelId;

    const blocks = await this.prisma.scheduleBlock.findMany({
      where: { levelId, shift: section.shift },
      orderBy: { order: 'asc' },
      select: blockSelect,
    });

    const slots = await this.slotsOfSection(sectionId);
    const hours = await this.hoursOfSection(section.gradeLevelId, sectionId);

    return {
      section: {
        id: section.id,
        label: sectionShortLabel(section.name, section.shift),
        shift: section.shift,
        levelId,
        gradeLevelId: section.gradeLevelId,
      },
      blocks: blocks.map((b) => this.toBlockDto(b)),
      slots,
      hours,
    };
  }

  // Slots de una sección con curso y docente resuelto (CourseAssignment).
  private async slotsOfSection(sectionId: string) {
    const rows = await this.prisma.scheduleSlot.findMany({
      where: { sectionId },
      select: {
        id: true,
        dayOfWeek: true,
        blockId: true,
        courseId: true,
        course: { select: { name: true } },
      },
    });
    if (rows.length === 0) return [];

    // Docente por curso en ESTA sección: CourseAssignment(courseId, sectionId).
    const courseIds = [...new Set(rows.map((r) => r.courseId))];
    const assignments = await this.prisma.courseAssignment.findMany({
      where: { sectionId, courseId: { in: courseIds } },
      select: { courseId: true, teacherId: true, teacher: { select: { fullName: true } } },
    });
    const teacherByCourse = new Map(
      assignments.map((a) => [a.courseId, { id: a.teacherId, name: a.teacher.fullName }]),
    );

    return rows.map((r) => {
      const teacher = teacherByCourse.get(r.courseId) ?? null;
      return {
        id: r.id,
        dayOfWeek: r.dayOfWeek,
        blockId: r.blockId,
        courseId: r.courseId,
        courseName: r.course.name,
        teacherId: teacher?.id ?? null,
        teacherName: teacher?.name ?? null,
      };
    });
  }

  // Horas programadas por curso del grado (scheduled = slots no-recreo asignados a la sección).
  private async hoursOfSection(gradeLevelId: string, sectionId: string) {
    const courses = await this.prisma.course.findMany({
      where: { gradeLevelId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, weeklyHours: true },
    });
    // Cuenta slots no-recreo por curso (el bloque de un slot nunca es recreo, validado al asignar).
    const grouped = await this.prisma.scheduleSlot.groupBy({
      by: ['courseId'],
      where: { sectionId, block: { isBreak: false } },
      _count: { _all: true },
    });
    const scheduledByCourse = new Map(grouped.map((g) => [g.courseId, g._count._all]));

    return courses.map((c) => ({
      courseId: c.id,
      courseName: c.name,
      weeklyHours: c.weeklyHours,
      scheduled: scheduledByCourse.get(c.id) ?? 0,
    }));
  }

  // ===== PUT /schedule/slot — asigna o vacía una celda =====

  async putSlot(input: ScheduleSlotPutInput, actor: JwtUser) {
    const section = await this.loadSection(input.sectionId);
    this.assertYearOpen(section.gradeLevel.level.academicYear.status);

    // El bloque debe ser del nivel+turno de la sección.
    const block = await this.prisma.scheduleBlock.findUnique({
      where: { id: input.blockId },
      select: { id: true, levelId: true, shift: true, isBreak: true, startTime: true, endTime: true },
    });
    if (!block || block.levelId !== section.gradeLevel.levelId || block.shift !== section.shift) {
      throw new UnprocessableEntityException('El bloque no pertenece al nivel y turno de la sección');
    }
    if (block.isBreak) {
      throw new UnprocessableEntityException('Los recreos no llevan curso');
    }

    // courseId null → vaciar la celda.
    if (input.courseId === null) {
      await this.prisma.$transaction(async (tx) => {
        await tx.scheduleSlot.deleteMany({
          where: { sectionId: input.sectionId, dayOfWeek: input.dayOfWeek, blockId: input.blockId },
        });
        await this.audit.log(
          {
            userId: actor.sub,
            action: 'schedule.slot',
            entity: 'ScheduleSlot',
            entityId: `${input.sectionId}:${input.dayOfWeek}:${input.blockId}`,
            payload: { sectionId: input.sectionId, dayOfWeek: input.dayOfWeek, blockId: input.blockId, courseId: null },
          },
          tx,
        );
      });
      const hours = await this.hoursOfSection(section.gradeLevelId, input.sectionId);
      return { slot: null, hours };
    }

    // El curso debe ser del grado de la sección.
    const course = await this.prisma.course.findUnique({
      where: { id: input.courseId },
      select: { id: true, name: true, gradeLevelId: true },
    });
    if (!course || course.gradeLevelId !== section.gradeLevelId) {
      throw new UnprocessableEntityException('El curso no pertenece al grado de la sección');
    }

    // CHOQUE de docente: si el curso tiene docente en esta sección, ninguna otra sección puede tener
    // al mismo docente en un bloque que SOLAPE en horas el mismo día.
    const clash = await this.findTeacherClash({
      courseId: course.id,
      sectionId: input.sectionId,
      gradeLevelId: section.gradeLevelId,
      dayOfWeek: input.dayOfWeek,
      startTime: block.startTime,
      endTime: block.endTime,
      excludeBlockId: input.blockId,
    });
    if (clash) throw new ConflictException(clash);

    const slot = await this.prisma.$transaction(async (tx) => {
      const row = await tx.scheduleSlot.upsert({
        where: {
          sectionId_dayOfWeek_blockId: {
            sectionId: input.sectionId,
            dayOfWeek: input.dayOfWeek,
            blockId: input.blockId,
          },
        },
        update: { courseId: course.id },
        create: {
          sectionId: input.sectionId,
          dayOfWeek: input.dayOfWeek,
          blockId: input.blockId,
          courseId: course.id,
          createdById: actor.sub,
        },
        select: { id: true, dayOfWeek: true, blockId: true, courseId: true },
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'schedule.slot',
          entity: 'ScheduleSlot',
          entityId: row.id,
          payload: { sectionId: input.sectionId, dayOfWeek: input.dayOfWeek, blockId: input.blockId, courseId: course.id },
        },
        tx,
      );
      return row;
    });

    // Docente resuelto para el DTO del slot.
    const assignment = await this.prisma.courseAssignment.findUnique({
      where: { courseId_sectionId: { courseId: course.id, sectionId: input.sectionId } },
      select: { teacherId: true, teacher: { select: { fullName: true } } },
    });
    const hours = await this.hoursOfSection(section.gradeLevelId, input.sectionId);
    return {
      slot: {
        id: slot.id,
        dayOfWeek: slot.dayOfWeek,
        blockId: slot.blockId,
        courseId: slot.courseId,
        courseName: course.name,
        teacherId: assignment?.teacherId ?? null,
        teacherName: assignment?.teacher.fullName ?? null,
      },
      hours,
    };
  }

  // Busca un choque de docente para (curso×sección) en un día/rango horario. Devuelve el mensaje o null.
  private async findTeacherClash(params: {
    courseId: string;
    sectionId: string;
    gradeLevelId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    excludeBlockId: string;
  }): Promise<string | null> {
    // Docente del curso en esta sección (si no hay, no puede haber choque).
    const assignment = await this.prisma.courseAssignment.findUnique({
      where: { courseId_sectionId: { courseId: params.courseId, sectionId: params.sectionId } },
      select: { teacherId: true, teacher: { select: { fullName: true } } },
    });
    if (!assignment) return null;

    const teacherId = assignment.teacherId;
    const year = await this.prisma.gradeLevel.findUnique({
      where: { id: params.gradeLevelId },
      select: { level: { select: { academicYearId: true } } },
    });
    const academicYearId = year?.level.academicYearId;

    // Todos los slots del año activo cuyo curso×sección tenga el mismo docente ese día,
    // excluyendo la propia celda destino.
    const candidates = await this.prisma.scheduleSlot.findMany({
      where: {
        dayOfWeek: params.dayOfWeek,
        section: { gradeLevel: { level: { academicYearId } } },
        course: { assignments: { some: { teacherId } } },
        NOT: { AND: [{ sectionId: params.sectionId }, { blockId: params.excludeBlockId }] },
      },
      select: {
        courseId: true,
        sectionId: true,
        section: { select: { name: true, shift: true } },
        course: { select: { name: true } },
        block: { select: { startTime: true, endTime: true } },
      },
    });

    const start = timeToMinutes(params.startTime);
    const end = timeToMinutes(params.endTime);
    for (const c of candidates) {
      // El docente de ese slot debe ser el mismo EN SU sección (CourseAssignment por curso×sección).
      const a = await this.prisma.courseAssignment.findUnique({
        where: { courseId_sectionId: { courseId: c.courseId, sectionId: c.sectionId } },
        select: { teacherId: true },
      });
      if (a?.teacherId !== teacherId) continue;

      const cStart = timeToMinutes(c.block.startTime);
      const cEnd = timeToMinutes(c.block.endTime);
      // Solape de horas: start < cEnd && cStart < end.
      if (start < cEnd && cStart < end) {
        return `El docente ${assignment.teacher.fullName} ya tiene ${c.course.name} en ${sectionShortLabel(
          c.section.name,
          c.section.shift,
        )} ese día de ${c.block.startTime} a ${c.block.endTime}`;
      }
    }
    return null;
  }

  // ===== POST /schedule/copy =====

  async copy(input: ScheduleCopyInput, actor: JwtUser) {
    const [from, to] = await Promise.all([
      this.loadSection(input.fromSectionId),
      this.loadSection(input.toSectionId),
    ]);
    this.assertYearOpen(to.gradeLevel.level.academicYear.status);

    // Mismo nivel + turno.
    if (from.gradeLevel.levelId !== to.gradeLevel.levelId || from.shift !== to.shift) {
      throw new UnprocessableEntityException('Las secciones deben ser del mismo nivel y turno');
    }

    // Slots de origen con curso y bloque.
    const sourceSlots = await this.prisma.scheduleSlot.findMany({
      where: { sectionId: input.fromSectionId },
      orderBy: [{ dayOfWeek: 'asc' }, { block: { order: 'asc' } }],
      select: {
        dayOfWeek: true,
        blockId: true,
        course: { select: { name: true } },
        block: { select: { startTime: true, endTime: true } },
      },
    });

    // Cursos del grado destino por nombre → id (para resolver equivalencias entre grados distintos).
    const destCourses = await this.prisma.course.findMany({
      where: { gradeLevelId: to.gradeLevelId },
      select: { id: true, name: true },
    });
    const destCourseByName = new Map(destCourses.map((c) => [c.name, c.id]));

    const skipped: { dayOfWeek: number; blockLabel: string; courseName: string; reason: string }[] = [];
    const toCopy: { dayOfWeek: number; blockId: string; courseId: string }[] = [];

    for (const s of sourceSlots) {
      const blockLabel = `${s.block.startTime}–${s.block.endTime}`;
      const destCourseId = destCourseByName.get(s.course.name);
      if (!destCourseId) {
        skipped.push({ dayOfWeek: s.dayOfWeek, blockLabel, courseName: s.course.name, reason: 'curso no existe en el grado' });
        continue;
      }
      // Choque de docente en destino (excluyendo la propia celda, que se reemplazará).
      const clash = await this.findTeacherClash({
        courseId: destCourseId,
        sectionId: input.toSectionId,
        gradeLevelId: to.gradeLevelId,
        dayOfWeek: s.dayOfWeek,
        startTime: s.block.startTime,
        endTime: s.block.endTime,
        excludeBlockId: s.blockId,
      });
      if (clash) {
        skipped.push({ dayOfWeek: s.dayOfWeek, blockLabel, courseName: s.course.name, reason: 'choque de docente' });
        continue;
      }
      toCopy.push({ dayOfWeek: s.dayOfWeek, blockId: s.blockId, courseId: destCourseId });
    }

    await this.prisma.$transaction(async (tx) => {
      // Reemplaza el horario destino completo.
      await tx.scheduleSlot.deleteMany({ where: { sectionId: input.toSectionId } });
      for (const c of toCopy) {
        await tx.scheduleSlot.create({
          data: {
            sectionId: input.toSectionId,
            dayOfWeek: c.dayOfWeek,
            blockId: c.blockId,
            courseId: c.courseId,
            createdById: actor.sub,
          },
        });
      }
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'schedule.copy',
          entity: 'ScheduleSlot',
          entityId: input.toSectionId,
          payload: {
            fromSectionId: input.fromSectionId,
            toSectionId: input.toSectionId,
            copied: toCopy.length,
            skipped: skipped.length,
          },
        },
        tx,
      );
    });

    return { copied: toCopy.length, skipped };
  }

  // ===== GET /schedule/my-week — horario del docente actual (solo lectura) =====

  async myWeek(actor: JwtUser) {
    // Slots del año activo cuyo curso×sección tiene CourseAssignment.teacherId = actor.
    const slots = await this.prisma.scheduleSlot.findMany({
      where: {
        section: { gradeLevel: { level: { academicYear: { status: 'ACTIVO' } } } },
        course: { assignments: { some: { teacherId: actor.sub } } },
      },
      select: {
        dayOfWeek: true,
        courseId: true,
        sectionId: true,
        course: { select: { name: true } },
        section: { select: { name: true, shift: true } },
        block: { select: { startTime: true, endTime: true } },
      },
    });

    // Filtra a los slots cuyo docente EN SU sección es realmente el actor (CourseAssignment por curso×sección).
    const items: { dayOfWeek: number; startTime: string; endTime: string; courseName: string; sectionLabel: string }[] = [];
    const teacherCache = new Map<string, string | null>();
    for (const s of slots) {
      const key = `${s.courseId}:${s.sectionId}`;
      let teacherId = teacherCache.get(key);
      if (teacherId === undefined) {
        const a = await this.prisma.courseAssignment.findUnique({
          where: { courseId_sectionId: { courseId: s.courseId, sectionId: s.sectionId } },
          select: { teacherId: true },
        });
        teacherId = a?.teacherId ?? null;
        teacherCache.set(key, teacherId);
      }
      if (teacherId !== actor.sub) continue;
      items.push({
        dayOfWeek: s.dayOfWeek,
        startTime: s.block.startTime,
        endTime: s.block.endTime,
        courseName: s.course.name,
        sectionLabel: sectionShortLabel(s.section.name, s.section.shift),
      });
    }

    items.sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime));
    return { items };
  }
}
