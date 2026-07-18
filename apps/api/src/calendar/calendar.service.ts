import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  type CalendarEventCreateInput,
  type CalendarEventUpdateInput,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { type JwtUser } from '../auth/decorators/current-user.decorator';
import {
  commitmentOverrides,
  dateToISO,
  effectiveDueDate,
  isoToDate,
} from '../common/installment-view.util';

const MONTH_NAMES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'setiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

const eventSelect = {
  id: true,
  type: true,
  name: true,
  startDate: true,
  endDate: true,
  description: true,
  academicYearId: true,
} satisfies Prisma.CalendarEventSelect;

type EventRow = Prisma.CalendarEventGetPayload<{ select: typeof eventSelect }>;

@Injectable()
export class CalendarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // Año activo (los eventos y las cuotas del calendario son del año en curso).
  private async activeYear() {
    const year = await this.prisma.academicYear.findFirst({
      where: { status: 'ACTIVO' },
      select: { id: true, name: true, status: true },
    });
    if (!year) throw new NotFoundException('No hay un año académico activo');
    return year;
  }

  private toEventItem(row: EventRow) {
    return {
      id: row.id,
      type: row.type,
      name: row.name,
      startDate: dateToISO(row.startDate),
      endDate: dateToISO(row.endDate),
      description: row.description,
    };
  }

  // ===== GET /calendar?month=yyyy-mm =====

  async month(query: { month: string }) {
    const year = await this.activeYear();
    const { start, endExclusive } = monthBounds(query.month);

    // Eventos del año activo que INTERSECTAN el mes: startDate < finMes && endDate >= inicioMes.
    const events = await this.prisma.calendarEvent.findMany({
      where: {
        academicYearId: year.id,
        startDate: { lt: endExclusive },
        endDate: { gte: start },
      },
      orderBy: [{ startDate: 'asc' }, { name: 'asc' }],
      select: eventSelect,
    });

    const pension = await this.pensionDueDates(year.id, query.month, start, endExclusive);

    return {
      month: query.month,
      events: events.map((e) => this.toEventItem(e)),
      pension,
    };
  }

  // Vencimientos de pensión derivados del cronograma: fechas de vencimiento efectivas DISTINTAS de
  // las cuotas de pensión del año activo dentro del mes, con conteo de cuotas PENDIENTE/VENCIDO.
  private async pensionDueDates(
    yearId: string,
    monthISO: string,
    start: Date,
    endExclusive: Date,
  ): Promise<{ date: string; label: string; count: number }[]> {
    const installments = await this.prisma.installment.findMany({
      where: {
        type: 'PENSION',
        status: { in: ['PENDIENTE', 'VENCIDO'] },
        enrollment: { academicYearId: yearId },
      },
      select: { id: true, dueDate: true },
    });
    if (installments.length === 0) return [];

    // Fecha efectiva (reprogramada por compromiso VIGENTE, si lo hay).
    const overrides = await commitmentOverrides(
      this.prisma,
      installments.map((i) => i.id),
    );

    const monthName = MONTH_NAMES[Number(monthISO.slice(5, 7)) - 1];
    const counts = new Map<string, number>();
    for (const inst of installments) {
      const eff = effectiveDueDate(inst.dueDate, overrides.get(inst.id));
      if (eff < start || eff >= endExclusive) continue;
      const iso = dateToISO(eff);
      counts.set(iso, (counts.get(iso) ?? 0) + 1);
    }

    return [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, label: `Vencen cuotas de ${monthName}`, count }));
  }

  // ===== POST /calendar =====

  async create(input: CalendarEventCreateInput, actor: JwtUser) {
    const year = await this.activeYear();
    const description =
      input.description && input.description.trim().length > 0 ? input.description.trim() : null;

    const created = await this.prisma.$transaction(async (tx) => {
      const row = await tx.calendarEvent.create({
        data: {
          academicYearId: year.id,
          type: input.type,
          name: input.name.trim(),
          startDate: isoToDate(input.startDate),
          endDate: isoToDate(input.endDate),
          description,
          createdById: actor.sub,
        },
        select: eventSelect,
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'calendar.create',
          entity: 'CalendarEvent',
          entityId: row.id,
          payload: { type: input.type, name: row.name, startDate: input.startDate, endDate: input.endDate },
        },
        tx,
      );
      return row;
    });

    return this.toEventItem(created);
  }

  // ===== PATCH /calendar/:id =====

  async update(id: string, input: CalendarEventUpdateInput, actor: JwtUser) {
    const existing = await this.loadEvent(id);
    await this.assertYearOpen(existing.academicYearId);
    const description =
      input.description && input.description.trim().length > 0 ? input.description.trim() : null;

    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.calendarEvent.update({
        where: { id },
        data: {
          type: input.type,
          name: input.name.trim(),
          startDate: isoToDate(input.startDate),
          endDate: isoToDate(input.endDate),
          description,
        },
        select: eventSelect,
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'calendar.update',
          entity: 'CalendarEvent',
          entityId: id,
          payload: { type: input.type, name: row.name, startDate: input.startDate, endDate: input.endDate },
        },
        tx,
      );
      return row;
    });

    return this.toEventItem(updated);
  }

  // ===== DELETE /calendar/:id =====

  async remove(id: string, actor: JwtUser) {
    const existing = await this.loadEvent(id);
    await this.assertYearOpen(existing.academicYearId);

    await this.prisma.$transaction(async (tx) => {
      await tx.calendarEvent.delete({ where: { id } });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'calendar.delete',
          entity: 'CalendarEvent',
          entityId: id,
          payload: { type: existing.type, name: existing.name },
        },
        tx,
      );
    });
  }

  // ===== Helpers =====

  private async loadEvent(id: string): Promise<EventRow> {
    const row = await this.prisma.calendarEvent.findUnique({ where: { id }, select: eventSelect });
    if (!row) throw new NotFoundException('Evento no encontrado');
    return row;
  }

  private async assertYearOpen(academicYearId: string) {
    const year = await this.prisma.academicYear.findUnique({
      where: { id: academicYearId },
      select: { status: true },
    });
    if (year?.status === 'CERRADO') {
      throw new ConflictException('El año académico está cerrado — solo lectura');
    }
  }
}

// Límites [inicio, finExclusivo) de un mes yyyy-mm como columnas @db.Date (UTC medianoche).
function monthBounds(monthISO: string): { start: Date; endExclusive: Date } {
  const year = Number(monthISO.slice(0, 4));
  const month = Number(monthISO.slice(5, 7));
  const start = isoToDate(`${monthISO}-01`);
  const endYear = month === 12 ? year + 1 : year;
  const endMonth = month === 12 ? 1 : month + 1;
  const endExclusive = isoToDate(`${endYear}-${String(endMonth).padStart(2, '0')}-01`);
  return { start, endExclusive };
}
