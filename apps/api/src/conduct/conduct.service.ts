import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  type ConductCancelInput,
  type ConductCreateInput,
  type ConductListQuery,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { type JwtUser } from '../auth/decorators/current-user.decorator';
import { nextCode } from '../common/code-counter.util';
import { limaTodayISO } from '../common/lima-time.util';
import { resolveTeachingStaffId } from '../common/teaching-staff.util';
import { sectionFullLabel } from '../student-attendance/section-label.util';

// Nombres de mes en español para el label de estadística mensual.
const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

// Incidencia con lo necesario para el shape de item de lista (+ estudiante, sección, apoderado).
const incidentSelect = {
  id: true,
  code: true,
  occurredAt: true,
  summary: true,
  description: true,
  measure: true,
  severity: true,
  status: true,
  citationAt: true,
  notifiedAt: true,
  closedAt: true,
  canceledAt: true,
  cancelReason: true,
  registeredById: true,
  enrollment: {
    select: {
      id: true,
      academicYearId: true,
      section: {
        select: {
          id: true,
          name: true,
          shift: true,
          gradeLevel: {
            select: {
              name: true,
              level: { select: { name: true, academicYear: { select: { status: true } } } },
            },
          },
        },
      },
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
    },
  },
  registeredBy: { select: { fullName: true } },
} satisfies Prisma.ConductIncidentSelect;

type IncidentRow = Prisma.ConductIncidentGetPayload<{ select: typeof incidentSelect }>;

// "Quispe Roca, María" — apellidos, nombres.
function fullName(s: { paternalLastName: string; maternalLastName: string | null; firstNames: string }): string {
  const last = [s.paternalLastName, s.maternalLastName].filter(Boolean).join(' ');
  return `${last}, ${s.firstNames}`;
}

