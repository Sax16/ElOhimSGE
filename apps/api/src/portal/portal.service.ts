import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  ANNOUNCEMENT_SCOPE_LABELS,
  STUDENT_ATTENDANCE_STATUS_LETTERS,
  fromCents,
  type StudentAttendanceStatus,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { type JwtUser } from '../auth/decorators/current-user.decorator';
import { decimalToCents } from '../common/money.util';
import {
  commitmentOverrides,
  dateToISO,
  effectiveDueDate,
  isoToDate,
  todayISO,
} from '../common/installment-view.util';
import { limaTodayISO } from '../common/lima-time.util';
import {
  gradeLabel,
  sectionFullLabel,
  type SectionLabelParts,
} from '../student-attendance/section-label.util';
import { GradesService } from '../grades/grades.service';
import { ScheduleService } from '../schedule/schedule.service';

// Sección con lo necesario para etiqueta + ids de alcance (nivel/grado/sección).
const sectionSelect = {
  id: true,
  name: true,
  shift: true,
  gradeLevelId: true,
  gradeLevel: { select: { name: true, levelId: true, level: { select: { name: true } } } },
} satisfies Prisma.SectionSelect;

type SectionRow = Prisma.SectionGetPayload<{ select: typeof sectionSelect }>;

// Placement de un hijo: ids para validar alcance de comunicados.
interface Placement {
  sectionId: string;
  gradeLevelId: string;
  levelId: string;
}

// Nombre natural del estudiante: "María Quispe Roca".
function naturalName(s: {
  firstNames: string;
  paternalLastName: string;
  maternalLastName: string | null;
}): string {
  return [s.firstNames, s.paternalLastName, s.maternalLastName].filter(Boolean).join(' ');
}

function money(value: Prisma.Decimal): string {
  return value.toFixed(2);
}

// Contadores de asistencia por letra (P/T/F/J).
type LetterCounts = { P: number; T: number; F: number; J: number };
function emptyLetterCounts(): LetterCounts {
  return { P: 0, T: 0, F: 0, J: 0 };
}

// Límites [inicio, finExclusivo) de un mes yyyy-mm (columnas @db.Date UTC medianoche).
function monthBounds(monthISO: string): { start: Date; endExclusive: Date } {
  const year = Number(monthISO.slice(0, 4));
  const month = Number(monthISO.slice(5, 7));
  const start = isoToDate(`${monthISO}-01`);
  const endYear = month === 12 ? year + 1 : year;
  const endMonth = month === 12 ? 1 : month + 1;
  const endExclusive = isoToDate(`${endYear}-${String(endMonth).padStart(2, '0')}-01`);
  return { start, endExclusive };
}

/**
 * Portal del apoderado (v1.0.0): vistas de SOLO LECTURA de los hijos del apoderado autenticado.
 * Solo el rol APODERADO accede; todo se deriva del Guardian vinculado a User.userId. Cada hijo se
 * valida como suyo (matrícula vigente del año activo, vínculo activo). Reutiliza reglas ya
 * existentes (fecha efectiva de cuotas, notas de la libreta, horario de la sección).
 */
