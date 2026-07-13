import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  buildEnrollmentSchedule,
  fromCents,
  type EnrollmentListQuery,
  type EnrollmentWizardInput,
  type ScheduleItem,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { nextCode } from '../common/code-counter.util';
import { centsToDecimal, decimalToCents } from '../common/money.util';
import { programInstallmentConcept, programScheduleItems } from './program-schedule.util';

type DbClient = Prisma.TransactionClient | PrismaService;

// Fecha calendario de hoy (yyyy-mm-dd) usando componentes locales — sin corrimiento por TZ.
function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Date coerced (UTC medianoche) → yyyy-mm-dd.
function dateToISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// yyyy-mm-dd → Date UTC medianoche (columnas @db.Date).
function isoToDate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

// Cronograma resuelto de un programa elegido en el wizard (cuotas separadas de la pensión).
interface ResolvedProgramSchedule {
  programId: string;
  name: string;
  monthlyFee: Prisma.Decimal;
  enrollmentFee: Prisma.Decimal;
  items: ScheduleItem[];
}

// Resultado de resolver el cronograma (compartido por preview y create).
interface ResolvedSchedule {
  yearName: string;
  section: { id: string; shift: 'MANANA' | 'TARDE'; capacity: number };
  items: ScheduleItem[]; // solo pensiones escolares + matrícula (los programas van aparte)
  discount: { id: string; name: string; percent: number; auto: boolean } | null;
  programSchedules: ResolvedProgramSchedule[];
  warnings: string[];
}

