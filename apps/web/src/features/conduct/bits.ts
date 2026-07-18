// Utilidades de Conducta e incidencias: etiquetas, tonos, formato de fechas y
// el mensaje de WhatsApp para avisar al apoderado (contacto principal).
// Labels/tonos vienen de @elohim/shared; aquí solo la adaptación de presentación.
import type { BadgeTone } from '@elohim/ui';
import {
  CONDUCT_SEVERITIES,
  CONDUCT_SEVERITY_LABELS,
  CONDUCT_SEVERITY_TONES,
  CONDUCT_STATUSES,
  CONDUCT_STATUS_LABELS,
  CONDUCT_STATUS_TONES,
} from '@elohim/shared';
import type { ConductSeverity, ConductStatus } from './types';

// ---- Gravedad --------------------------------------------------------------
export const SEVERITY_LABELS: Record<ConductSeverity, string> = CONDUCT_SEVERITY_LABELS;

export const SEVERITY_TONE: Record<ConductSeverity, BadgeTone> = CONDUCT_SEVERITY_TONES;

/** Orden fijo para selectores y leyendas. */
export const SEVERITY_ORDER: ConductSeverity[] = [...CONDUCT_SEVERITIES];

// ---- Estado ----------------------------------------------------------------
export const STATUS_LABELS: Record<ConductStatus, string> = CONDUCT_STATUS_LABELS;

export const STATUS_TONE: Record<ConductStatus, BadgeTone> = CONDUCT_STATUS_TONES;

export const STATUS_ORDER: ConductStatus[] = [...CONDUCT_STATUSES];

/** Estados finales: no admiten cerrar/avisar. */
export function isFinalStatus(status: ConductStatus): boolean {
  return status === 'CERRADA' || status === 'ANULADA';
}

// ---- Fechas ----------------------------------------------------------------
/** ISO → "07/07/2026" (fecha civil local). */
export function shortDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

/** ISO → "07/07" (día/mes, para el mensaje de WhatsApp). */
export function dayMonth(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}`;
}

/** ISO → "08:00" (hora local, 24h). */
export function timeOnly(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${min}`;
}

/** ISO → "07/07/2026 · 08:00". */
export function dateTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = shortDate(iso);
  return date ? `${date} · ${timeOnly(iso)}` : '';
}

/** ISO → "viernes 24/07 · 8:00" (para la caption de citaciones). */
export function citationCaption(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const weekday = d.toLocaleDateString('es-PE', { weekday: 'long' });
  const hh = d.getHours();
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${weekday} ${dayMonth(iso)} · ${hh}:${min}`;
}

/** Ahora en formato `datetime-local` (YYYY-MM-DDTHH:mm), sin desfase UTC. */
export function nowLocalInput(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${hh}:${min}`;
}

/** `datetime-local` (hora local) → ISO para el API. '' → undefined. */
export function localInputToIso(value: string): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

// ---- WhatsApp --------------------------------------------------------------
/** Normaliza un teléfono a los 9 dígitos peruanos (quita espacios, +51, etc.). */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.startsWith('51') && digits.length > 9 ? digits.slice(2) : digits;
}

/**
 * Enlace wa.me con el aviso de conducta prellenado (contacto principal).
 * Mensaje acordado en las decisiones de la etapa; el envío es manual. Para las
 * incidencias GRAVE añade la citación presencial (fecha y hora).
 */
export function conductWaUrl(params: {
  studentName: string;
  occurredAt: string;
  severity: ConductSeverity;
  summary: string;
  phone: string;
  citationAt?: string | null;
}): string {
  const { studentName, occurredAt, severity, summary, phone, citationAt } = params;
  const tel = normalizePhone(phone);
  let msg =
    `Estimada familia: les informamos que se registró una incidencia de ` +
    `${studentName} el ${dayMonth(occurredAt)}: ${summary}. ` +
    `Gravedad: ${SEVERITY_LABELS[severity].toLowerCase()}.`;
  if (severity === 'GRAVE' && citationAt) {
    msg +=
      ` Los esperamos en dirección el ${dayMonth(citationAt)} a las ` +
      `${timeOnly(citationAt)} para conversar al respecto.`;
  }
  return `https://wa.me/51${tel}?text=${encodeURIComponent(msg)}`;
}
