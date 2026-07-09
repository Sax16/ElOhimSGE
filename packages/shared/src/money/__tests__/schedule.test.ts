import { describe, expect, it } from 'vitest';
import { buildEnrollmentSchedule, type ScheduleInput } from '../schedule';

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
    programs: [],
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

  it('100% → pensión neta 0, pero el total conserva los programas', () => {
    const items = buildEnrollmentSchedule(
      baseInput({ discountPercent: 100, programs: [{ name: 'Danza', monthlyFeeCents: 6000 }] }),
    );
    const p = items.find((i) => i.type === 'PENSION')!;
    expect(p.baseCents).toBe(28000);
    expect(p.discountCents).toBe(28000);
    expect(p.programsCents).toBe(6000);
    expect(p.totalCents).toBe(6000); // 28000 - 28000 + 6000
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

  it('traslado + programas + descuento combinados', () => {
    const items = buildEnrollmentSchedule(
      baseInput({
        discountPercent: 10,
        programs: [{ name: 'Danza', monthlyFeeCents: 6000 }],
        transfer: { entryDate: '2026-08-17', cutoffDay: 20 },
      }),
    );
    const pensiones = items.filter((i) => i.type === 'PENSION');
    expect(pensiones).toHaveLength(5);
    for (const p of pensiones) {
      expect(p.baseCents).toBe(28000);
      expect(p.discountCents).toBe(2800);
      expect(p.programsCents).toBe(6000);
      expect(p.totalCents).toBe(31200); // 28000 - 2800 + 6000
    }
  });
});

describe('buildEnrollmentSchedule — suma total', () => {
  it('Σ totalCents == matrícula + Σ(base − descuento + programas)', () => {
    const items = buildEnrollmentSchedule(
      baseInput({ discountPercent: 10, programs: [{ name: 'Danza', monthlyFeeCents: 6000 }] }),
    );
    const total = items.reduce((sum, i) => sum + i.totalCents, 0);
    const expected =
      25000 + // matrícula
      10 * (28000 - 2800 + 6000); // 10 pensiones
    expect(total).toBe(expected);
  });
});