@Injectable()
export class ConductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ===== Utilidades comunes =====

  private isAdmin(actor: JwtUser): boolean {
    return actor.role === 'ADMIN';
  }

  private async activeYear() {
    const year = await this.prisma.academicYear.findFirst({
      where: { status: 'ACTIVO' },
      select: { id: true, name: true },
    });
    if (!year) throw new NotFoundException('No hay un año académico activo');
    return year;
  }

  // IDs de las secciones que el actor (docente) puede ver: tutor via Section.tutorId o docente via
  // CourseAssignment. Ambos apuntan al Staff vinculado al usuario. Sin ficha docente → sin secciones.
  private async mySectionIds(actor: JwtUser, yearId: string): Promise<string[]> {
    const staffId = await resolveTeachingStaffId(this.prisma, actor.sub);
    if (!staffId) return [];
    const [tutorSections, assignments] = await Promise.all([
      this.prisma.section.findMany({
        where: { tutorId: staffId, gradeLevel: { level: { academicYearId: yearId } } },
        select: { id: true },
      }),
      this.prisma.courseAssignment.findMany({
        where: {
          teacherId: staffId,
          section: { gradeLevel: { level: { academicYearId: yearId } } },
        },
        select: { sectionId: true },
      }),
    ]);
    const ids = new Set<string>();
    for (const s of tutorSections) ids.add(s.id);
    for (const a of assignments) ids.add(a.sectionId);
    return [...ids];
  }

  // Filtro de scope por rol: ADMIN sin restricción; docente restringido a sus secciones (dentro del
  // año activo). Devuelve el fragmento WHERE sobre enrollment.
  private async scopeWhere(actor: JwtUser, yearId: string): Promise<Prisma.EnrollmentWhereInput> {
    if (this.isAdmin(actor)) return { academicYearId: yearId };
    const sectionIds = await this.mySectionIds(actor, yearId);
    // Sin secciones → filtro imposible (nunca coincide).
    return { academicYearId: yearId, sectionId: { in: sectionIds.length ? sectionIds : ['__none__'] } };
  }

  // Item de lista para la respuesta del API.
  private toListItem(row: IncidentRow) {
    const link = row.enrollment.student.guardians[0];
    return {
      id: row.id,
      code: row.code,
      occurredAt: row.occurredAt.toISOString(),
      summary: row.summary,
      severity: row.severity,
      status: row.status,
      citationAt: row.citationAt ? row.citationAt.toISOString() : null,
      notifiedAt: row.notifiedAt ? row.notifiedAt.toISOString() : null,
      student: {
        code: row.enrollment.student.code,
        fullName: fullName(row.enrollment.student),
        sectionLabel: sectionFullLabel(row.enrollment.section),
      },
      registeredByName: row.registeredBy.fullName,
      guardianName: link?.guardian.fullName ?? null,
      guardianPhone: link?.guardian.phone ?? null,
    };
  }

  // Detalle: item de lista + campos extra.
  private toDetail(row: IncidentRow) {
    return {
      ...this.toListItem(row),
      description: row.description,
      measure: row.measure,
      closedAt: row.closedAt ? row.closedAt.toISOString() : null,
      canceledAt: row.canceledAt ? row.canceledAt.toISOString() : null,
      cancelReason: row.cancelReason,
      registeredById: row.registeredById,
    };
  }

  // ===== GET /conduct =====

  async list(actor: JwtUser, query: ConductListQuery) {
    const year = await this.activeYear();
    const scope = await this.scopeWhere(actor, year.id);

    const where: Prisma.ConductIncidentWhereInput = { enrollment: scope };
    if (query.severity) where.severity = query.severity;
    if (query.status) where.status = query.status;
    if (query.search && query.search.length > 0) {
      const s = query.search;
      where.OR = [
        { summary: { contains: s, mode: 'insensitive' } },
        { enrollment: { student: { firstNames: { contains: s, mode: 'insensitive' } } } },
        { enrollment: { student: { paternalLastName: { contains: s, mode: 'insensitive' } } } },
        { enrollment: { student: { maternalLastName: { contains: s, mode: 'insensitive' } } } },
        { enrollment: { student: { code: { contains: s, mode: 'insensitive' } } } },
      ];
    }

    const incidents = await this.prisma.conductIncident.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
      select: incidentSelect,
    });

    const stats = await this.computeStats(actor, year.id, scope);
    return { stats, incidents: incidents.map((i) => this.toListItem(i)) };
  }

  // Estadísticas sobre el MISMO scope del usuario. Basadas en hora de Lima.
  private async computeStats(actor: JwtUser, yearId: string, scope: Prisma.EnrollmentWhereInput) {
    const todayISO = limaTodayISO();
    const parts = todayISO.split('-');
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);

    // Inicio y fin (exclusivo) del mes actual, en UTC (occurredAt es DateTime absoluto).
    const monthStart = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
    const monthEnd = new Date(Date.UTC(y, m, 1, 0, 0, 0));

    // Semana actual L–D (lunes 00:00 a domingo 23:59 → lunes siguiente exclusivo), en Lima.
    const todayUtc = new Date(Date.UTC(y, m - 1, d));
    const dow = todayUtc.getUTCDay(); // 0 dom … 6 sáb
    const daysFromMonday = dow === 0 ? 6 : dow - 1;
    const weekStart = new Date(todayUtc.getTime() - daysFromMonday * 86_400_000);
    const weekEnd = new Date(weekStart.getTime() + 7 * 86_400_000);

    const base: Prisma.ConductIncidentWhereInput = { enrollment: scope };
    const notCanceled = { status: { not: 'ANULADA' as const } };

    const [month, graves, open, citationsThisWeek] = await Promise.all([
      this.prisma.conductIncident.count({
        where: { ...base, ...notCanceled, occurredAt: { gte: monthStart, lt: monthEnd } },
      }),
      this.prisma.conductIncident.count({
        where: { ...base, ...notCanceled, severity: 'GRAVE' },
      }),
      this.prisma.conductIncident.count({
        where: { ...base, status: { notIn: ['CERRADA', 'ANULADA'] } },
      }),
      this.prisma.conductIncident.count({
        where: {
          ...base,
          status: 'CITACION_PROGRAMADA',
          citationAt: { gte: weekStart, lt: weekEnd },
        },
      }),
    ]);

    return { month, monthLabel: MONTH_NAMES[m - 1], graves, open, citationsThisWeek };
  }

  // ===== GET /conduct/students =====

  async students(actor: JwtUser, search: string) {
    const year = await this.activeYear();
    const scope = await this.scopeWhere(actor, year.id);
    const s = search;

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        ...scope,
        canceledAt: null,
        student: {
          status: { in: ['ACTIVO', 'BECADO'] },
          OR: [
            { firstNames: { contains: s, mode: 'insensitive' } },
            { paternalLastName: { contains: s, mode: 'insensitive' } },
            { maternalLastName: { contains: s, mode: 'insensitive' } },
            { code: { contains: s, mode: 'insensitive' } },
          ],
        },
      },
      orderBy: [
        { student: { paternalLastName: 'asc' } },
        { student: { maternalLastName: 'asc' } },
        { student: { firstNames: 'asc' } },
      ],
      take: 20,
      select: {
        id: true,
        student: { select: { code: true, firstNames: true, paternalLastName: true, maternalLastName: true } },
        section: {
          select: {
            name: true,
            shift: true,
            gradeLevel: { select: { name: true, level: { select: { name: true } } } },
          },
        },
      },
    });

    return {
      students: enrollments.map((e) => ({
        enrollmentId: e.id,
        studentCode: e.student.code,
        fullName: fullName(e.student),
        sectionLabel: sectionFullLabel(e.section),
      })),
    };
  }

  // ===== POST /conduct =====

  async create(input: ConductCreateInput, actor: JwtUser) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: input.enrollmentId },
      select: {
        id: true,
        canceledAt: true,
        sectionId: true,
        academicYear: { select: { status: true } },
      },
    });
    if (!enrollment || enrollment.canceledAt) {
      throw new NotFoundException('Matrícula no encontrada');
    }
    if (enrollment.academicYear.status === 'CERRADO') {
      throw new ConflictException('El año académico está cerrado — solo lectura');
    }

    await this.assertSectionAccess(actor, enrollment.sectionId);

    const measure = input.measure && input.measure.trim().length > 0 ? input.measure.trim() : null;

    const created = await this.prisma.$transaction(async (tx) => {
      const code = await nextCode(tx, 'conduct', 'I-', 4);
      const row = await tx.conductIncident.create({
        data: {
          code,
          enrollmentId: enrollment.id,
          occurredAt: new Date(input.occurredAt),
          summary: input.summary.trim(),
          description: input.description.trim(),
          measure,
          severity: input.severity,
          status: 'REGISTRADA',
          citationAt: input.citationAt ? new Date(input.citationAt) : null,
          registeredById: actor.sub,
        },
        select: incidentSelect,
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'conduct.create',
          entity: 'ConductIncident',
          entityId: row.id,
          payload: { code, severity: input.severity, enrollmentId: enrollment.id },
        },
        tx,
      );
      return row;
    });

    return this.toListItem(created);
  }

  // ===== GET /conduct/:id =====

  async detail(actor: JwtUser, id: string) {
    const row = await this.loadIncident(id);
    await this.assertSectionAccess(actor, row.enrollment.section.id);
    return this.toDetail(row);
  }

  // ===== POST /conduct/:id/notified =====

  async notified(actor: JwtUser, id: string) {
    const row = await this.loadIncident(id);
    await this.assertSectionAccess(actor, row.enrollment.section.id);
    this.assertYearOpen(row);

    if (row.severity === 'LEVE') {
      throw new UnprocessableEntityException('Las incidencias leves no notifican al apoderado');
    }
    if (row.status === 'CERRADA' || row.status === 'ANULADA') {
      throw new ConflictException('La incidencia ya está cerrada o anulada');
    }

    // Estado inicial → avanza; ya notificada → solo refresca notifiedAt (reenvío).
    let nextStatus = row.status;
    if (row.status === 'REGISTRADA') {
      nextStatus = row.severity === 'GRAVE' ? 'CITACION_PROGRAMADA' : 'APODERADO_NOTIFICADO';
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const upd = await tx.conductIncident.update({
        where: { id },
        data: { notifiedAt: new Date(), status: nextStatus },
        select: incidentSelect,
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'conduct.notified',
          entity: 'ConductIncident',
          entityId: id,
          payload: { status: nextStatus },
        },
        tx,
      );
      return upd;
    });

    return this.toListItem(updated);
  }

  // ===== POST /conduct/:id/close =====

  async close(actor: JwtUser, id: string) {
    const row = await this.loadIncident(id);
    await this.assertSectionAccess(actor, row.enrollment.section.id);
    this.assertYearOpen(row);

    if (row.status === 'ANULADA') throw new ConflictException('La incidencia está anulada');
    if (row.status === 'CERRADA') throw new ConflictException('La incidencia ya está cerrada');

    const updated = await this.prisma.$transaction(async (tx) => {
      const upd = await tx.conductIncident.update({
        where: { id },
        data: { status: 'CERRADA', closedAt: new Date(), closedById: actor.sub },
        select: incidentSelect,
      });
      await this.audit.log(
        { userId: actor.sub, action: 'conduct.close', entity: 'ConductIncident', entityId: id },
        tx,
      );
      return upd;
    });

    return this.toListItem(updated);
  }

  // ===== POST /conduct/:id/cancel (solo ADMIN) =====

  async cancel(actor: JwtUser, id: string, input: ConductCancelInput) {
    if (!this.isAdmin(actor)) {
      throw new ForbiddenException('Solo un administrador puede anular una incidencia');
    }
    const row = await this.loadIncident(id);
    if (row.status === 'ANULADA') throw new ConflictException('La incidencia ya está anulada');

    const updated = await this.prisma.$transaction(async (tx) => {
      const upd = await tx.conductIncident.update({
        where: { id },
        data: {
          status: 'ANULADA',
          canceledAt: new Date(),
          canceledById: actor.sub,
          cancelReason: input.reason.trim(),
        },
        select: incidentSelect,
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'conduct.cancel',
          entity: 'ConductIncident',
          entityId: id,
          payload: { reason: input.reason.trim() },
        },
        tx,
      );
      return upd;
    });

    return this.toListItem(updated);
  }

  // ===== Helpers compartidos =====

  private async loadIncident(id: string): Promise<IncidentRow> {
    const row = await this.prisma.conductIncident.findUnique({ where: { id }, select: incidentSelect });
    if (!row) throw new NotFoundException('Incidencia no encontrada');
    return row;
  }

  // El actor debe tener acceso a la sección (ADMIN todas; docente sus secciones del año activo).
  private async assertSectionAccess(actor: JwtUser, sectionId: string) {
    if (this.isAdmin(actor)) return;
    const year = await this.activeYear();
    const sectionIds = await this.mySectionIds(actor, year.id);
    if (!sectionIds.includes(sectionId)) {
      throw new ForbiddenException('No tienes acceso a esta sección');
    }
  }

  private assertYearOpen(row: IncidentRow) {
    if (row.enrollment.section.gradeLevel.level.academicYear.status === 'CERRADO') {
      throw new ConflictException('El año académico está cerrado — solo lectura');
    }
  }
}
