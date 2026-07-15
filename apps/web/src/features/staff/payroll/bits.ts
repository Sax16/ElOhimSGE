// Utilidades de la pestaña Planilla: etiquetas, tonos, formatos y periodos.
import type { BadgeTone } from '@elohim/ui';
import { formatPEN, toCents } from '@elohim/shared';
import type { PayrollItemKind, PayrollMethod, PayrollSchemeKind } from './types';

// ---- Meses -----------------------------------------------------------------
export const MONTH_NAMES = [
  '',
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
];

/** Nombre del mes (1..12). */
export function monthName(m: number): string {
  return MONTH_NAMES[m] ?? '';
}

/** "Julio 2026". */
export function periodLabel(year: number, month: number): string {
  return `${monthName(month)} ${year}`;
}

/**
 * Opciones del selector de periodo: meses del año en curso desde el actual hacia
 * atrás hasta Enero. Value = "year-month" (p. ej. "2026-7").
 */
export function periodOptions(today = new Date()): { value: string; label: string }[] {
  const year = today.getFullYear();
  const current = today.getMonth() + 1;
  const opts: { value: string; label: string }[] = [];
  for (let m = current; m >= 1; m -= 1) {
    opts.push({ value: `${year}-${m}`, label: periodLabel(year, m) });
  }
  return opts;
}

/** Descompone "year-month" del selector. */
export function parsePeriod(value: string): { year: number; month: number } {
  const [y, m] = value.split('-');
  return { year: Number(y), month: Number(m) };
}

// ---- Ítems de descuento ----------------------------------------------------
/** Etiqueta completa del tipo de descuento (usada en el selector de alta manual). */
export const ITEM_KIND_LABELS: Record<PayrollItemKind, string> = {
  AUTO_TARDANZAS: 'Tardanzas',
  ADELANTO: 'Adelanto de sueldo',
  DANO_PERDIDA: 'Daño o pérdida',
  INASISTENCIA: 'Inasistencia injustificada',
  OTRO: 'Otro',
};

/** Tipos que el usuario puede agregar a mano (excluye el automático de tardanzas). */
export const MANUAL_ITEM_KINDS: PayrollItemKind[] = [
  'ADELANTO',
  'DANO_PERDIDA',
  'INASISTENCIA',
  'OTRO',
];

/** Etiqueta corta para el badge "Manual · <corto>". */
const ITEM_KIND_SHORT: Record<PayrollItemKind, string> = {
  AUTO_TARDANZAS: 'tardanzas',
  ADELANTO: 'adelanto',
  DANO_PERDIDA: 'daño o pérdida',
  INASISTENCIA: 'inasistencia',
  OTRO: 'otro',
};

/** Texto del badge de un ítem: "Auto · tardanzas" | "Manual · adelanto". */
export function itemBadgeText(kind: PayrollItemKind, auto: boolean): string {
  return `${auto ? 'Auto' : 'Manual'} · ${ITEM_KIND_SHORT[kind]}`;
}

/** Tono del badge de un ítem: automático brand, manual neutral. */
export function itemBadgeTone(auto: boolean): BadgeTone {
  return auto ? 'brand' : 'neutral';
}

// ---- Régimen pensionario ---------------------------------------------------
/** Tono del badge de régimen: ONP neutral, AFP brand (spec del prototipo). */
export function schemeTone(kind: PayrollSchemeKind): BadgeTone {
  return kind === 'AFP' ? 'brand' : 'neutral';
}

// ---- Método de pago --------------------------------------------------------
/** Métodos ofrecidos para pagar planilla (orden del prototipo: transferencia primero). */
export const PAYROLL_METHODS: PayrollMethod[] = ['TRANSFERENCIA', 'EFECTIVO', 'YAPE_PLIN'];

// ---- Formatos --------------------------------------------------------------
/** String NUMERIC → "S/ 1,234.00". */
export function pen(amount: string): string {
  return formatPEN(toCents(amount));
}

/** ¿El string decimal es > 0? (para decidir si hay descuentos/aportes). */
export function isPositive(amount: string): boolean {
  return toCents(amount) > 0;
}

/** ISO datetime → "dd/mm/aaaa · hh:mm" en hora local. */
export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const date = d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
}
