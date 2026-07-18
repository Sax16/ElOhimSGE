// DTOs de Conducta e incidencias (R4 · Etapa 3), según el contrato de la API.
// Los enums viven en @elohim/shared (espejo de Prisma); aquí solo los shapes
// de respuesta.

export type { ConductSeverity, ConductStatus } from '@elohim/shared';
import type { ConductSeverity, ConductStatus } from '@elohim/shared';

/** Estudiante embebido en cada incidencia del listado. */
export interface IncidentStudent {
  code: string; // "E-1042"
  fullName: string; // "Hugo Vela Soto"
  sectionLabel: string; // "6° A · Primaria"
}

/** Fila del listado — GET /conduct. */
export interface Incident {
  id: string;
  code: string; // "I-0032"
  occurredAt: string; // ISO
  summary: string;
  severity: ConductSeverity;
  status: ConductStatus;
  citationAt: string | null; // ISO
  notifiedAt: string | null; // ISO
  student: IncidentStudent;
  registeredByName: string;
  guardianName: string | null;
  guardianPhone: string | null;
}

/** Detalle — GET /conduct/:id (extiende Incident). */
export interface IncidentDetail extends Incident {
  description: string;
  measure: string | null;
  closedAt: string | null;
  canceledAt: string | null;
  cancelReason: string | null;
}

export interface ConductStats {
  month: number;
  monthLabel: string; // "Julio"
  graves: number;
  open: number;
  citationsThisWeek: number;
}

export interface ConductListResponse {
  stats: ConductStats;
  incidents: Incident[];
}

// ---- Buscador de estudiantes (dialog) --------------------------------------
export interface ConductStudentOption {
  enrollmentId: string;
  studentCode: string; // "E-1042"
  fullName: string; // "Hugo Vela Soto"
  sectionLabel: string; // "6° A · Primaria"
}

export interface ConductStudentsResponse {
  students: ConductStudentOption[];
}

// ---- Crear incidencia ------------------------------------------------------
export interface CreateIncidentBody {
  enrollmentId: string;
  severity: ConductSeverity;
  occurredAt: string; // ISO
  summary: string;
  description: string;
  measure?: string;
  citationAt?: string; // ISO — obligatoria si GRAVE
}

// ---- Anular (solo Admin) ---------------------------------------------------
export interface CancelIncidentBody {
  reason: string; // ≥ 10 caracteres
}

// ---- Filtros del listado ---------------------------------------------------
export interface ConductFilters {
  search?: string;
  severity?: ConductSeverity;
  status?: ConductStatus;
}
