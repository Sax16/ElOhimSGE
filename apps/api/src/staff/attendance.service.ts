import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  STAFF_ROLE_LABELS,
  type AttendanceCorrectInput,
  type AttendanceRulesUpdateInput,
  type AttendanceStatus,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { type JwtUser } from '../auth/decorators/current-user.decorator';
import { dateToISO, isoToDate } from '../common/installment-view.util';
import { limaNowHHmm, limaTodayISO } from '../common/lima-time.util';
import {
  computeLateness,
  effectiveSchedule,
  type MarkingGroupRow,
} from './effective-schedule.util';
import { buildAttendanceWorkbook, type AttendanceCell } from './attendance.xlsx';

// Empleado con lo mínimo para calcular horario efectivo y estado de asistencia.
const attStaffSelect = {
  id: true,
  code: true,
  fullName: true,
  role: true,
  area: true,
  status: true,
  useIndividualSchedule: true,
  individualEntryTime: true,
  individualToleranceMin: true,
} satisfies Prisma.StaffSelect;

type AttStaff = Prisma.StaffGetPayload<{ select: typeof attStaffSelect }>;

const entrySelect = {
  id: true,
  checkInAt: true,
  checkOutAt: true,
  late: true,
  lateMinutes: true,
  expectedEntryTime: true,
  toleranceMin: true,
  correctedById: true,
} satisfies Prisma.StaffTimeEntrySelect;

type EntryRow = Prisma.StaffTimeEntryGetPayload<{ select: typeof entrySelect }>;

