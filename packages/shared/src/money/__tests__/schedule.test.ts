import { describe, expect, it } from 'vitest';
import {
  buildEnrollmentSchedule,
  buildProgramSchedule,
  type ProgramScheduleInput,
  type ScheduleInput,
} from '../schedule';

// Tarifario base: Primaria (matrícula 250, pensión 280, 10 cuotas).
const PRIMARIA: ScheduleInput['levelFee'] = {
  enrollmentFeeCents: 25000,
  monthlyFeeCents: 28000,
  installmentsCount: 10,
};

function baseInput(overrides: Partial<ScheduleInput> = {}): ScheduleInput {
  return {
    enrollmentDate: '2026-03-02',
    yearName: 2026,
    levelFee: PRIMARIA,
    discountPercent: 0,
    dueDayOfMonth: null,
    ...overrides,
  };
}

describe('buildEnrollmentSchedule — estructura de cuotas', () => {
  it('10 cuotas → matrícula + 10 pensiones Marzo..Diciembre', () => {
    const items = buildEnrollmentSchedule(baseInput());
    expect(items).toHaveLength(11);
    expect(items[0]).toMatchObject({ type: 'MATRICULA', sequence: 0, concept: 'Matrícula' });
    const pensiones = items.filter((i) => i.type === 'PENSION');
    expect(pensiones).toHaveLength(10);
    expect(pensiones[0]!.concept).toBe('Pensión Marzo');
    expect(pensiones.at(-1)!.concept).toBe('Pensión Diciembre');
    expect(pensiones.map((p) => p.sequence)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('11 cuotas → pensiones Febrero..Diciembre', () => {
    const items = buildEnrollmentSchedule(
      baseInput({ levelFee: { ...PRIMARIA, installmentsCount: 11 } }),
    );
    const pensiones = items.filter((i) => i.type === 'PENSION');
    expect(pensiones).toHaveLength(11);
    expect(pensiones[0]!.concept).toBe('Pensión Febrero');
    expect(pensiones.at(-1)!.concept).toBe('Pensión Diciembre');
  });
});

describe('buildEnrollmentSchedule — matrícula', () => {
  it('vence exactamente en enrollmentDate y no lleva descuento aunque sea 100%', () => {
    const items = buildEnrollmentSchedule(baseInput({ discountPercent: 100 }));
    const matricula = items[0]!;
    expect(matricula.dueDate).toBe('2026-03-02');
    expect(matricula.baseCents).toBe(25000);
    expect(matricula.discountCents).toBe(0);
    expect(matricula.programsCents).toBe(0);
    expect(matricula.totalCents).toBe(25000);
  });
});

describe('buildEnrollmentSchedule — descuentos (solo pensión)', () => {
  it('10% descuenta solo la pensión', () => {
    const items = buildEnrollmentSchedule(baseInput({ discountPercent: 10 }));
    const p = items.find((i) => i.type === 'PENSION')!;
    expect(p.baseCents).toBe(28000);
    expect(p.discountCents).toBe(2800);
    expect(p.totalCents).toBe(25200);
  });

  it('50% descuenta la mitad de la pensión', () => {
    const items = buildEnrollmentSchedule(baseInput({ discountPercent: 50 }));
    const p = items.find((i) => i.type === 'PENSION')!;
    expect(p.discountCents).toBe(14000);
    expect(p.totalCents).toBe(14000);
  });

  it('100% → pensión neta 0; los programas ya no se incrustan en la pensión', () => {
    const items = buildEnrollmentSchedule(baseInput({ discountPercent: 100 }));
    const p = items.find((i) => i.type === 'PENSION')!;
    expect(p.baseCents).toBe(28000);
    expect(p.discountCents).toBe(28000);
    expect(p.programsCents).toBe(0);
    expect(p.totalCents).toBe(0); // 28000 - 28000
    // La matrícula nunca lleva descuento.
    expect(items[0]!.totalCents).toBe(25000);
  });

  it('redondeo: pensión 333.33 −10% → descuento 3333, total 30000', () => {
    const items = buildEnrollmentSchedule(
      baseInput({ levelFee: { ...PRIMARIA, monthlyFeeCents: 33333 }, discountPercent: 10 }),
    );
    const p = items.find((i) => i.type === 'PENSION')!;
    expect(p.discountCents).toBe(3333);
    expect(p.totalCents).toBe(30000);
  });
});

describe('buildEnrollmentSchedule — vencimientos', () => {
  it('dueDayOfMonth null → último día de cada mes (2026 no bisiesto)', () => {
    const items = buildEnrollmentSchedule(
      baseInput({ levelFee: { ...PRIMARIA, installmentsCount: 11 } }),
    );
    const byMonth = (m: string) => items.find((i) => i.concept === `Pensión ${m}`)!.dueDate;
    expect(byMonth('Febrero')).toBe('2026-02-28');
    expect(byMonth('Marzo')).toBe('2026-03-31');
    expect(byMonth('Abril')).toBe('2026-04-30');
    expect(byMonth('Diciembre')).toBe('2026-12-31');
  });

  it('dueDayOfMonth fijo → ese día del mes', () => {
    const items = buildEnrollmentSchedule(baseInput({ dueDayOfMonth: 5 }));
    const marzo = items.find((i) => i.concept === 'Pensión Marzo')!;
    expect(marzo.dueDate).toBe('2026-03-05');
  });

  it('dueDayOfMonth 31 en un mes de 30 días → último día del mes', () => {
    const items = buildEnrollmentSchedule(baseInput({ dueDayOfMonth: 31 }));
    const abril = items.find((i) => i.concept === 'Pensión Abril')!;
    expect(abril.dueDate).toBe('2026-04-30');
  });
});

describe('buildEnrollmentSchedule — traslado', () => {
  it('entryDate 2026-08-17 corte 20 → agosto SÍ (5 pensiones)', () => {
    const items = buildEnrollmentSchedule(
      baseInput({ transfer: { entryDate: '2026-08-17', cutoffDay: 20 } }),
    );
    const pensiones = items.filter((i) => i.type === 'PENSION');
    expect(pensiones).toHaveLength(5);
    expect(pensiones.map((p) => p.concept)).toEqual([
      'Pensión Agosto',
      'Pensión Septiembre',
      'Pensión Octubre',
      'Pensión Noviembre',
      'Pensión Diciembre',
    ]);
    expect(pensiones.map((p) => p.sequence)).toEqual([1, 2, 3, 4, 5]);
    // La matrícula siempre está presente y completa.
    expect(items[0]).toMatchObject({ type: 'MATRICULA', totalCents: 25000 });
  });

  it('entryDate 2026-08-21 corte 20 → agosto NO (4 pensiones)', () => {
    const items = buildEnrollmentSchedule(
      baseInput({ transfer: { entryDate: '2026-08-21', cutoffDay: 20 } }),
    );
    const pensiones = items.filter((i) => i.type === 'PENSION');
    expect(pensiones).toHaveLength(4);
    expect(pensiones[0]!.concept).toBe('Pensión Septiembre');
  });

  it('corte configurable: entryDate 2026-08-17 corte 15 → agosto NO', () => {
    const items = buildEnrollmentSchedule(
      baseInput({ transfer: { entryDate: '2026-08-17', cutoffDay: 15 } }),
    );
    const pensiones = items.filter((i) => i.type === 'PENSION');
    expect(pensiones).toHaveLength(4);
    expect(pensiones[0]!.concept).toBe('Pensión Septiembre');
  });

  it('traslado + descuento combinados (sin programas en la pensión)', () => {
    const items = buildEnrollmentSchedule(
      baseInput({
        discountPercent: 10,
        transfer: { entryDate: '2026-08-17', cutoffDay: 20 },
      }),
    );
    const pensiones = items.filter((i) => i.type === 'PENSION');
    expect(pensiones).toHaveLength(5);
    for (const p of pensiones) {
      expect(p.baseCents).toBe(28000);
      expect(p.discountCents).toBe(2800);
      expect(p.programsCents).toBe(0);
      expect(p.totalCents).toBe(25200); // 28000 - 2800
    }
  });
});

describe('buildEnrollmentSchedule — suma total', () => {
  it('Σ totalCents == matrícula + Σ(base − descuento)', () => {
    const items = buildEnrollmentSchedule(baseInput({ discountPercent: 10 }));
    const total = items.reduce((sum, i) => sum + i.totalCents, 0);
    const expected =
      25000 + // matrícula
      10 * (28000 - 2800); // 10 pensiones puras
    expect(total).toBe(expected);
  });
});

// ===== Cronograma de programas complementarios =====

const REFUERZO: Pick<ProgramScheduleInput, 'enrollmentFeeCents' | 'monthlyFeeCents'> = {
  enrollmentFeeCents: 0,
  monthlyFeeCents: 8000, // 80.00
};

function programInput(overrides: Partial<ProgramScheduleInput> = {}): ProgramScheduleInput {
  return {
    enrollmentDate: '2026-03-02',
    yearName: 2026,
    startMonth: 3,
    endMonth: 12,
    enrollmentFeeCents: REFUERZO.enrollmentFeeCents,
    monthlyFeeCents: REFUERZO.monthlyFeeCents,
    dueDayOfMonth: null,
    cutoffDay: 20,
    ...overrides,
  };
}

describe('buildProgramSchedule — vigencia completa a futuro', () => {
  it('startMonth 3 endMonth 12, inscrito en marzo → 10 cuotas Marzo..Diciembre, sin matrícula', () => {
    const items = buildProgramSchedule(programInput());
    expect(items.filter((i) => i.type === 'MATRICULA')).toHaveLength(0);
    const cuotas = items.filter((i) => i.type === 'PENSION');
    expect(cuotas).toHaveLength(10);
    expect(cuotas[0]!.concept).toBe('Programa · Marzo');
    expect(cuotas.at(-1)!.concept).toBe('Programa · Diciembre');
    expect(cuotas.map((c) => c.sequence)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    for (const c of cuotas) {
      expect(c.baseCents).toBe(8000);
      expect(c.discountCents).toBe(0);
      expect(c.totalCents).toBe(8000);
    }
  });

  it('rango acotado 8..9 (Agosto–Septiembre) → 2 cuotas', () => {
    const items = buildProgramSchedule(programInput({ startMonth: 8, endMonth: 9 }));
    const cuotas = items.filter((i) => i.type === 'PENSION');
    expect(cuotas.map((c) => c.concept)).toEqual(['Programa · Agosto', 'Programa · Septiembre']);
  });

  it('programa de 1 mes → 1 cuota', () => {
    const items = buildProgramSchedule(
      programInput({ startMonth: 5, endMonth: 5, enrollmentDate: '2026-05-01' }),
    );
    const cuotas = items.filter((i) => i.type === 'PENSION');
    expect(cuotas).toHaveLength(1);
    expect(cuotas[0]!.concept).toBe('Programa · Mayo');
  });
});

describe('buildProgramSchedule — prorrateo por día de corte', () => {
  it('inscripción a mitad de vigencia: día <= corte incluye el mes', () => {
    // Vigencia ago..dic, inscrito 2026-08-17, corte 20 → agosto SÍ (5 cuotas).
    const items = buildProgramSchedule(
      programInput({ startMonth: 8, endMonth: 12, enrollmentDate: '2026-08-17', cutoffDay: 20 }),
    );
    const cuotas = items.filter((i) => i.type === 'PENSION');
    expect(cuotas).toHaveLength(5);
    expect(cuotas[0]!.concept).toBe('Programa · Agosto');
  });

  it('inscripción a mitad de vigencia: día > corte NO incluye el mes', () => {
    // Inscrito 2026-08-21, corte 20 → agosto NO (4 cuotas, desde septiembre).
    const items = buildProgramSchedule(
      programInput({ startMonth: 8, endMonth: 12, enrollmentDate: '2026-08-21', cutoffDay: 20 }),
    );
    const cuotas = items.filter((i) => i.type === 'PENSION');
    expect(cuotas).toHaveLength(4);
    expect(cuotas[0]!.concept).toBe('Programa · Septiembre');
    expect(cuotas.map((c) => c.sequence)).toEqual([1, 2, 3, 4]);
  });
});

describe('buildProgramSchedule — matrícula del programa', () => {
  it('con enrollmentFee > 0 agrega la matrícula (seq 0) que vence en la fecha de inscripción', () => {
    const items = buildProgramSchedule(
      programInput({ enrollmentFeeCents: 10000, enrollmentDate: '2026-03-05' }),
    );
    const matricula = items[0]!;
    expect(matricula.type).toBe('MATRICULA');
    expect(matricula.sequence).toBe(0);
    expect(matricula.concept).toBe('Matrícula del programa');
    expect(matricula.dueDate).toBe('2026-03-05');
    expect(matricula.totalCents).toBe(10000);
    expect(items.filter((i) => i.type === 'PENSION')).toHaveLength(10);
  });

  it('sin enrollmentFee no hay matrícula', () => {
    const items = buildProgramSchedule(programInput({ enrollmentFeeCents: 0 }));
    expect(items.every((i) => i.type === 'PENSION')).toBe(true);
  });
});

describe('buildProgramSchedule — vigencia ya finalizada', () => {
  it('todos los meses pasados y sin matrícula → cronograma vacío', () => {
    // Vigencia ago..sep, inscrito en diciembre → ningún mes cobrable.
    const items = buildProgramSchedule(
      programInput({ startMonth: 8, endMonth: 9, enrollmentDate: '2026-12-01' }),
    );
    expect(items).toHaveLength(0);
  });

  it('todos los meses pasados pero con matrícula → solo la matrícula (sin cuotas)', () => {
    const items = buildProgramSchedule(
      programInput({
        startMonth: 8,
        endMonth: 9,
        enrollmentDate: '2026-12-01',
        enrollmentFeeCents: 10000,
      }),
    );
    expect(items).toHaveLength(1);
    expect(items[0]!.type).toBe('MATRICULA');
    expect(items.filter((i) => i.type === 'PENSION')).toHaveLength(0);
  });
});

describe('buildProgramSchedule — suma total', () => {
  it('Σ totalCents == matrícula + Σ(cuota mensual)', () => {
    const items = buildProgramSchedule(
      programInput({ startMonth: 8, endMonth: 12, enrollmentFeeCents: 10000 }),
    );
    const total = items.reduce((sum, i) => sum + i.totalCents, 0);
    expect(total).toBe(10000 + 5 * 8000); // matrícula + 5 cuotas
  });

  it('los vencimientos respetan dueDayOfMonth', () => {
    const items = buildProgramSchedule(programInput({ dueDayOfMonth: 5 }));
    const marzo = items.find((i) => i.concept === 'Programa · Marzo')!;
    expect(marzo.dueDate).toBe('2026-03-05');
  });
});
