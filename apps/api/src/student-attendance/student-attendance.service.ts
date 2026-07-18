import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  STUDENT_ATTENDANCE_STATUS_LETTERS,
  type SectionTeacherRole,
  type StudentAttendanceCorrectInput,
  type StudentAttendanceSaveInput,
  type StudentAttendanceStatus,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { type JwtUser } from '../auth/decorators/current-user.decorator';
import { dateToISO, isoToDate } from '../common/installment-view.util';
import { limaTodayISO } from '../common/lima-time.util';
import { getHolidaySet } from '../common/holidays.util';
import { buildStudentAttendanceWorkbook } from './student-attendance.xlsx';
import {
  emptyCounts,
  isBusinessDayISO,
  sectionFullLabel,
  type SectionLabelParts,
} from './section-label.util';

// Sección con lo mínimo para etiqueta + año.
const sectionSelect = {
  id: true,
  name: true,
  shift: true,
  tutorId: true,
  gradeLevel: {
    select: {
      name: true,
      level: { select: { name: true, academicYearId: true, academicYear: { select: { status: true } } } },
    },
  },
} satisfies Prisma.SectionSelect;

type SectionRow = Prisma.SectionGetPayload<{ select: typeof sectionSelect }>;

// Matrícula del roster: alumno + apoderado de contacto principal.
const rosterEnrollmentSelect = {
  id: true,
  student: {
    select: {
      code: true,
      firstNames: true,
      paternalLastName: true,
      maternalLastName: true,
      guardians: {
        where: { isPrimary: true, active: true },
        select: { guardian: { select: { fullName: true, phone: true } } },
        take: 1,
      },
    },
  },
} satisfies Prisma.EnrollmentSelect;

type RosterEnrollment = Prisma.EnrollmentGetPayload<{ select: typeof rosterEnrollmentSelect }>;

// Entrada de asistencia con lo necesario para el shape del roster.
const entrySelect = {
  id: true,
  enrollmentId: true,
  status: true,
  correctedById: true,
} satisfies Prisma.StudentAttendanceEntrySelect;

type EntryRow = Prisma.StudentAttendanceEntryGetPayload<{ select: typeof entrySelect }>;

// "Quispe Roca, María" — apellidos, nombres.
function fullName(s: { paternalLastName: string; maternalLastName: string | null; firstNames: string }): string {
  const last = [s.paternalLastName, s.maternalLastName].filter(Boolean).join(' ');
  return `${last}, ${s.firstNames}`;
}

function primaryGuardian(e: RosterEnrollment): { name: string | null; phone: string | null } {
  const link = e.student.guardians[0];
  return { name: link?.guardian.fullName ?? null, phone: link?.guardian.phone ?? null };
}