@Injectable()
export class PortalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly grades: GradesService,
    private readonly schedule: ScheduleService,
  ) {}

  // ===== Utilidades comunes =====

  private async activeYearId(): Promise<string> {
    const year = await this.prisma.academicYear.findFirst({
      where: { status: 'ACTIVO' },
      select: { id: true },
    });
    if (!year) throw new NotFoundException('No hay un año académico activo');
    return year.id;
  }

  // Apoderado vinculado al usuario autenticado. Solo APODERADO; sin guardian → 403.
  private async resolveGuardian(actor: JwtUser) {
    if (actor.role !== 'APODERADO') {
      throw new ForbiddenException('Solo para apoderados');
    }
    const guardian = await this.prisma.guardian.findUnique({
      where: { userId: actor.sub },
      select: { id: true, fullName: true },
    });
    if (!guardian) throw new ForbiddenException('Solo para apoderados');
    return guardian;
  }

  // Valida que la matrícula sea de un hijo del apoderado (vigente, año activo, vínculo activo).
  private async childEnrollment(guardianId: string, enrollmentId: string) {
    const yearId = await this.activeYearId();
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        id: enrollmentId,
        academicYearId: yearId,
        canceledAt: null,
        student: {
          status: { in: ['ACTIVO', 'BECADO'] },
          guardians: { some: { guardianId, active: true } },
        },
      },
      select: { id: true, section: { select: sectionSelect } },
    });
    if (!enrollment) throw new NotFoundException('Estudiante no encontrado');
    return enrollment;
  }

  private placementOf(section: SectionRow): Placement {
    return { sectionId: section.id, gradeLevelId: section.gradeLevelId, levelId: section.gradeLevel.levelId };
  }

  // Placements de todos los hijos vigentes del apoderado (para el alcance de comunicados).
  private async childrenPlacements(guardianId: string, yearId: string): Promise<Placement[]> {
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        academicYearId: yearId,
        canceledAt: null,
        student: {
          status: { in: ['ACTIVO', 'BECADO'] },
          guardians: { some: { guardianId, active: true } },
        },
      },
      select: { section: { select: sectionSelect } },
    });
    return enrollments.map((e) => this.placementOf(e.section));
  }

  // ===== GET /portal/me =====

  async me(actor: JwtUser) {
    const guardian = await this.resolveGuardian(actor);
    const yearId = await this.activeYearId();

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        academicYearId: yearId,
        canceledAt: null,
        student: {
          status: { in: ['ACTIVO', 'BECADO'] },
          guardians: { some: { guardianId: guardian.id, active: true } },
        },
      },
      orderBy: [
        { student: { firstNames: 'asc' } },
        { student: { paternalLastName: 'asc' } },
      ],
      select: {
        id: true,
        section: { select: sectionSelect },
        student: {
          select: {
            code: true,
            firstNames: true,
            paternalLastName: true,
            maternalLastName: true,
            guardians: {
              where: { guardianId: guardian.id, active: true },
              take: 1,
              select: { isPrimary: true },
            },
          },
        },
      },
    });

    const students = enrollments.map((e) => ({
      enrollmentId: e.id,
      studentCode: e.student.code,
      fullName: naturalName(e.student),
      sectionLabel: sectionFullLabel(e.section),
      levelName: e.section.gradeLevel.level.name,
    }));
    const isPrimaryOf = enrollments
      .filter((e) => e.student.guardians[0]?.isPrimary)
      .map((e) => e.student.code);

    const institution = await this.prisma.institution.findUnique({
      where: { id: 1 },
      select: { phone: true },
    });
    const secretariaPhone =
      institution?.phone && institution.phone.trim().length > 0 ? institution.phone : null;

    return {
      guardian: { name: guardian.fullName },
      isPrimaryOf,
      students,
      secretariaPhone,
    };
  }

  // ===== GET /portal/students/:enrollmentId/summary =====

  async summary(actor: JwtUser, enrollmentId: string) {
    const guardian = await this.resolveGuardian(actor);
    const yearId = await this.activeYearId();
    const enrollment = await this.childEnrollment(guardian.id, enrollmentId);
    const placement = this.placementOf(enrollment.section);

    const debt = await this.installmentSummary(enrollmentId);

    const month = limaTodayISO().slice(0, 7);
    const att = await this.attendanceForMonth(enrollmentId, month);
    const attendanceMonth = { month, ...att.totals, pct: att.pct };

    const conductOpen = await this.prisma.conductIncident.count({
      where: { enrollmentId, status: { notIn: ['CERRADA', 'ANULADA'] } },
    });

    const today = isoToDate(todayISO());
    const events = await this.prisma.calendarEvent.findMany({
      where: { academicYearId: yearId, startDate: { gte: today } },
      orderBy: [{ startDate: 'asc' }, { name: 'asc' }],
      take: 3,
      select: { type: true, name: true, startDate: true },
    });
    const upcomingEvents = events.map((e) => ({
      date: dateToISO(e.startDate),
      name: e.name,
      type: e.type,
    }));

    const announcements = await this.prisma.announcement.findMany({
      where: this.announcementWhere(yearId, [placement]),
      orderBy: { sentAt: 'desc' },
      take: 3,
      select: { id: true, code: true, title: true, sentAt: true },
    });
    const lastAnnouncements = announcements.map((a) => ({
      id: a.id,
      code: a.code,
      title: a.title,
      sentAt: a.sentAt ? a.sentAt.toISOString() : null,
    }));

    return { debt, attendanceMonth, conductOpen, upcomingEvents, lastAnnouncements };
  }

  // Deuda + próxima cuota del cronograma de la matrícula (fecha efectiva).
  private async installmentSummary(enrollmentId: string) {
    const insts = await this.prisma.installment.findMany({
      where: { enrollmentId },
      select: { id: true, concept: true, dueDate: true, amount: true, lateFeeAmount: true, status: true },
    });
    const overrides = await commitmentOverrides(this.prisma, insts.map((i) => i.id));
    const today = todayISO();

    let overdueCount = 0;
    let overdueCents = 0;
    let nextDue: { label: string; dueDate: string; total: string } | null = null;
    let nextEff = '';

    for (const i of insts) {
      if (i.status !== 'PENDIENTE' && i.status !== 'VENCIDO') continue;
      const eff = dateToISO(effectiveDueDate(i.dueDate, overrides.get(i.id)));
      const totalCents = decimalToCents(i.amount) + decimalToCents(i.lateFeeAmount);
      if (eff < today) {
        overdueCount += 1;
        overdueCents += totalCents;
      } else if (nextDue === null || eff < nextEff) {
        nextDue = { label: i.concept, dueDate: eff, total: fromCents(totalCents) };
        nextEff = eff;
      }
    }

    return { overdueCount, overdueTotal: fromCents(overdueCents), nextDue };
  }

  // ===== GET /portal/students/:enrollmentId/installments =====

  async installments(actor: JwtUser, enrollmentId: string) {
    const guardian = await this.resolveGuardian(actor);
    await this.childEnrollment(guardian.id, enrollmentId);

    const rows = await this.prisma.installment.findMany({
      where: { enrollmentId },
      orderBy: [{ dueDate: 'asc' }, { sequence: 'asc' }],
      include: {
        receiptItems: {
          where: { receipt: { status: 'EMITIDO' } },
          take: 1,
          select: { receipt: { select: { code: true, createdAt: true } } },
        },
      },
    });
    const overrides = await commitmentOverrides(this.prisma, rows.map((r) => r.id));
    const today = todayISO();

    const installments = rows.map((r) => {
      const eff = dateToISO(effectiveDueDate(r.dueDate, overrides.get(r.id)));
      const amountCents = decimalToCents(r.amount);
      const feeCents = decimalToCents(r.lateFeeAmount);
      const status =
        r.status === 'PAGADO' || r.status === 'ANULADO' || r.status === 'EXONERADO'
          ? r.status
          : eff < today
            ? 'VENCIDO'
            : 'PENDIENTE';
      const receipt = r.status === 'PAGADO' ? r.receiptItems[0]?.receipt ?? null : null;
      return {
        id: r.id,
        label: r.concept,
        dueDate: eff,
        amount: money(r.amount),
        lateFee: money(r.lateFeeAmount),
        total: fromCents(amountCents + feeCents),
        status,
        paidAt: receipt ? receipt.createdAt.toISOString() : null,
        receiptCode: receipt?.code ?? null,
      };
    });

    return { installments };
  }

  // ===== GET /portal/students/:enrollmentId/attendance?month= =====

  async attendance(actor: JwtUser, enrollmentId: string, month: string) {
    const guardian = await this.resolveGuardian(actor);
    await this.childEnrollment(guardian.id, enrollmentId);
    const { days, totals, pct } = await this.attendanceForMonth(enrollmentId, month);
    return { month, days, totals, pct };
  }

  private async attendanceForMonth(enrollmentId: string, month: string) {
    const { start, endExclusive } = monthBounds(month);
    const entries = await this.prisma.studentAttendanceEntry.findMany({
      where: { enrollmentId, date: { gte: start, lt: endExclusive } },
      orderBy: { date: 'asc' },
      select: { date: true, status: true },
    });

    const totals = emptyLetterCounts();
    const days = entries.map((e) => {
      const letter = STUDENT_ATTENDANCE_STATUS_LETTERS[e.status as StudentAttendanceStatus] as
        | 'P'
        | 'T'
        | 'F'
        | 'J';
      totals[letter] += 1;
      return { date: dateToISO(e.date), status: letter };
    });
    const recorded = totals.P + totals.T + totals.F + totals.J;
    const pct = recorded > 0 ? Math.round(((totals.P + totals.T) / recorded) * 100) : null;
    return { days, totals, pct };
  }

  // ===== GET /portal/students/:enrollmentId/schedule =====

  async studentSchedule(actor: JwtUser, enrollmentId: string) {
    const guardian = await this.resolveGuardian(actor);
    const enrollment = await this.childEnrollment(guardian.id, enrollmentId);
    const data = await this.schedule.schedule(enrollment.section.id);
    return {
      blocks: data.blocks,
      slots: data.slots.map((s) => ({
        dayOfWeek: s.dayOfWeek,
        blockId: s.blockId,
        courseName: s.courseName,
        teacherName: s.teacherName,
      })),
    };
  }

  // ===== GET /portal/students/:enrollmentId/grades =====

  async studentGrades(actor: JwtUser, enrollmentId: string) {
    const guardian = await this.resolveGuardian(actor);
    await this.childEnrollment(guardian.id, enrollmentId);
    return this.grades.portalGrades(enrollmentId);
  }

  // ===== GET /portal/students/:enrollmentId/conduct =====

  async conduct(actor: JwtUser, enrollmentId: string) {
    const guardian = await this.resolveGuardian(actor);
    await this.childEnrollment(guardian.id, enrollmentId);

    const rows = await this.prisma.conductIncident.findMany({
      where: { enrollmentId, status: { not: 'ANULADA' } },
      orderBy: { occurredAt: 'desc' },
      select: {
        code: true,
        occurredAt: true,
        summary: true,
        severity: true,
        status: true,
        citationAt: true,
      },
    });

    return {
      incidents: rows.map((r) => ({
        code: r.code,
        occurredAt: r.occurredAt.toISOString(),
        summary: r.summary,
        severity: r.severity,
        status: r.status,
        citationAt: r.citationAt ? r.citationAt.toISOString() : null,
      })),
    };
  }

  // ===== GET /portal/announcements =====

  async announcements(actor: JwtUser) {
    const guardian = await this.resolveGuardian(actor);
    const yearId = await this.activeYearId();
    const placements = await this.childrenPlacements(guardian.id, yearId);

    const rows = await this.prisma.announcement.findMany({
      where: this.announcementWhere(yearId, placements),
      orderBy: { sentAt: 'desc' },
      select: {
        code: true,
        title: true,
        body: true,
        scope: true,
        sentAt: true,
        level: { select: { name: true } },
        gradeLevel: { select: { name: true, level: { select: { name: true } } } },
        section: {
          select: { name: true, shift: true, gradeLevel: { select: { name: true, level: { select: { name: true } } } } },
        },
      },
    });

    return {
      announcements: rows.map((r) => ({
        code: r.code,
        title: r.title,
        body: r.body,
        scopeLabel: this.scopeLabel(r),
        sentAt: r.sentAt ? r.sentAt.toISOString() : null,
      })),
    };
  }

  // ===== GET /portal/calendar?month= =====

  async calendar(actor: JwtUser, month: string) {
    await this.resolveGuardian(actor);
    const yearId = await this.activeYearId();
    const { start, endExclusive } = monthBounds(month);

    // Eventos del año activo que INTERSECTAN el mes (sin los vencimientos de pensión).
    const events = await this.prisma.calendarEvent.findMany({
      where: {
        academicYearId: yearId,
        startDate: { lt: endExclusive },
        endDate: { gte: start },
      },
      orderBy: [{ startDate: 'asc' }, { name: 'asc' }],
      select: { type: true, name: true, startDate: true, endDate: true },
    });

    return {
      events: events.map((e) => ({
        type: e.type,
        name: e.name,
        startDate: dateToISO(e.startDate),
        endDate: dateToISO(e.endDate),
      })),
    };
  }

  // ===== Helpers de comunicados =====

  private announcementWhere(yearId: string, placements: Placement[]): Prisma.AnnouncementWhereInput {
    const levelIds = [...new Set(placements.map((p) => p.levelId))];
    const gradeLevelIds = [...new Set(placements.map((p) => p.gradeLevelId))];
    const sectionIds = [...new Set(placements.map((p) => p.sectionId))];
    const guard = (ids: string[]) => (ids.length ? ids : ['__none__']);
    return {
      academicYearId: yearId,
      status: 'ENVIADO',
      OR: [
        { scope: 'COLEGIO' },
        { scope: 'NIVEL', levelId: { in: guard(levelIds) } },
        { scope: 'GRADO', gradeLevelId: { in: guard(gradeLevelIds) } },
        { scope: 'SECCION', sectionId: { in: guard(sectionIds) } },
      ],
    };
  }

  private scopeLabel(row: {
    scope: string;
    level: { name: string } | null;
    gradeLevel: { name: string; level: { name: string } } | null;
    section: (SectionLabelParts & { name: string }) | null;
  }): string {
    switch (row.scope) {
      case 'COLEGIO':
        return ANNOUNCEMENT_SCOPE_LABELS.COLEGIO;
      case 'NIVEL':
        return row.level?.name ?? ANNOUNCEMENT_SCOPE_LABELS.NIVEL;
      case 'GRADO':
        return row.gradeLevel
          ? gradeLabel(row.gradeLevel.name, row.gradeLevel.level.name)
          : ANNOUNCEMENT_SCOPE_LABELS.GRADO;
      case 'SECCION':
        return row.section ? sectionFullLabel(row.section) : ANNOUNCEMENT_SCOPE_LABELS.SECCION;
      default:
        return '';
    }
  }
}
