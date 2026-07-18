import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  ANNOUNCEMENT_SCOPE_LABELS,
  type AnnouncementCreateInput,
  type AnnouncementListQuery,
  type AnnouncementScope,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { type JwtUser } from '../auth/decorators/current-user.decorator';
import { nextCode } from '../common/code-counter.util';
import { limaTodayISO } from '../common/lima-time.util';
import { gradeLabel, sectionFullLabel } from '../student-attendance/section-label.util';

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

// Comunicado con lo necesario para el item de lista + label de alcance.
const announcementSelect = {
  id: true,
  code: true,
  academicYearId: true,
  title: true,
  body: true,
  scope: true,
  status: true,
  levelId: true,
  gradeLevelId: true,
  sectionId: true,
  recipientsCount: true,
  sentAt: true,
  createdAt: true,
  updatedAt: true,
  level: { select: { name: true } },
  gradeLevel: { select: { name: true, level: { select: { name: true } } } },
  section: {
    select: { name: true, shift: true, gradeLevel: { select: { name: true, level: { select: { name: true } } } } },
  },
  createdBy: { select: { fullName: true } },
} satisfies Prisma.AnnouncementSelect;

type AnnouncementRow = Prisma.AnnouncementGetPayload<{ select: typeof announcementSelect }>;

// Nombre natural del estudiante: "María Quispe Roca".
function studentName(s: {
  firstNames: string;
  paternalLastName: string;
  maternalLastName: string | null;
}): string {
  return [s.firstNames, s.paternalLastName, s.maternalLastName].filter(Boolean).join(' ');
}