@Injectable()
export class StudentAttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ===== Utilidades comunes =====

  private async activeYear() {
    const year = await this.prisma.academicYear.findFirst({
      where: { status: 'ACTIVO' },
      select: { id: true, startDate: true, endDate: true },
    });
    if (!year) throw new NotFoundException('No hay un año académico activo');
    return year;
  }

  private isAdmin(actor: JwtUser): boolean {
    return actor.role === 'ADMIN';
  }

  // ¿El actor (docente) es tutor de la sección o tiene una asignación de curso en ella?
  private async ownsSection(actor: JwtUser, section: SectionRow): Promise<boolean> {
    if (section.tutorId === actor.sub) return true;
    const assignment = await this.prisma.courseAssignment.findFirst({
      where: { sectionId: section.id, teacherId: actor.sub },
      select: { id: true },
    });
    return Boolean(assignment);
  }

  private label(s: SectionLabelParts): string {
    return sectionFullLabel(s);
  }

  // ===== GET /student-attendance/my-sections =====

  async mySections(actor: JwtUser, dateISO?: string) {
    const year = await this.activeYear();
    const date = dateISO ?? limaTodayISO();

    // Docente: solo secciones donde es tutor o tiene asignación. Otros con permiso: todas del año.
    const assignments = await this.prisma.courseAssignment.findMany({
      where: {
        section: { gradeLevel: { level: { academicYearId: year.id } } },
        ...(this.isAdmin(actor) ? {} : { teacherId: actor.sub }),
      },
      select: { sectionId: true, teacherId: true, course: { select: { name: true } } },
    });

    // Cursos asignados al actor por sección (para courseNames).
    const myCourseNames = new Map<string, string[]>();
    for (const a of assignments) {
      if (a.teacherId !== actor.sub) continue;
      const list = myCourseNames.get(a.sectionId) ?? [];
      list.push(a.course.name);
      myCourseNames.set(a.sectionId, list);
    }

    let sections: SectionRow[];
    if (this.isAdmin(actor)) {
      sections = await this.prisma.section.findMany({
        where: { gradeLevel: { level: { academicYearId: year.id } } },
        orderBy: [{ gradeLevel: { level: { order: 'asc' } } }, { gradeLevel: { order: 'asc' } }, { name: 'asc' }],
        select: sectionSelect,
      });
    } else {
      const sectionIds = new Set<string>(assignments.filter((a) => a.teacherId === actor.sub).map((a) => a.sectionId));
      const tutorSections = await this.prisma.section.findMany({
        where: { tutorId: actor.sub, gradeLevel: { level: { academicYearId: year.id } } },
        select: { id: true },
      });
      for (const s of tutorSections) sectionIds.add(s.id);
      sections = await this.prisma.section.findMany({
        where: { id: { in: [...sectionIds] } },
        orderBy: [{ gradeLevel: { level: { order: 'asc' } } }, { gradeLevel: { order: 'asc' } }, { name: 'asc' }],
        select: sectionSelect,
      });
    }

    const ids = sections.map((s) => s.id);
    if (ids.length === 0) return { date, sections: [] };

    const dateObj = isoToDate(date);
    const [counts, entries] = await Promise.all([
      this.prisma.enrollment.groupBy({
        by: ['sectionId'],
        where: { sectionId: { in: ids }, canceledAt: null, student: { status: { in: ['ACTIVO', 'BECADO'] } } },
        _count: { _all: true },
      }),
      this.prisma.studentAttendanceEntry.findMany({
        where: { date: dateObj, enrollment: { sectionId: { in: ids } } },
        select: { status: true, enrollment: { select: { sectionId: true } } },
      }),
    ]);

    const studentCount = new Map<string, number>();
    for (const c of counts) studentCount.set(c.sectionId, c._count._all);

    const takeCounts = new Map<string, Record<StudentAttendanceStatus, number>>();
    for (const e of entries) {
      const sid = e.enrollment.sectionId;
      const map = takeCounts.get(sid) ?? emptyCounts();
      map[e.status] += 1;
      takeCounts.set(sid, map);
    }

    const rows = sections.map((s) => {
      const isTutor = s.tutorId === actor.sub;
      const role: SectionTeacherRole = isTutor ? 'TUTOR' : 'DOCENTE';
      const taken = takeCounts.has(s.id);
      return {
        sectionId: s.id,
        label: this.label(s),
        shift: s.shift,
        role,
        courseNames: myCourseNames.get(s.id) ?? [],
        studentCount: studentCount.get(s.id) ?? 0,
        taken,
        counts: taken ? takeCounts.get(s.id)! : null,
      };
    });

    return { date, sections: rows };
  }

  // ===== GET /student-attendance/roster =====

  async roster(actor: JwtUser, sectionId: string, date: string) {
    const section = await this.loadSection(sectionId);
    if (!this.isAdmin(actor) && !(await this.ownsSection(actor, section))) {
      throw new ForbiddenException('No tienes acceso a esta sección');
    }

    const year = await this.activeYear();
    const dateObj = isoToDate(date);

    const [enrollments, entries] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: {
          sectionId,
          canceledAt: null,
          academicYearId: year.id,
          student: { status: { in: ['ACTIVO', 'BECADO'] } },
        },
        orderBy: [
          { student: { paternalLastName: 'asc' } },
          { student: { maternalLastName: 'asc' } },
          { student: { firstNames: 'asc' } },
        ],
        select: rosterEnrollmentSelect,
      }),
      this.prisma.studentAttendanceEntry.findMany({
        where: { date: dateObj, enrollment: { sectionId } },
        select: entrySelect,
      }),
    ]);

    const byEnrollment = new Map(entries.map((e) => [e.enrollmentId, e]));
    const editable = await this.computeEditable(actor, section, date, entries.length > 0);

    return {
      section: { id: section.id, label: this.label(section), shift: section.shift },
      date,
      editable,
      taken: entries.length > 0,
      entries: enrollments.map((e) => this.rosterEntry(e, byEnrollment.get(e.id))),
    };
  }

  private rosterEntry(e: RosterEnrollment, entry: EntryRow | undefined) {
    const g = primaryGuardian(e);
    return {
      id: entry?.id ?? null,
      enrollmentId: e.id,
      studentCode: e.student.code,
      fullName: fullName(e.student),
      status: entry?.status ?? null,
      corrected: Boolean(entry?.correctedById),
      guardianName: g.name,
      guardianPhone: g.phone,
    };
  }

  // editable: día futuro / no hábil / feriado / año cerrado → false. Docente: solo HOY y su sección.
  // Admin: HOY siempre; día pasado solo si la toma NO existe (existente → corrección individual).
  private async computeEditable(
    actor: JwtUser,
    section: SectionRow,
    date: string,
    taken: boolean,
  ): Promise<boolean> {
    const today = limaTodayISO();
    if (date > today) return false;
    if (!isBusinessDayISO(date)) return false;
    // Feriado (día no lectivo): no se toma asistencia.
    const holidays = await getHolidaySet(this.prisma, date, date);
    if (holidays.has(date)) return false;
    if (section.gradeLevel.level.academicYear.status === 'CERRADO') return false;

    if (!this.isAdmin(actor)) {
      if (date !== today) return false;
      return this.ownsSection(actor, section);
    }
    if (date === today) return true;
    return !taken; // día pasado: solo crear la toma olvidada
  }

  // ===== PUT /student-attendance =====

  async save(input: StudentAttendanceSaveInput, actor: JwtUser) {
    const today = limaTodayISO();
    const date = input.date;

    if (date > today) throw new BadRequestException('No puedes registrar asistencia de una fecha futura');
    if (!isBusinessDayISO(date)) {
      throw new UnprocessableEntityException(
        'Solo se registra asistencia en días hábiles (lunes a viernes)',
      );
    }

    // Feriado (día no lectivo): no se toma asistencia.
    const holidays = await getHolidaySet(this.prisma, date, date);
    if (holidays.has(date)) {
      throw new UnprocessableEntityException('Día no lectivo (feriado): no se toma asistencia');
    }

    const year = await this.activeYear();
    const startISO = dateToISO(year.startDate);
    const endISO = dateToISO(year.endDate);
    if (date < startISO || date > endISO) {
      throw new BadRequestException('La fecha está fuera del año académico activo');
    }

    const section = await this.loadSection(input.sectionId);
    if (section.gradeLevel.level.academicYear.status === 'CERRADO') {
      throw new ConflictException('El año académico está cerrado — solo lectura');
    }
    if (section.gradeLevel.level.academicYearId !== year.id) {
      throw new BadRequestException('La sección no pertenece al año académico activo');
    }

    const isAdmin = this.isAdmin(actor);
    const isToday = date === today;

    // Docente: solo su sección y solo HOY.
    if (!isAdmin) {
      if (!(await this.ownsSection(actor, section))) {
        throw new ForbiddenException('No tienes acceso a esta sección');
      }
      if (!isToday) {
        throw new ForbiddenException('Solo puedes registrar la asistencia de hoy');
      }
    }

    // Matrículas válidas de la sección (para validar pertenencia).
    const validEnrollments = await this.prisma.enrollment.findMany({
      where: { sectionId: section.id, canceledAt: null },
      select: { id: true },
    });
    const validIds = new Set(validEnrollments.map((e) => e.id));
    for (const entry of input.entries) {
      if (!validIds.has(entry.enrollmentId)) {
        throw new BadRequestException('Una de las matrículas no pertenece a la sección');
      }
    }

    const dateObj = isoToDate(date);
    const existing = await this.prisma.studentAttendanceEntry.findMany({
      where: { date: dateObj, enrollment: { sectionId: section.id } },
      select: { enrollmentId: true, correctedById: true },
    });
    const hasRecords = existing.length > 0;

    // Admin en día pasado con toma existente: no se pisa en bloque; se corrige individualmente.
    if (isAdmin && !isToday && hasRecords) {
      throw new ConflictException(
        'La toma de este día ya existe; usa la corrección individual para cambiar un registro',
      );
    }

    const correctedSet = new Set(existing.filter((e) => e.correctedById).map((e) => e.enrollmentId));

    const result = await this.prisma.$transaction(async (tx) => {
      let saved = 0;
      let skippedCorrected = 0;
      for (const entry of input.entries) {
        // No pisar entradas ya corregidas por Admin.
        if (correctedSet.has(entry.enrollmentId)) {
          skippedCorrected += 1;
          continue;
        }
        await tx.studentAttendanceEntry.upsert({
          where: { enrollmentId_date: { enrollmentId: entry.enrollmentId, date: dateObj } },
          create: {
            enrollmentId: entry.enrollmentId,
            date: dateObj,
            status: entry.status,
            markedById: actor.sub,
          },
          update: { status: entry.status, markedById: actor.sub, markedAt: new Date() },
        });
        saved += 1;
      }

      // Conteos del estado final de la toma completa.
      const finalEntries = await tx.studentAttendanceEntry.findMany({
        where: { date: dateObj, enrollment: { sectionId: section.id } },
        select: { status: true },
      });
      const counts = emptyCounts();
      for (const e of finalEntries) counts[e.status] += 1;

      await this.audit.log(
        {
          userId: actor.sub,
          action: 'student-attendance.save',
          entity: 'Section',
          entityId: section.id,
          payload: { date, sectionId: section.id, saved, skippedCorrected, counts },
        },
        tx,
      );

      return { saved, skippedCorrected, counts };
    });

    return result;
  }

  // ===== PATCH /student-attendance/:id/correct (solo ADMIN) =====

  async correct(id: string, input: StudentAttendanceCorrectInput, actor: JwtUser) {
    if (!this.isAdmin(actor)) {
      throw new ForbiddenException('Solo un administrador puede corregir la asistencia');
    }

    const entry = await this.prisma.studentAttendanceEntry.findUnique({
      where: { id },
      select: { id: true, enrollment: { select: rosterEnrollmentSelect } },
    });
    if (!entry) throw new NotFoundException('Registro de asistencia no encontrado');

    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.studentAttendanceEntry.update({
        where: { id },
        data: {
          status: input.status,
          correctedById: actor.sub,
          correctedAt: new Date(),
          correctionReason: input.reason,
        },
        select: entrySelect,
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'student-attendance.correct',
          entity: 'StudentAttendanceEntry',
          entityId: id,
          payload: { status: input.status, reason: input.reason },
        },
        tx,
      );
      return row;
    });

    return this.rosterEntry(entry.enrollment, updated);
  }

  // ===== GET /student-attendance/monthly =====

  async monthly(actor: JwtUser, sectionId: string, month: string) {
    const { section, days, students } = await this.monthlyData(actor, sectionId, month);
    return {
      section: { id: section.id, label: this.label(section), shift: section.shift },
      month,
      days,
      students,
    };
  }

  async exportMonthly(actor: JwtUser, sectionId: string, month: string) {
    const { section, days, students } = await this.monthlyData(actor, sectionId, month);
    const buffer = await buildStudentAttendanceWorkbook(this.label(section), month, days, students);
    // "3° A · Primaria" → "3A-primaria" (slug simple para el nombre de archivo).
    const slug = `${section.gradeLevel.name}${section.name}-${section.gradeLevel.level.name}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '');
    return { buffer, filename: `asistencia-${slug}-${month}.xlsx` };
  }

  private async monthlyData(actor: JwtUser, sectionId: string, month: string) {
    const section = await this.loadSection(sectionId);
    if (!this.isAdmin(actor) && !(await this.ownsSection(actor, section))) {
      throw new ForbiddenException('No tienes acceso a esta sección');
    }

    const [yearStr, monthStr] = month.split('-');
    const start = isoToDate(`${yearStr}-${monthStr}-01`);
    const monthNum = Number(monthStr);
    const yearNum = Number(yearStr);
    const endYear = monthNum === 12 ? yearNum + 1 : yearNum;
    const endMonth = monthNum === 12 ? 1 : monthNum + 1;
    const end = isoToDate(`${endYear}-${String(endMonth).padStart(2, '0')}-01`);

    const [enrollments, entries] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { sectionId, canceledAt: null, student: { status: { in: ['ACTIVO', 'BECADO'] } } },
        orderBy: [
          { student: { paternalLastName: 'asc' } },
          { student: { maternalLastName: 'asc' } },
          { student: { firstNames: 'asc' } },
        ],
        select: {
          id: true,
          student: { select: { code: true, firstNames: true, paternalLastName: true, maternalLastName: true } },
        },
      }),
      this.prisma.studentAttendanceEntry.findMany({
        where: { date: { gte: start, lt: end }, enrollment: { sectionId } },
        select: { enrollmentId: true, date: true, status: true },
      }),
    ]);

    // Días hábiles con al menos un registro, en orden cronológico.
    const daySet = new Set<string>();
    // enrollmentId → dateISO → letra.
    const byStudent = new Map<string, Map<string, string>>();
    for (const e of entries) {
      const iso = dateToISO(e.date);
      if (!isBusinessDayISO(iso)) continue;
      daySet.add(iso);
      const map = byStudent.get(e.enrollmentId) ?? new Map<string, string>();
      map.set(iso, STUDENT_ATTENDANCE_STATUS_LETTERS[e.status]);
      byStudent.set(e.enrollmentId, map);
    }
    const days = [...daySet].sort();

    const students = enrollments.map((en) => {
      const marks = byStudent.get(en.id);
      const byDate: Record<string, string> = {};
      const totals = emptyCounts();
      for (const iso of days) {
        const letter = marks?.get(iso);
        if (!letter) continue;
        byDate[iso] = letter;
        if (letter === 'P') totals.PRESENTE += 1;
        else if (letter === 'T') totals.TARDANZA += 1;
        else if (letter === 'F') totals.FALTA += 1;
        else if (letter === 'J') totals.JUSTIFICADA += 1;
      }
      const recorded = totals.PRESENTE + totals.TARDANZA + totals.FALTA + totals.JUSTIFICADA;
      const pct = recorded > 0 ? Math.round(((totals.PRESENTE + totals.TARDANZA) / recorded) * 100) : null;
      return {
        studentCode: en.student.code,
        fullName: fullName(en.student),
        byDate,
        totals,
        pct,
      };
    });

    return { section, days, students };
  }

  // ===== Helper compartido =====

  private async loadSection(sectionId: string): Promise<SectionRow> {
    const section = await this.prisma.section.findUnique({ where: { id: sectionId }, select: sectionSelect });
    if (!section) throw new NotFoundException('Sección no encontrada');
    return section;
  }
}
