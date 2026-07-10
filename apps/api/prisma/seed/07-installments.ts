import { type InstallmentStatus, type PrismaClient } from '@prisma/client';
import { buildEnrollmentSchedule, buildProgramSchedule, toCents } from '@elohim/shared';

// Fecha calendario de hoy (yyyy-mm-dd, local): comparación de vencimientos por string (TZ-independiente).
function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const dateToISO = (date: Date): string => date.toISOString().slice(0, 10);
const isoToDate = (iso: string): Date => new Date(`${iso}T00:00:00.000Z`);

/**
 * Cronogramas de las matrículas 2026 (cierre de R1). Idempotente: salta las matrículas
 * que ya tienen cuotas. Aplica descuento HERMANOS (2° hijo+), una BECA_COMPLETA y realismo
 * de pagos (~70% al día, ~30% con deuda vencida real) para que estudiantes/apoderados
 * muestren deuda de verdad.
 */
export async function seedInstallments(prisma: PrismaClient) {
  const year = await prisma.academicYear.findUnique({ where: { name: '2026' } });
  if (!year) throw new Error('Falta el año 2026 — corre primero el seed 04-academic-years');

  const settings = await prisma.billingSettings.findUnique({ where: { id: 1 } });
  if (!settings) throw new Error('Falta BillingSettings — corre primero el seed 03-billing');

  const [hermanos, becaCompleta, danza] = await Promise.all([
    prisma.discount.findUnique({ where: { code: 'HERMANOS' } }),
    prisma.discount.findUnique({ where: { code: 'BECA_COMPLETA' } }),
    prisma.program.findFirst({ where: { academicYearId: year.id, name: 'Taller de Danza' } }),
  ]);
  if (!hermanos || !becaCompleta) throw new Error('Faltan descuentos — corre primero el seed 03-billing');
  if (!danza) throw new Error('Falta el Taller de Danza — corre primero el seed 05-structure-2026');

  // Tarifario por nivel.
  const fees = await prisma.levelFee.findMany({
    where: { level: { academicYearId: year.id } },
    select: { levelId: true, enrollmentFee: true, monthlyFee: true, installmentsCount: true },
  });
  const feeByLevel = new Map(fees.map((f) => [f.levelId, f]));

  // Matrículas activas 2026, orden estable por código.
  const enrollments = await prisma.enrollment.findMany({
    where: { academicYearId: year.id, canceledAt: null },
    orderBy: { code: 'asc' },
    select: {
      id: true,
      code: true,
      studentId: true,
      registeredById: true,
      enrolledAt: true,
      signingGuardianId: true,
      student: { select: { status: true } },
      section: { select: { gradeLevel: { select: { level: { select: { id: true, name: true } } } } } },
      _count: { select: { installments: true } },
    },
  });

  // HERMANOS: familias (mismo firmante) con 2+ hijos → el 2° en adelante (orden por matrícula).
  const byGuardian = new Map<string, typeof enrollments>();
  for (const e of enrollments) {
    const arr = byGuardian.get(e.signingGuardianId) ?? [];
    arr.push(e);
    byGuardian.set(e.signingGuardianId, arr);
  }
  const hermanoIds = new Set<string>();
  for (const arr of byGuardian.values()) {
    if (arr.length < 2) continue;
    const sorted = [...arr].sort(
      (a, b) => a.enrolledAt.getTime() - b.enrolledAt.getTime() || a.code.localeCompare(b.code),
    );
    for (let k = 1; k < sorted.length; k++) hermanoIds.add(sorted[k]!.id);
  }

  // BECA_COMPLETA: un estudiante BECADO (manual → reemplaza al automático).
  const becaId = enrollments.find((e) => e.student.status === 'BECADO')?.id ?? null;

  const today = todayISO();
  const danzaCents = toCents(danza.monthlyFee.toString());

  let created = 0;
  let skipped = 0;
  let paidCuotas = 0;
  let pendingCuotas = 0;
  let payers = 0;

  for (let i = 0; i < enrollments.length; i++) {
    const e = enrollments[i]!;
    if (e._count.installments > 0) {
      skipped += 1;
      continue;
    }

    const fee = feeByLevel.get(e.section.gradeLevel.level.id);
    if (!fee) throw new Error(`Nivel sin tarifario: ${e.section.gradeLevel.level.name}`);

    // Descuento: beca (100%) tiene prioridad; si no, hermanos (10%).
    let discountId: string | null = null;
    let discountPercent = 0;
    if (e.id === becaId) {
      discountId = becaCompleta.id;
      discountPercent = 100;
    } else if (hermanoIds.has(e.id)) {
      discountId = hermanos.id;
      discountPercent = 10;
    }

    const items = buildEnrollmentSchedule({
      enrollmentDate: dateToISO(e.enrolledAt),
      yearName: 2026,
      levelFee: {
        enrollmentFeeCents: toCents(fee.enrollmentFee.toString()),
        monthlyFeeCents: toCents(fee.monthlyFee.toString()),
        installmentsCount: fee.installmentsCount as 10 | 11,
      },
      discountPercent,
      dueDayOfMonth: settings.dueDayOfMonth,
    });

    // Realismo: ~70% pagan lo vencido (determinístico); el resto arrastra deuda vencida.
    const paysPast = i % 10 < 7;
    if (paysPast) payers += 1;

    for (const item of items) {
      const isPast = item.dueDate < today;
      const status: InstallmentStatus = isPast && paysPast ? 'PAGADO' : 'PENDIENTE';
      if (status === 'PAGADO') paidCuotas += 1;
      else pendingCuotas += 1;

      await prisma.installment.create({
        data: {
          enrollmentId: e.id,
          type: item.type,
          concept: item.concept,
          sequence: item.sequence,
          dueDate: isoToDate(item.dueDate),
          baseAmount: (item.baseCents / 100).toFixed(2),
          discountAmount: (item.discountCents / 100).toFixed(2),
          programsAmount: (item.programsCents / 100).toFixed(2),
          amount: (item.totalCents / 100).toFixed(2),
          status,
        },
      });
    }

    // Matrícula pagada al día → COMPLETA; con deuda vencida → PENDIENTE_PAGO. Fija el descuento aplicado.
    await prisma.enrollment.update({
      where: { id: e.id },
      data: { discountId, status: paysPast ? 'COMPLETA' : 'PENDIENTE_PAGO' },
    });

    created += 1;
  }

  // ----- Inscripciones al Taller de Danza (cuotas propias del programa) -----
  // Separado de las pensiones (el programa genera su cronograma). Idempotente por (programa, estudiante):
  // si ya existe (creado por la migración o una corrida previa), se salta.
  const DANZA_INDICES = [3, 9, 17];
  const danzaEnrollFeeCents = toCents(danza.enrollmentFee.toString());
  let programEnrolls = 0;
  let programSkipped = 0;
  for (const idx of DANZA_INDICES) {
    const e = enrollments[idx];
    if (!e) continue;
    const exists = await prisma.programEnrollment.findUnique({
      where: { programId_studentId: { programId: danza.id, studentId: e.studentId } },
    });
    if (exists) {
      programSkipped += 1;
      continue;
    }

    const paysPast = idx % 10 < 7;
    const progItems = buildProgramSchedule({
      enrollmentDate: dateToISO(e.enrolledAt),
      yearName: 2026,
      startMonth: danza.startMonth,
      endMonth: danza.endMonth,
      enrollmentFeeCents: danzaEnrollFeeCents,
      monthlyFeeCents: danzaCents,
      dueDayOfMonth: settings.dueDayOfMonth,
      cutoffDay: settings.transferCutoffDay,
    });

    const pe = await prisma.programEnrollment.create({
      data: {
        programId: danza.id,
        studentId: e.studentId,
        registeredById: e.registeredById,
        enrolledAt: e.enrolledAt,
        monthlyFeeSnapshot: danza.monthlyFee,
        enrollmentFeeSnapshot: danza.enrollmentFee,
      },
    });

    for (const item of progItems) {
      const isPast = item.dueDate < today;
      const status: InstallmentStatus = isPast && paysPast ? 'PAGADO' : 'PENDIENTE';
      await prisma.installment.create({
        data: {
          programEnrollmentId: pe.id,
          type: item.type,
          concept:
            item.type === 'MATRICULA'
              ? item.concept
              : item.concept.replace('Programa · ', `Programa · ${danza.name} · `),
          sequence: item.sequence,
          dueDate: isoToDate(item.dueDate),
          baseAmount: (item.baseCents / 100).toFixed(2),
          discountAmount: (item.discountCents / 100).toFixed(2),
          programsAmount: (item.programsCents / 100).toFixed(2),
          amount: (item.totalCents / 100).toFixed(2),
          status,
        },
      });
    }
    programEnrolls += 1;
  }

  console.log(
    `  ✓ Cronogramas: ${created} matrículas (${skipped} ya tenían cuotas) · ${payers} al día / ${created - payers} con deuda · ${paidCuotas} cuotas PAGADO, ${pendingCuotas} PENDIENTE · ${hermanoIds.size} con HERMANOS, ${becaId ? 1 : 0} BECA_COMPLETA · Danza: ${programEnrolls} inscritos (${programSkipped} ya existían)`,
  );
}