@Injectable()
export class AnnouncementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private async activeYear() {
    const year = await this.prisma.academicYear.findFirst({
      where: { status: 'ACTIVO' },
      select: { id: true, name: true, status: true },
    });
    if (!year) throw new NotFoundException('No hay un año académico activo');
    return year;
  }

  // Etiqueta del alcance: "Todo el colegio" | "Primaria" | "3° · Primaria" | "3° A · Primaria".
  private scopeLabel(row: AnnouncementRow): string {
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
    }
  }

  private toListItem(row: AnnouncementRow) {
    return {
      id: row.id,
      code: row.code,
      title: row.title,
      scope: row.scope,
      scopeLabel: this.scopeLabel(row),
      status: row.status,
      recipientsCount: row.recipientsCount,
      sentAt: row.sentAt ? row.sentAt.toISOString() : null,
      createdAt: row.createdAt.toISOString(),
      createdByName: row.createdBy.fullName,
    };
  }

  private toDetail(row: AnnouncementRow) {
    return {
      ...this.toListItem(row),
      body: row.body,
      levelId: row.levelId,
      gradeLevelId: row.gradeLevelId,
      sectionId: row.sectionId,
    };
  }

  // ===== GET /announcements =====

  async list(query: AnnouncementListQuery) {
    const year = await this.activeYear();
    const where: Prisma.AnnouncementWhereInput = { academicYearId: year.id };
    if (query.status) where.status = query.status;
    if (query.search && query.search.length > 0) {
      const s = query.search;
      where.OR = [
        { title: { contains: s, mode: 'insensitive' } },
        { code: { contains: s, mode: 'insensitive' } },
      ];
    }

    const rows = await this.prisma.announcement.findMany({
      where,
      select: announcementSelect,
    });

    // Orden: BORRADOR primero por updatedAt desc, luego ENVIADO por sentAt desc.
    rows.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'BORRADOR' ? -1 : 1;
      if (a.status === 'BORRADOR') return b.updatedAt.getTime() - a.updatedAt.getTime();
      const at = a.sentAt?.getTime() ?? 0;
      const bt = b.sentAt?.getTime() ?? 0;
      return bt - at;
    });

    const stats = await this.computeStats(year.id);
    return { stats, announcements: rows.map((r) => this.toListItem(r)) };
  }

  private async computeStats(yearId: string) {
    const todayISO = limaTodayISO();
    const y = Number(todayISO.slice(0, 4));
    const m = Number(todayISO.slice(5, 7));
    const monthStart = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
    const monthEnd = new Date(Date.UTC(y, m, 1, 0, 0, 0));

    const base: Prisma.AnnouncementWhereInput = { academicYearId: yearId };
    const [sentMonth, drafts, lastSent] = await Promise.all([
      this.prisma.announcement.count({
        where: { ...base, status: 'ENVIADO', sentAt: { gte: monthStart, lt: monthEnd } },
      }),
      this.prisma.announcement.count({ where: { ...base, status: 'BORRADOR' } }),
      this.prisma.announcement.findFirst({
        where: { ...base, status: 'ENVIADO' },
        orderBy: { sentAt: 'desc' },
        select: { sentAt: true },
      }),
    ]);

    return {
      sentMonth,
      monthLabel: MONTH_NAMES[m - 1],
      drafts,
      lastSentAt: lastSent?.sentAt ? lastSent.sentAt.toISOString() : null,
    };
  }

  // ===== GET /announcements/options =====

  async options() {
    const year = await this.activeYear();
    const levels = await this.prisma.level.findMany({
      where: { academicYearId: year.id },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        grades: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            levelId: true,
            sections: {
              orderBy: { name: 'asc' },
              select: { id: true, name: true, shift: true },
            },
          },
        },
      },
    });

    const levelItems: { id: string; name: string }[] = [];
    const grades: { id: string; label: string; levelId: string }[] = [];
    const sections: { id: string; label: string; gradeLevelId: string }[] = [];
    for (const lvl of levels) {
      levelItems.push({ id: lvl.id, name: lvl.name });
      for (const g of lvl.grades) {
        grades.push({ id: g.id, label: gradeLabel(g.name, lvl.name), levelId: g.levelId });
        for (const s of g.sections) {
          sections.push({
            id: s.id,
            label: sectionFullLabel({ name: s.name, shift: s.shift, gradeLevel: { name: g.name, level: { name: lvl.name } } }),
            gradeLevelId: g.id,
          });
        }
      }
    }
    return { levels: levelItems, grades, sections };
  }

  // ===== POST /announcements =====

  async create(input: AnnouncementCreateInput, actor: JwtUser) {
    const year = await this.activeYear();
    const { levelId, gradeLevelId, sectionId } = await this.resolveScope(input, year.id);

    const created = await this.prisma.$transaction(async (tx) => {
      const code = await nextCode(tx, 'announcement', 'C-', 4);
      const row = await tx.announcement.create({
        data: {
          code,
          academicYearId: year.id,
          title: input.title.trim(),
          body: input.body.trim(),
          scope: input.scope,
          levelId,
          gradeLevelId,
          sectionId,
          status: 'BORRADOR',
          createdById: actor.sub,
        },
        select: announcementSelect,
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'announcements.create',
          entity: 'Announcement',
          entityId: row.id,
          payload: { code, scope: input.scope },
        },
        tx,
      );
      return row;
    });

    return this.toDetail(created);
  }

  // ===== GET /announcements/:id =====

  async detail(id: string) {
    return this.toDetail(await this.loadAnnouncement(id));
  }

  // ===== PATCH /announcements/:id (solo BORRADOR) =====

  async update(id: string, input: AnnouncementCreateInput, actor: JwtUser) {
    const existing = await this.loadAnnouncement(id);
    if (existing.status === 'ENVIADO') {
      throw new ConflictException('Un comunicado enviado no se edita');
    }
    const { levelId, gradeLevelId, sectionId } = await this.resolveScope(input, existing.academicYearId);

    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.announcement.update({
        where: { id },
        data: {
          title: input.title.trim(),
          body: input.body.trim(),
          scope: input.scope,
          levelId,
          gradeLevelId,
          sectionId,
        },
        select: announcementSelect,
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'announcements.update',
          entity: 'Announcement',
          entityId: id,
          payload: { scope: input.scope },
        },
        tx,
      );
      return row;
    });

    return this.toDetail(updated);
  }

  // ===== DELETE /announcements/:id (solo BORRADOR) =====

  async remove(id: string, actor: JwtUser) {
    const existing = await this.loadAnnouncement(id);
    if (existing.status === 'ENVIADO') {
      throw new ConflictException('Un comunicado enviado no se elimina');
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.announcement.delete({ where: { id } });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'announcements.delete',
          entity: 'Announcement',
          entityId: id,
          payload: { code: existing.code },
        },
        tx,
      );
    });
  }

  // ===== GET /announcements/:id/recipients =====

  async recipients(id: string) {
    const announcement = await this.loadAnnouncement(id);
    return { recipients: await this.resolveRecipients(announcement) };
  }

  // ===== POST /announcements/:id/send =====

  async send(id: string, actor: JwtUser) {
    const existing = await this.loadAnnouncement(id);
    if (existing.status === 'ENVIADO') {
      throw new ConflictException('El comunicado ya fue enviado');
    }
    const recipients = await this.resolveRecipients(existing);

    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.announcement.update({
        where: { id },
        data: {
          status: 'ENVIADO',
          sentAt: new Date(),
          sentById: actor.sub,
          recipientsCount: recipients.length,
        },
        select: announcementSelect,
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'announcements.send',
          entity: 'Announcement',
          entityId: id,
          payload: { code: existing.code, recipientsCount: recipients.length },
        },
        tx,
      );
      return row;
    });

    return this.toDetail(updated);
  }

  // ===== Helpers =====

  private async loadAnnouncement(id: string): Promise<AnnouncementRow> {
    const row = await this.prisma.announcement.findUnique({ where: { id }, select: announcementSelect });
    if (!row) throw new NotFoundException('Comunicado no encontrado');
    return row;
  }

  // Valida y normaliza el id del alcance según el tipo, contra el año dado. Devuelve los tres ids
  // (dos siempre null según el alcance).
  private async resolveScope(
    input: AnnouncementCreateInput,
    yearId: string,
  ): Promise<{ levelId: string | null; gradeLevelId: string | null; sectionId: string | null }> {
    const empty = { levelId: null, gradeLevelId: null, sectionId: null };

    if (input.scope === 'COLEGIO') return empty;

    if (input.scope === 'NIVEL') {
      const level = await this.prisma.level.findFirst({
        where: { id: input.levelId ?? '', academicYearId: yearId },
        select: { id: true },
      });
      if (!level) throw new BadRequestException('El nivel no pertenece al año académico activo');
      return { ...empty, levelId: level.id };
    }

    if (input.scope === 'GRADO') {
      const grade = await this.prisma.gradeLevel.findFirst({
        where: { id: input.gradeLevelId ?? '', level: { academicYearId: yearId } },
        select: { id: true },
      });
      if (!grade) throw new BadRequestException('El grado no pertenece al año académico activo');
      return { ...empty, gradeLevelId: grade.id };
    }

    // SECCION
    const section = await this.prisma.section.findFirst({
      where: { id: input.sectionId ?? '', gradeLevel: { level: { academicYearId: yearId } } },
      select: { id: true },
    });
    if (!section) throw new BadRequestException('La sección no pertenece al año académico activo');
    return { ...empty, sectionId: section.id };
  }

  // Familias destinatarias del alcance: matrículas vigentes del año activo (estudiante ACTIVO/BECADO)
  // dentro del scope, apoderado = contacto principal, DEDUPLICADO por apoderado. Orden alfabético.
  private async resolveRecipients(announcement: AnnouncementRow): Promise<
    { guardianId: string; guardianName: string; phone: string | null; students: string[] }[]
  > {
    const year = await this.activeYear();
    const scope = this.enrollmentScopeWhere(announcement.scope, {
      levelId: announcement.levelId,
      gradeLevelId: announcement.gradeLevelId,
      sectionId: announcement.sectionId,
    });

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        academicYearId: year.id,
        canceledAt: null,
        student: { status: { in: ['ACTIVO', 'BECADO'] } },
        ...scope,
      },
      select: {
        section: {
          select: { name: true, shift: true, gradeLevel: { select: { name: true, level: { select: { name: true } } } } },
        },
        student: {
          select: {
            firstNames: true,
            paternalLastName: true,
            maternalLastName: true,
            guardians: {
              where: { isPrimary: true, active: true },
              take: 1,
              select: { guardian: { select: { id: true, fullName: true, phone: true } } },
            },
          },
        },
      },
    });

    // Dedup por apoderado; acumula los nombres de sus hijos dentro del alcance.
    const byGuardian = new Map<
      string,
      { guardianId: string; guardianName: string; phone: string | null; students: string[] }
    >();
    for (const e of enrollments) {
      const link = e.student.guardians[0];
      if (!link) continue; // sin contacto principal: sin apoderado al cual mensajear
      const label = `${studentName(e.student)} (${sectionFullLabel(e.section)})`;
      const existing = byGuardian.get(link.guardian.id);
      if (existing) {
        existing.students.push(label);
      } else {
        byGuardian.set(link.guardian.id, {
          guardianId: link.guardian.id,
          guardianName: link.guardian.fullName,
          phone: link.guardian.phone ?? null,
          students: [label],
        });
      }
    }

    return [...byGuardian.values()].sort((a, b) => a.guardianName.localeCompare(b.guardianName));
  }

  private enrollmentScopeWhere(
    scope: AnnouncementScope,
    ids: { levelId: string | null; gradeLevelId: string | null; sectionId: string | null },
  ): Prisma.EnrollmentWhereInput {
    switch (scope) {
      case 'COLEGIO':
        return {};
      case 'NIVEL':
        return { section: { gradeLevel: { levelId: ids.levelId ?? '__none__' } } };
      case 'GRADO':
        return { section: { gradeLevelId: ids.gradeLevelId ?? '__none__' } };
      case 'SECCION':
        return { sectionId: ids.sectionId ?? '__none__' };
    }
  }
}