// Día hábil = lunes a viernes. Las columnas @db.Date guardan UTC medianoche → getUTCDay es estable.
function isBusinessDayISO(iso: string): boolean {
  const day = isoToDate(iso).getUTCDay(); // 0 dom … 6 sáb
  return day >= 1 && day <= 5;
}

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private markingGroups(): Promise<MarkingGroupRow[]> {
    return this.prisma.markingGroup.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { name: true, entryTime: true, toleranceMin: true, roles: true },
    });
  }

  // Estado derivado (no materializado) de un empleado en un día dado su marca (si la hay).
  private deriveStatus(
    staff: AttStaff,
    entry: EntryRow | undefined,
    dateISO: string,
    todayISO: string,
  ): AttendanceStatus {
    if (entry?.checkInAt) return entry.late ? 'TARDANZA' : 'PUNTUAL';
    if (staff.status === 'LICENCIA') return 'LICENCIA';
    if (dateISO < todayISO && isBusinessDayISO(dateISO)) return 'FALTA';
    return 'SIN_MARCAR';
  }

  private buildRow(
    staff: AttStaff,
    entry: EntryRow | undefined,
    dateISO: string,
    todayISO: string,
    groups: MarkingGroupRow[],
  ) {
    const eff = effectiveSchedule(staff, groups);
    const marked = Boolean(entry?.checkInAt);
    return {
      staffId: staff.id,
      code: staff.code,
      fullName: staff.fullName,
      role: staff.role,
      area: staff.area,
      groupName: eff.groupName,
      // Marcado → snapshot congelado en la marca; sin marca → horario efectivo actual.
      expectedEntryTime: marked ? entry!.expectedEntryTime : eff.entryTime,
      toleranceMin: marked ? entry!.toleranceMin : eff.toleranceMin,
      entryId: entry?.id ?? null,
      checkIn: entry?.checkInAt ?? null,
      checkOut: entry?.checkOutAt ?? null,
      lateMinutes: marked ? entry!.lateMinutes : 0,
      corrected: Boolean(entry?.correctedById),
      status: this.deriveStatus(staff, entry, dateISO, todayISO),
    };
  }

  // ===== GET /api/attendance/day =====
  async day(dateISO?: string) {
    const todayISO = limaTodayISO();
    const date = dateISO ?? todayISO;
    const dateObj = isoToDate(date);

    const [staffList, entries, groups] = await Promise.all([
      this.prisma.staff.findMany({
        where: { status: { not: 'INACTIVO' } },
        orderBy: { fullName: 'asc' },
        select: attStaffSelect,
      }),
      this.prisma.staffTimeEntry.findMany({ where: { date: dateObj }, select: { ...entrySelect, staffId: true } }),
      this.markingGroups(),
    ]);

    const byStaff = new Map(entries.map((e) => [e.staffId, e]));
    const rows = staffList.map((s) => this.buildRow(s, byStaff.get(s.id), date, todayISO, groups));

    const stats = {
      total: rows.length,
      presentes: rows.filter((r) => r.status === 'PUNTUAL').length,
      tardanzas: rows.filter((r) => r.status === 'TARDANZA').length,
      sinMarcarOFaltas: rows.filter((r) => r.status === 'SIN_MARCAR' || r.status === 'FALTA').length,
      licencias: rows.filter((r) => r.status === 'LICENCIA').length,
    };

    return { date, isBusinessDay: isBusinessDayISO(date), rows, stats };
  }

  // ===== POST /api/attendance/check-in =====
  async checkIn(staffId: string, actor: JwtUser) {
    const staff = await this.prisma.staff.findUnique({ where: { id: staffId }, select: attStaffSelect });
    if (!staff) throw new NotFoundException('Empleado no encontrado');
    if (staff.status === 'INACTIVO')
      throw new ConflictException('El empleado está inactivo; no puede marcar asistencia');
    if (staff.status === 'LICENCIA')
      throw new ConflictException('El empleado está de licencia; no puede marcar asistencia');

    const todayISO = limaTodayISO();
    const dateObj = isoToDate(todayISO);
    const existing = await this.prisma.staffTimeEntry.findUnique({
      where: { staffId_date: { staffId, date: dateObj } },
      select: { ...entrySelect },
    });
    if (existing?.checkInAt)
      throw new ConflictException('El empleado ya registró su ingreso hoy');

    const groups = await this.markingGroups();
    const eff = effectiveSchedule(staff, groups);
    const checkIn = limaNowHHmm();
    // Si ya había fila (corregida a sin ingreso), respeta su snapshot; si no, congela el actual.
    const expected = existing?.expectedEntryTime ?? eff.entryTime;
    const tolerance = existing?.toleranceMin ?? eff.toleranceMin;
    const { late, lateMinutes } = computeLateness(checkIn, expected, tolerance);

    await this.prisma.staffTimeEntry.upsert({
      where: { staffId_date: { staffId, date: dateObj } },
      create: {
        staffId,
        date: dateObj,
        checkInAt: checkIn,
        late,
        lateMinutes,
        expectedEntryTime: expected,
        toleranceMin: tolerance,
        markedInById: actor.sub,
      },
      update: { checkInAt: checkIn, late, lateMinutes, markedInById: actor.sub },
    });

    return this.singleRow(staff, todayISO, groups);
  }

  // ===== POST /api/attendance/check-out =====
  async checkOut(staffId: string, actor: JwtUser) {
    const staff = await this.prisma.staff.findUnique({ where: { id: staffId }, select: attStaffSelect });
    if (!staff) throw new NotFoundException('Empleado no encontrado');

    const todayISO = limaTodayISO();
    const dateObj = isoToDate(todayISO);
    const existing = await this.prisma.staffTimeEntry.findUnique({
      where: { staffId_date: { staffId, date: dateObj } },
      select: { id: true, checkInAt: true, checkOutAt: true },
    });
    if (!existing?.checkInAt)
      throw new ConflictException('El empleado no tiene ingreso registrado hoy');
    if (existing.checkOutAt)
      throw new ConflictException('El empleado ya registró su salida hoy');

    await this.prisma.staffTimeEntry.update({
      where: { id: existing.id },
      data: { checkOutAt: limaNowHHmm(), markedOutById: actor.sub },
    });

    return this.singleRow(staff, todayISO, await this.markingGroups());
  }

  // ===== PATCH /api/attendance/correct (solo ADMIN) =====
  async correct(input: AttendanceCorrectInput, actor: JwtUser) {
    if (actor.role !== 'ADMIN')
      throw new ForbiddenException('Solo un administrador puede corregir marcas');

    const staff = await this.prisma.staff.findUnique({
      where: { id: input.staffId },
      select: attStaffSelect,
    });
    if (!staff) throw new NotFoundException('Empleado no encontrado');

    const dateObj = isoToDate(input.date);
    const existing = await this.prisma.staffTimeEntry.findUnique({
      where: { staffId_date: { staffId: input.staffId, date: dateObj } },
      select: { ...entrySelect },
    });

    const newIn = input.checkIn !== undefined ? input.checkIn : (existing?.checkInAt ?? null);
    let newOut = input.checkOut !== undefined ? input.checkOut : (existing?.checkOutAt ?? null);
    // Quitar EXPLÍCITAMENTE el ingreso (checkIn: null) quita también la salida.
    if (input.checkIn === null) newOut = null;
    // Cualquier otro caso con salida y sin ingreso es inválido.
    if (newOut !== null && newIn === null)
      throw new BadRequestException('No puede registrarse una salida sin ingreso');

    const groups = await this.markingGroups();
    const eff = effectiveSchedule(staff, groups);
    // Corrige contra el snapshot existente; si no había fila, congela el horario efectivo actual.
    const expected = existing?.expectedEntryTime ?? eff.entryTime;
    const tolerance = existing?.toleranceMin ?? eff.toleranceMin;
    const { late, lateMinutes } = newIn
      ? computeLateness(newIn, expected, tolerance)
      : { late: false, lateMinutes: 0 };

    await this.prisma.$transaction(async (tx) => {
      await tx.staffTimeEntry.upsert({
        where: { staffId_date: { staffId: input.staffId, date: dateObj } },
        create: {
          staffId: input.staffId,
          date: dateObj,
          checkInAt: newIn,
          checkOutAt: newOut,
          late,
          lateMinutes,
          expectedEntryTime: expected,
          toleranceMin: tolerance,
          correctedById: actor.sub,
          correctedAt: new Date(),
          correctionReason: input.reason,
        },
        update: {
          checkInAt: newIn,
          checkOutAt: newOut,
          late,
          lateMinutes,
          correctedById: actor.sub,
          correctedAt: new Date(),
          correctionReason: input.reason,
        },
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'attendance.correct',
          entity: 'StaffTimeEntry',
          entityId: `${input.staffId}:${input.date}`,
          payload: { staffId: input.staffId, date: input.date, checkIn: newIn, checkOut: newOut, reason: input.reason },
        },
        tx,
      );
    });

    return this.singleRow(staff, input.date, groups);
  }

  // Fila de un solo empleado tras marcar/corregir (relee la marca del día).
  private async singleRow(staff: AttStaff, dateISO: string, groups: MarkingGroupRow[]) {
    const entry = await this.prisma.staffTimeEntry.findUnique({
      where: { staffId_date: { staffId: staff.id, date: isoToDate(dateISO) } },
      select: entrySelect,
    });
    return this.buildRow(staff, entry ?? undefined, dateISO, limaTodayISO(), groups);
  }

  // ===== GET /api/attendance/rules =====
  async rules() {
    const [groups, settings] = await Promise.all([
      this.prisma.markingGroup.findMany({
        orderBy: { sortOrder: 'asc' },
        select: { id: true, name: true, entryTime: true, toleranceMin: true, roles: true, sortOrder: true },
      }),
      this.getSettings(),
    ]);
    return {
      groups,
      settings: {
        autoDiscountEnabled: settings.autoDiscountEnabled,
        lateCountThreshold: settings.lateCountThreshold,
        discountAmount: settings.discountAmount.toFixed(2),
        countPeriod: settings.countPeriod,
      },
    };
  }

  // Fila única (id = 1) de MarkingSettings; la crea con defaults si aún no existe (defensivo).
  private async getSettings() {
    return this.prisma.markingSettings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
  }

  // ===== PUT /api/attendance/rules (permiso personal · editar) =====
  async updateRules(input: AttendanceRulesUpdateInput, actor: JwtUser) {
    // Verifica que todos los grupos existan antes de tocar nada.
    const ids = input.groups.map((g) => g.id);
    const found = await this.prisma.markingGroup.count({ where: { id: { in: ids } } });
    if (found !== ids.length)
      throw new NotFoundException('Uno o más grupos de marcación no existen');

    await this.prisma.$transaction(async (tx) => {
      for (const g of input.groups) {
        await tx.markingGroup.update({
          where: { id: g.id },
          data: { entryTime: g.entryTime, toleranceMin: g.toleranceMin },
        });
      }
      await tx.markingSettings.upsert({
        where: { id: 1 },
        update: {
          autoDiscountEnabled: input.settings.autoDiscountEnabled,
          lateCountThreshold: input.settings.lateCountThreshold,
          discountAmount: new Prisma.Decimal(String(input.settings.discountAmount)),
          countPeriod: input.settings.countPeriod,
        },
        create: {
          id: 1,
          autoDiscountEnabled: input.settings.autoDiscountEnabled,
          lateCountThreshold: input.settings.lateCountThreshold,
          discountAmount: new Prisma.Decimal(String(input.settings.discountAmount)),
          countPeriod: input.settings.countPeriod,
        },
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'attendance.rules.update',
          entity: 'MarkingSettings',
          entityId: '1',
          payload: {
            groups: input.groups,
            settings: { ...input.settings, discountAmount: String(input.settings.discountAmount) },
          },
        },
        tx,
      );
    });

    return this.rules();
  }

  // ===== GET /api/attendance/export?month=yyyy-mm =====
  async exportMonth(month: string): Promise<{ buffer: Buffer; filename: string }> {
    const [yearStr, monthStr] = month.split('-');
    const year = Number(yearStr);
    const monthNum = Number(monthStr);
    const start = isoToDate(`${yearStr}-${monthStr}-01`);
    const endYear = monthNum === 12 ? year + 1 : year;
    const endMonth = monthNum === 12 ? 1 : monthNum + 1;
    const end = isoToDate(`${endYear}-${String(endMonth).padStart(2, '0')}-01`);

    // Días hábiles (L–V) del mes.
    const lastDay = new Date(Date.UTC(year, monthNum, 0)).getUTCDate();
    const businessDays: string[] = [];
    for (let d = 1; d <= lastDay; d++) {
      const iso = `${yearStr}-${monthStr}-${String(d).padStart(2, '0')}`;
      if (isBusinessDayISO(iso)) businessDays.push(iso);
    }

    const todayISO = limaTodayISO();
    const [staffList, entries] = await Promise.all([
      this.prisma.staff.findMany({
        where: { status: { not: 'INACTIVO' } },
        orderBy: { fullName: 'asc' },
        select: attStaffSelect,
      }),
      this.prisma.staffTimeEntry.findMany({
        where: { date: { gte: start, lt: end } },
        select: { staffId: true, date: true, checkInAt: true, late: true, lateMinutes: true },
      }),
    ]);

    // staffId → dateISO → { checkedIn, late, lateMinutes }.
    const byStaff = new Map<string, Map<string, { checkedIn: boolean; late: boolean; lateMinutes: number }>>();
    for (const e of entries) {
      const dISO = dateToISO(e.date);
      if (!byStaff.has(e.staffId)) byStaff.set(e.staffId, new Map());
      byStaff.get(e.staffId)!.set(dISO, {
        checkedIn: Boolean(e.checkInAt),
        late: e.late,
        lateMinutes: e.lateMinutes,
      });
    }

    const rows = staffList.map((s) => {
      const marks = byStaff.get(s.id);
      let puntuales = 0;
      let tardanzas = 0;
      let faltas = 0;
      let licencias = 0;
      let lateMinutes = 0;
      const cells: AttendanceCell[] = businessDays.map((iso) => {
        const m = marks?.get(iso);
        if (m?.checkedIn) {
          if (m.late) {
            tardanzas++;
            lateMinutes += m.lateMinutes;
            return 'T';
          }
          puntuales++;
          return 'P';
        }
        if (s.status === 'LICENCIA') {
          licencias++;
          return 'L';
        }
        if (iso < todayISO) {
          faltas++;
          return 'F';
        }
        return '–'; // hoy o futuro sin marca
      });
      return {
        code: s.code,
        fullName: s.fullName,
        role: STAFF_ROLE_LABELS[s.role],
        cells,
        puntuales,
        tardanzas,
        lateMinutes,
        faltas,
        licencias,
      };
    });

    const buffer = await buildAttendanceWorkbook(month, businessDays, rows);
    return { buffer, filename: `asistencia-${month}.xlsx` };
  }
}
