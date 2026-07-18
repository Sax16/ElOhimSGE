// Utilidades de Comunicados: etiquetas/tonos de alcance y estado, formato de
// fechas, normalización de teléfono y el enlace wa.me con el cuerpo del comunicado.
// Labels/tonos vienen de @elohim/shared; aquí solo la adaptación de presentación.
import type { BadgeTone } from '@elohim/ui';
import {
  ANNOUNCEMENT_SCOPES,
  ANNOUNCEMENT_SCOPE_LABELS,
  ANNOUNCEMENT_STATUSES,
  ANNOUNCEMENT_STATUS_LABELS,
  ANNOUNCEMENT_STATUS_TONES,
} from '@elohim/shared';
import type { AnnouncementScope, AnnouncementStatus } from './types';

// ---- Alcance ---------------------------------------------------------------
export const SCOPE_LABELS: Record<AnnouncementScope, string> = ANNOUNCEMENT_SCOPE_LABELS;

export const SCOPE_ORDER: AnnouncementScope[] = [...ANNOUNCEMENT_SCOPES];

// ---- Estado ----------------------------------------------------------------
export const STATUS_LABELS: Record<AnnouncementStatus, string> = ANNOUNCEMENT_STATUS_LABELS;

export const STATUS_TONE: Record<AnnouncementStatus, BadgeTone> = ANNOUNCEMENT_STATUS_TONES;

export const STATUS_ORDER: AnnouncementStatus[] = [...ANNOUNCEMENT_STATUSES];

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

/** ISO → "07/07/2026 · 14:30". */
export function dateTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${shortDate(iso)} · ${hh}:${min}`;
}

// ---- WhatsApp --------------------------------------------------------------
/** Normaliza un teléfono a los 9 dígitos peruanos (quita espacios, +51, etc.). */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.startsWith('51') && digits.length > 9 ? digits.slice(2) : digits;
}

/** Enlace wa.me con el cuerpo del comunicado prellenado (envío manual). */
export function announcementWaUrl(phone: string, body: string): string {
  const tel = normalizePhone(phone);
  return `https://wa.me/51${tel}?text=${encodeURIComponent(body)}`;
}
