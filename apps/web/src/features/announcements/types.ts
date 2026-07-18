// DTOs de Comunicados (R4 · Etapa 4), según el contrato de la API. Los enums
// viven en @elohim/shared (espejo de Prisma).

export { ANNOUNCEMENT_SCOPES, ANNOUNCEMENT_STATUSES } from '@elohim/shared';
export type { AnnouncementScope, AnnouncementStatus } from '@elohim/shared';
import type { AnnouncementScope, AnnouncementStatus } from '@elohim/shared';

/** Fila del listado — GET /announcements. */
export interface Announcement {
  id: string;
  code: string; // "C-0001"
  title: string;
  scope: AnnouncementScope;
  scopeLabel: string; // "3° A · Primaria", "Primaria", "Todo el colegio"…
  status: AnnouncementStatus;
  recipientsCount: number | null;
  sentAt: string | null; // ISO
  createdAt: string; // ISO
  createdByName: string;
}

export interface AnnouncementStats {
  sentMonth: number;
  monthLabel: string; // "Julio"
  drafts: number;
  lastSentAt: string | null; // ISO
}

export interface AnnouncementListResponse {
  stats: AnnouncementStats;
  announcements: Announcement[];
}

/** Detalle — GET /announcements/:id (extiende la fila). */
export interface AnnouncementDetail extends Announcement {
  body: string;
  levelId: string | null;
  gradeLevelId: string | null;
  sectionId: string | null;
}

// ---- Opciones de alcance (selectores encadenados) --------------------------
export interface AnnouncementLevel {
  id: string;
  name: string;
}
export interface AnnouncementGrade {
  id: string;
  label: string;
  levelId: string;
}
export interface AnnouncementSection {
  id: string;
  label: string;
  gradeLevelId: string;
}
export interface AnnouncementOptions {
  levels: AnnouncementLevel[];
  grades: AnnouncementGrade[];
  sections: AnnouncementSection[];
}

// ---- Destinatarios (familias del alcance) ----------------------------------
export interface AnnouncementRecipient {
  guardianId: string;
  guardianName: string;
  phone: string | null;
  students: string[]; // ["María Quispe (3° A · Primaria)"]
}
export interface AnnouncementRecipientsResponse {
  recipients: AnnouncementRecipient[];
}

// ---- Crear / editar --------------------------------------------------------
export interface CreateAnnouncementBody {
  title: string;
  body: string;
  scope: AnnouncementScope;
  levelId?: string;
  gradeLevelId?: string;
  sectionId?: string;
}

export type UpdateAnnouncementBody = CreateAnnouncementBody;

// ---- Filtros del listado ---------------------------------------------------
export interface AnnouncementFilters {
  search?: string;
  status?: AnnouncementStatus;
}