@Injectable()
export class EnrollmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private async activeYearId(): Promise<string> {
    const year = await this.prisma.academicYear.findFirst({
      where: { status: 'ACTIVO' },
      select: { id: true },
    });
    if (!year) throw new NotFoundException('No hay un año académico activo');
    return year.id;
  }

  /**
   * Valida la fecha de ingreso y la devuelve como ISO yyyy-mm-dd. Rango válido:
   * [enrollmentStart del año académico, hoy]. Fuera de rango → 400 con mensaje claro.
   * Esta fecha define desde cuándo se cobran las pensiones (prorrateo universal).
   */
  private async resolveEntryDate(
    client: DbClient,
    academicYearId: string,
    entryDate: Date,
  ): Promise<string> {
    const year = await client.academicYear.findUnique({
      where: { id: academicYearId },
      select: { enrollmentStart: true },
    });
    if (!year) throw new NotFoundException('Año académico no encontrado');
    const entryISO = dateToISO(entryDate);
    const startISO = dateToISO(year.enrollmentStart);
    const today = todayISO();
    // Comparación lexicográfica sobre yyyy-mm-dd (equivale a comparar fechas civiles).
    if (entryISO < startISO || entryISO > today) {
      throw new BadRequestException(
        'La fecha de ingreso debe estar entre el inicio de matrícula y hoy',
      );
    }
    return entryISO;
  }

  /**
   * Resuelve el cronograma server-side (nunca se confía en montos del cliente):
   * tarifario del nivel de la sección, configuración, programas y descuento
   * (explícito o regla automática de HERMANOS). Devuelve las cuotas en centavos.
   */
  private async resolveSchedule(
    client: DbClient,
    input: EnrollmentWizardInput,
    opts: { enrollmentDate: string; currentStudentId?: string },
  ): Promise<ResolvedSchedule> {
    const section = await client.section.findUnique({
      where: { id: input.sectionId },
      select: {
        id: true,
        shift: true,
        capacity: true,
        gradeLevel: {
          select: {
            level: {
              select: {
                name: true,
                academicYearId: true,
                academicYear: { select: { name: true } },
                fee: {
                  select: { enrollmentFee: true, monthlyFee: true, installmentsCount: true },
                },
              },
            },
          },
        },
      },
    });
    if (!section) throw new NotFoundException('Sección no encontrada');

    const level = section.gradeLevel.level;
    if (level.academicYearId !== input.academicYearId) {
      throw new BadRequestException('La sección no pertenece al año indicado');
    }
    if (!level.fee) {
      throw new NotFoundException(`El nivel ${level.name} no tiene tarifario configurado`);
    }

    const settings = await client.billingSettings.findUnique({ where: { id: 1 } });
    if (!settings) throw new NotFoundException('Falta la configuración de cobranza');

    const warnings: string[] = [];

    // Programas elegidos: deben ser ACTIVO, del mismo año, con vacantes y con vigencia cobrable.
    // Cada uno genera su PROPIO cronograma (cuotas separadas de la pensión escolar).
    const programSchedules: ResolvedProgramSchedule[] = [];
    // Dedup por si el wizard repite un programId.
    const programIds = [...new Set(input.programIds)];
    for (const programId of programIds) {
      const program = await client.program.findUnique({
        where: { id: programId },
        select: {
          id: true,
          name: true,
          monthlyFee: true,
          enrollmentFee: true,
          startMonth: true,
          endMonth: true,
          capacity: true,
          status: true,
          academicYearId: true,
        },
      });
      if (!program) throw new NotFoundException('Programa no encontrado');
      if (program.academicYearId !== input.academicYearId) {
        throw new BadRequestException(`El programa ${program.name} no pertenece al año indicado`);
      }
      if (program.status !== 'ACTIVO') {
        throw new BadRequestException(`El programa ${program.name} no está activo`);
      }
      const enrolled = await client.programEnrollment.count({
        where: { programId, canceledAt: null },
      });
      if (enrolled >= program.capacity) {
        throw new ConflictException(`El programa ${program.name} está lleno`);
      }

      const items = programScheduleItems(program, {
        enrollmentDate: opts.enrollmentDate,
        yearName: Number(section.gradeLevel.level.academicYear.name),
        dueDayOfMonth: settings.dueDayOfMonth,
        cutoffDay: settings.transferCutoffDay,
      });
      // Sin cuotas cobrables = la vigencia ya pasó: no se puede inscribir al programa.
      if (!items.some((i) => i.type === 'PENSION')) {
        throw new BadRequestException(`El programa ${program.name} ya finalizó`);
      }
      programSchedules.push({
        programId: program.id,
        name: program.name,
        monthlyFee: program.monthlyFee,
        enrollmentFee: program.enrollmentFee,
        items,
      });
    }

    // Descuento: explícito (ACTIVO) o regla automática de HERMANOS.
    let discount: ResolvedSchedule['discount'] = null;
    if (input.discountId) {
      const chosen = await client.discount.findUnique({ where: { id: input.discountId } });
      if (!chosen) throw new NotFoundException('Descuento no encontrado');
      if (chosen.status !== 'ACTIVO') {
        throw new BadRequestException('El descuento elegido no está activo');
      }
      discount = {
        id: chosen.id,
        name: chosen.name,
        percent: chosen.percent.toNumber(),
        auto: false,
      };
    } else {
      // Solo se propone solo si su aplicación es AUTOMATICO: configurado en MANUAL,
      // queda como opción elegible pero nunca preseleccionado.
      const hermanos = await client.discount.findFirst({
        where: { code: 'HERMANOS', status: 'ACTIVO', application: 'AUTOMATICO' },
      });
      if (hermanos) {
        // ¿El apoderado firmante tiene otro hijo con matrícula activa este año?
        const otherChildren = await client.enrollment.count({
          where: {
            academicYearId: input.academicYearId,
            canceledAt: null,
            ...(opts.currentStudentId ? { studentId: { not: opts.currentStudentId } } : {}),
            student: {
              guardians: { some: { guardianId: input.signingGuardianId, active: true } },
            },
          },
        });
        if (otherChildren >= 1) {
          discount = {
            id: hermanos.id,
            name: hermanos.name,
            percent: hermanos.percent.toNumber(),
            auto: true,
          };
        }
      }
    }

    // Prorrateo universal: la fecha de ingreso (opts.enrollmentDate) define desde cuándo se
    // cobran las pensiones, con el mismo día de corte que antes solo se usaba en traslados.
    const transfer = { entryDate: opts.enrollmentDate, cutoffDay: settings.transferCutoffDay };

    const items = buildEnrollmentSchedule({
      enrollmentDate: opts.enrollmentDate,
      yearName: Number(level.academicYear.name),
      levelFee: {
        enrollmentFeeCents: decimalToCents(level.fee.enrollmentFee),
        monthlyFeeCents: decimalToCents(level.fee.monthlyFee),
        installmentsCount: level.fee.installmentsCount as 10 | 11,
      },
      discountPercent: discount ? discount.percent : 0,
      dueDayOfMonth: settings.dueDayOfMonth,
      transfer,
    });

    return {
      yearName: level.academicYear.name,
      section: { id: section.id, shift: section.shift, capacity: section.capacity },
      items,
      discount,
      programSchedules,
      warnings,
    };
  }

  // Cuota → objeto con montos en centavos y en string decimal para la UI.
  private serializeItem(item: ScheduleItem) {
    return {
      type: item.type,
      concept: item.concept,
      sequence: item.sequence,
      dueDate: item.dueDate,
      baseCents: item.baseCents,
      discountCents: item.discountCents,
      programsCents: item.programsCents,
      totalCents: item.totalCents,
      base: fromCents(item.baseCents),
      discount: fromCents(item.discountCents),
      programs: fromCents(item.programsCents),
      amount: fromCents(item.totalCents),
    };
  }

  // POST /api/enrollment/preview — cronograma sin persistir.
  async preview(input: EnrollmentWizardInput) {
    const entryDate = await this.resolveEntryDate(
      this.prisma,
      input.academicYearId,
      input.entryDate,
    );
    const resolved = await this.resolveSchedule(this.prisma, input, {
      enrollmentDate: entryDate,
      currentStudentId: input.studentId,
    });

    // Aviso (sin bloquear) si la sección ya no tiene vacantes.
    const activeInSection = await this.prisma.enrollment.count({
      where: { sectionId: input.sectionId, canceledAt: null },
    });
    if (activeInSection >= resolved.section.capacity) {
      resolved.warnings.push('La sección está llena');
    }

    const schoolCents = resolved.items.reduce((sum, i) => sum + i.totalCents, 0);
    const programSchedules = resolved.programSchedules.map((ps) => {
      const psTotalCents = ps.items.reduce((sum, i) => sum + i.totalCents, 0);
      return {
        programId: ps.programId,
        name: ps.name,
        items: ps.items.map((i) => this.serializeItem(i)),
        totalCents: psTotalCents,
        total: fromCents(psTotalCents),
      };
    });
    const programsCents = programSchedules.reduce((sum, ps) => sum + ps.totalCents, 0);
    // Gran total = escolar + todos los programas.
    const totalCents = schoolCents + programsCents;
    return {
      items: resolved.items.map((i) => this.serializeItem(i)),
      programSchedules,
      totalCents,
      total: fromCents(totalCents),
      discount: resolved.discount,
      warnings: resolved.warnings,
    };
  }

  // POST /api/enrollments — matrícula real (transacción; recálculo server-side).
  async create(input: EnrollmentWizardInput, actorId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const warnings: string[] = [];
        let reenrollment = false;

        // (0) Fecha de ingreso: valida el rango y define el prorrateo de pensiones.
        const entryDate = await this.resolveEntryDate(tx, input.academicYearId, input.entryDate);
        // Tipo derivado: alumno nuevo → NUEVA, alumno existente → RATIFICADA (ya no lo elige el usuario).
        const enrollmentType = input.newStudent ? 'NUEVA' : 'RATIFICADA';

        // (2) Sección: existe, del año correcto, con vacantes.
        const section = await tx.section.findUnique({
          where: { id: input.sectionId },
          select: {
            id: true,
            shift: true,
            capacity: true,
            gradeLevel: { select: { level: { select: { academicYearId: true } } } },
          },
        });
        if (!section) throw new NotFoundException('Sección no encontrada');
        if (section.gradeLevel.level.academicYearId !== input.academicYearId) {
          throw new BadRequestException('La sección no pertenece al año indicado');
        }
        const activeInSection = await tx.enrollment.count({
          where: { sectionId: input.sectionId, canceledAt: null },
        });
        if (activeInSection >= section.capacity) {
          throw new ConflictException('La sección está llena');
        }

        // (1) Estudiante: nuevo o existente.
        let studentId: string;
        if (input.newStudent) {
          const code = await nextCode(tx, 'student', 'E-', 4, 1001);
          const ns = input.newStudent;
          const student = await tx.student.create({
            data: {
              code,
              firstNames: ns.firstNames,
              paternalLastName: ns.paternalLastName,
              maternalLastName: ns.maternalLastName || null,
              dni: ns.dni,
              birthDate: ns.birthDate,
              sex: ns.sex,
              address: ns.address,
              previousSchool: ns.previousSchool ?? null,
              shift: section.shift,
              allergies: ns.allergies ?? null,
              insuranceType: ns.insuranceType,
              emergencyContactName: ns.emergencyContactName ?? null,
              emergencyContactPhone: ns.emergencyContactPhone ?? null,
              authorizedPickups: ns.authorizedPickups as unknown as Prisma.InputJsonValue,
            },
          });
          studentId = student.id;

          // (4) Vincula al apoderado firmante como principal (la ficha lo ajusta después).
          await tx.studentGuardian.create({
            data: {
              studentId,
              guardianId: input.signingGuardianId,
              relation: 'TUTOR_LEGAL',
              isPrimary: true,
              active: true,
            },
          });
          warnings.push(
            'El apoderado firmante quedó vinculado como TUTOR_LEGAL principal; ajústalo en la ficha si corresponde',
          );
        } else {
          const student = await tx.student.findUnique({
            where: { id: input.studentId },
            select: { id: true, status: true },
          });
          if (!student) throw new NotFoundException('Estudiante no encontrado');
          // Un egresado no vuelve a matricularse; el resto sí (un retirado/trasladado se re-activa).
          if (student.status === 'EGRESADO') {
            throw new BadRequestException('Un estudiante egresado no puede volver a matricularse');
          }
          studentId = student.id;
          // Re-matrícula de un retiro: se re-activa y se limpian los datos de baja (el historial
          // queda en AuditLog). BECADO conserva su condición; ACTIVO/RESERVADO no aportan baja.
          reenrollment = student.status === 'RETIRADO' || student.status === 'TRASLADADO';

          // (4) El apoderado firmante debe estar vinculado activo al estudiante.
          const link = await tx.studentGuardian.findUnique({
            where: {
              studentId_guardianId: { studentId, guardianId: input.signingGuardianId },
            },
            select: { active: true },
          });
          if (!link || !link.active) {
            throw new BadRequestException(
              'El apoderado firmante debe estar vinculado al estudiante',
            );
          }

          // Turno ← turno de la sección. Reserva/retiro/traslado que se concreta pasa a ACTIVO;
          // BECADO conserva su condición. Un retiro limpia sus datos de baja al re-matricular.
          const reactivates = ['RESERVADO', 'RETIRADO', 'TRASLADADO'].includes(student.status);
          await tx.student.update({
            where: { id: studentId },
            data: {
              shift: section.shift,
              ...(reactivates ? { status: 'ACTIVO' as const } : {}),
              ...(reenrollment ? { withdrawalReason: null, withdrawnAt: null } : {}),
            },
          });
        }

        // (3) Unicidad: solo bloquea una matrícula VIGENTE del año (las anuladas no cuentan, para
        // permitir re-matricular a quien se retiró/trasladó). Refuerzo en BD: índice único parcial.
        const existing = await tx.enrollment.findFirst({
          where: { studentId, academicYearId: input.academicYearId, canceledAt: null },
          select: { id: true },
        });
        if (existing) {
          throw new ConflictException('El estudiante ya tiene matrícula en este año');
        }

        // (5) Cronograma server-side (la fecha de ingreso define el prorrateo de pensiones).
        const resolved = await this.resolveSchedule(tx, input, {
          enrollmentDate: entryDate,
          currentStudentId: studentId,
        });

        // (6) Enrollment + programas + cuotas.
        const code = await nextCode(tx, `enrollment:${resolved.yearName}`, `M-${resolved.yearName}-`, 4);
        const enrollment = await tx.enrollment.create({
          data: {
            code,
            studentId,
            sectionId: input.sectionId,
            academicYearId: input.academicYearId,
            type: enrollmentType,
            status: 'PENDIENTE_PAGO',
            signingGuardianId: input.signingGuardianId,
            registeredById: actorId,
            discountId: resolved.discount?.id ?? null,
            // siagieCode queda null en matrículas nuevas (histórico de traslados).
            entryDate: isoToDate(entryDate),
          },
        });

        // Cuotas escolares (matrícula + pensiones).
        for (const item of resolved.items) {
          await tx.installment.create({
            data: {
              enrollmentId: enrollment.id,
              type: item.type,
              concept: item.concept,
              sequence: item.sequence,
              dueDate: isoToDate(item.dueDate),
              baseAmount: centsToDecimal(item.baseCents),
              discountAmount: centsToDecimal(item.discountCents),
              programsAmount: centsToDecimal(item.programsCents),
              amount: centsToDecimal(item.totalCents),
              status: 'PENDIENTE',
            },
          });
        }

        // Inscripciones a programas: cada una con su ProgramEnrollment + cuotas propias.
        let programsCents = 0;
        for (const ps of resolved.programSchedules) {
          const programEnrollment = await tx.programEnrollment.create({
            data: {
              programId: ps.programId,
              studentId,
              registeredById: actorId,
              monthlyFeeSnapshot: ps.monthlyFee,
              enrollmentFeeSnapshot: ps.enrollmentFee,
            },
          });
          for (const item of ps.items) {
            await tx.installment.create({
              data: {
                programEnrollmentId: programEnrollment.id,
                type: item.type,
                concept: programInstallmentConcept(item, ps.name),
                sequence: item.sequence,
                dueDate: isoToDate(item.dueDate),
                baseAmount: centsToDecimal(item.baseCents),
                discountAmount: centsToDecimal(item.discountCents),
                programsAmount: centsToDecimal(item.programsCents),
                amount: centsToDecimal(item.totalCents),
                status: 'PENDIENTE',
              },
            });
            programsCents += item.totalCents;
          }
        }

        const schoolCents = resolved.items.reduce((sum, i) => sum + i.totalCents, 0);
        const totalCents = schoolCents + programsCents;

        // (7) Auditoría.
        await this.audit.log(
          {
            userId: actorId,
            action: 'enrollment.create',
            entity: 'Enrollment',
            entityId: enrollment.id,
            payload: {
              code: enrollment.code,
              studentId,
              sectionId: input.sectionId,
              type: enrollmentType,
              entryDate,
              discountId: resolved.discount?.id ?? null,
              installments: resolved.items.length,
              totalCents,
              ...(reenrollment ? { reenrollment: true } : {}),
            },
          },
          tx,
        );

        return {
          enrollment: { id: enrollment.id, code: enrollment.code },
          schedule: resolved.items.map((i) => this.serializeItem(i)),
          programSchedules: resolved.programSchedules.map((ps) => ({
            programId: ps.programId,
            name: ps.name,
            schedule: ps.items.map((i) => this.serializeItem(i)),
          })),
          total: fromCents(totalCents),
          discount: resolved.discount,
          warnings: [...resolved.warnings, ...warnings],
        };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = (error.meta?.target as string[] | undefined)?.join(',') ?? '';
        // La inscripción a programa es única por (programId, studentId): tiene prioridad sobre studentId.
        if (target.includes('programId')) {
          throw new ConflictException('El estudiante ya está inscrito en esa edición del programa');
        }
        if (target.includes('studentId')) {
          throw new ConflictException('El estudiante ya tiene matrícula en este año');
        }
        if (target.includes('dni')) {
          throw new ConflictException('Ya existe un estudiante con ese DNI');
        }
        throw new ConflictException('Registro duplicado');
      }
      throw error;
    }
  }

  // POST /api/enrollments/:id/cancel — anula la matrícula = CORRECCIÓN de un error de registro:
  // anula TODO el cronograma no pagado (PENDIENTE y VENCIDO) → deuda cero. Las PAGADO conservan su
  // recibo (se corrigen por Devoluciones). Para una salida real del colegio con deuda no condonada,
  // el camino es Retirar/Trasladar en la ficha del estudiante.
  async cancel(id: string, reason: string, actorId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
      select: { id: true, canceledAt: true },
    });
    if (!enrollment) throw new NotFoundException('Matrícula no encontrada');
    if (enrollment.canceledAt) throw new BadRequestException('La matrícula ya está anulada');

    const now = new Date();
    return this.prisma.$transaction(async (tx) => {
      await tx.enrollment.update({
        where: { id },
        data: { canceledAt: now, cancelReason: reason },
      });
      // Anula pendientes Y vencidas (el estado VENCIDO se materializa desde R2-E2).
      const anulled = await tx.installment.updateMany({
        where: { enrollmentId: id, status: { in: ['PENDIENTE', 'VENCIDO'] } },
        data: { status: 'ANULADO', cancelReason: reason, canceledAt: now, canceledById: actorId },
      });
      // Cuotas ya pagadas: conservan su recibo (la corrección va por Devoluciones) — se informa
      // para que la UI pueda avisar sobre devoluciones.
      const paidCount = await tx.installment.count({
        where: { enrollmentId: id, status: 'PAGADO' },
      });
      await this.audit.log(
        {
          userId: actorId,
          action: 'enrollment.cancel',
          entity: 'Enrollment',
          entityId: id,
          payload: { reason, canceledInstallments: anulled.count, paidCount },
        },
        tx,
      );
      return { id, canceledAt: now, canceledInstallments: anulled.count, paidCount };
    });
  }

  // GET /api/enrollments — listado paginado (incluye anuladas, con badge en la UI).
  async list(query: EnrollmentListQuery) {
    const yearId = query.yearId ?? (await this.activeYearId());

    const where: Prisma.EnrollmentWhereInput = { academicYearId: yearId };
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { code: { contains: term, mode: 'insensitive' } },
        { student: { firstNames: { contains: term, mode: 'insensitive' } } },
        { student: { paternalLastName: { contains: term, mode: 'insensitive' } } },
        { student: { maternalLastName: { contains: term, mode: 'insensitive' } } },
        { student: { dni: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.enrollment.count({ where }),
      this.prisma.enrollment.findMany({
        where,
        orderBy: { enrolledAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        select: {
          id: true,
          code: true,
          type: true,
          status: true,
          enrolledAt: true,
          canceledAt: true,
          student: {
            select: {
              id: true,
              code: true,
              firstNames: true,
              paternalLastName: true,
              maternalLastName: true,
            },
          },
          section: {
            select: {
              name: true,
              gradeLevel: { select: { name: true, level: { select: { name: true } } } },
            },
          },
          discount: { select: { name: true, percent: true } },
        },
      }),
    ]);

    const items = rows.map((e) => ({
      id: e.id,
      code: e.code,
      student: {
        id: e.student.id,
        code: e.student.code,
        firstNames: e.student.firstNames,
        paternalLastName: e.student.paternalLastName,
        maternalLastName: e.student.maternalLastName,
      },
      placement: {
        levelName: e.section.gradeLevel.level.name,
        gradeName: e.section.gradeLevel.name,
        sectionName: e.section.name,
      },
      type: e.type,
      status: e.status,
      enrolledAt: e.enrolledAt,
      discount: e.discount ? { name: e.discount.name, percent: e.discount.percent.toFixed(2) } : null,
      canceled: e.canceledAt !== null,
    }));

    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  // GET /api/enrollments/stats — indicadores de matrícula del año (matrículas activas).
  async stats(yearId?: string) {
    const resolvedYearId = yearId ?? (await this.activeYearId());
    const activeWhere: Prisma.EnrollmentWhereInput = {
      academicYearId: resolvedYearId,
      canceledAt: null,
    };

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [byType, byStatus, total, capacityAgg, todayCount] = await Promise.all([
      this.prisma.enrollment.groupBy({
        by: ['type'],
        where: activeWhere,
        _count: { _all: true },
      }),
      this.prisma.enrollment.groupBy({
        by: ['status'],
        where: activeWhere,
        _count: { _all: true },
      }),
      this.prisma.enrollment.count({ where: activeWhere }),
      this.prisma.section.aggregate({
        where: { gradeLevel: { level: { academicYearId: resolvedYearId } } },
        _sum: { capacity: true },
      }),
      this.prisma.enrollment.count({
        where: { ...activeWhere, enrolledAt: { gte: startOfToday } },
      }),
    ]);

    const typeCounts = { NUEVA: 0, RATIFICADA: 0, TRASLADO: 0 };
    for (const g of byType) typeCounts[g.type] = g._count._all;
    const statusCounts = { COMPLETA: 0, PENDIENTE_PAGO: 0, OBSERVADA: 0 };
    for (const g of byStatus) statusCounts[g.status] = g._count._all;

    const capacity = capacityAgg._sum.capacity ?? 0;
    return {
      total,
      byType: typeCounts,
      byStatus: statusCounts,
      vacancies: { capacity, enrolled: total, free: capacity - total },
      today: todayCount,
    };
  }

  // GET /api/enrollments/:id — detalle con cuotas y programas.
  async findOne(id: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        type: true,
        status: true,
        enrolledAt: true,
        canceledAt: true,
        cancelReason: true,
        siagieCode: true,
        entryDate: true,
        academicYear: { select: { id: true, name: true } },
        student: {
          select: {
            id: true,
            code: true,
            firstNames: true,
            paternalLastName: true,
            maternalLastName: true,
            dni: true,
          },
        },
        section: {
          select: {
            id: true,
            name: true,
            gradeLevel: { select: { name: true, level: { select: { name: true } } } },
          },
        },
        signingGuardian: { select: { id: true, code: true, fullName: true } },
        discount: { select: { id: true, name: true, percent: true } },
        installments: {
          orderBy: { sequence: 'asc' },
          select: {
            id: true,
            type: true,
            concept: true,
            sequence: true,
            dueDate: true,
            baseAmount: true,
            discountAmount: true,
            programsAmount: true,
            amount: true,
            status: true,
          },
        },
      },
    });
    if (!enrollment) throw new NotFoundException('Matrícula no encontrada');

    // Programas del estudiante en el año de la matrícula (inscripciones ACTIVAS, cuotas propias).
    const programEnrollments = await this.prisma.programEnrollment.findMany({
      where: {
        studentId: enrollment.student.id,
        canceledAt: null,
        program: { academicYearId: enrollment.academicYear.id },
      },
      orderBy: { enrolledAt: 'asc' },
      select: {
        id: true,
        monthlyFeeSnapshot: true,
        program: { select: { id: true, name: true, type: true } },
      },
    });

    return {
      id: enrollment.id,
      code: enrollment.code,
      type: enrollment.type,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      canceled: enrollment.canceledAt !== null,
      canceledAt: enrollment.canceledAt,
      cancelReason: enrollment.cancelReason,
      year: enrollment.academicYear.name,
      student: enrollment.student,
      placement: {
        levelName: enrollment.section.gradeLevel.level.name,
        gradeName: enrollment.section.gradeLevel.name,
        sectionName: enrollment.section.name,
        sectionId: enrollment.section.id,
      },
      signingGuardian: enrollment.signingGuardian,
      discount: enrollment.discount
        ? {
            id: enrollment.discount.id,
            name: enrollment.discount.name,
            percent: enrollment.discount.percent.toFixed(2),
          }
        : null,
      transfer:
        enrollment.type === 'TRASLADO'
          ? {
              siagieCode: enrollment.siagieCode,
              entryDate: enrollment.entryDate,
            }
          : null,
      programs: programEnrollments.map((pe) => ({
        programEnrollmentId: pe.id,
        programId: pe.program.id,
        name: pe.program.name,
        type: pe.program.type,
        monthlyFee: pe.monthlyFeeSnapshot.toFixed(2),
      })),
      installments: enrollment.installments.map((i) => ({
        id: i.id,
        type: i.type,
        concept: i.concept,
        sequence: i.sequence,
        dueDate: i.dueDate,
        base: i.baseAmount.toFixed(2),
        discount: i.discountAmount.toFixed(2),
        programs: i.programsAmount.toFixed(2),
        amount: i.amount.toFixed(2),
        status: i.status,
      })),
    };
  }
}
