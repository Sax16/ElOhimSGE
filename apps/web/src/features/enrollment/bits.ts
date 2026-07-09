// Utilidades compartidas de la feature Matrícula: tonos de badge y formato de fecha.
import type { BadgeTone } from '@elohim/ui';
import type { EnrollmentStatus, EnrollmentType, InstallmentStatus } from '@elohim/shared';

export const ENROLLMENT_TYPE_TONE: Record<EnrollmentType, BadgeTone> = {
  NUEVA: 'brand',
  RATIFICADA: 'success',
  TRASLADO: 'accent',
};

export const ENROLLMENT_STATUS_TONE: Record<EnrollmentStatus, BadgeTone> = {
  COMPLETA: 'success',
  PENDIENTE_PAGO: 'warning',
  OBSERVADA: 'danger',
};

/** Tono de la cuota. PENDIENTE es warning si ya venció, neutral si es futura. */
export function installmentTone(status: InstallmentStatus, dueDate: string): BadgeTone {
  switch (status) {
    case 'PAGADO':
      return 'success';
    case 'VENCIDO':
      return 'danger';
    case 'ANULADO':
      return 'neutral';
    case 'EXONERADO':
      return 'info';
    case 'PENDIENTE':
    default:
      return new Date(dueDate).getTime() < Date.now() ? 'warning' : 'neutral';
  }
}

/**
 * "dd/mm" a partir de una fecha ISO. Toma la parte de fecha del string
 * (los vencimientos son fechas civiles yyyy-mm-dd): parsear con new Date()
 * las desplazaba un día en zonas UTC−5 (Lima).
 */
export function shortDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (m) return `${m[3]}/${m[2]}`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}
