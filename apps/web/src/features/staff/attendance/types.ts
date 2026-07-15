// DTOs de Marcación y asistencia (R3 · Etapa 2), según el contrato de la API.
// Tipos locales del feature: el módulo `staff`/`attendance` de @elohim/shared aún
// no exporta estos símbolos. El rol reutiliza `StaffRole` (misma unión del contrato).
import type { StaffRole } from '../types';

export type AttendanceStatus = 'PUNTUAL' | 'TARDANZA' | 'SIN_MARCAR' | 'FALTA' | 'LICENCIA';

/** Fila de la jornada — GET /api/attendance/day. */
export interface AttendanceRow {
  staffId: string;
  code: string;
  fullName: string;
  role: StaffRole;
  area: string | null;
  groupName: string | null;
  expectedEntryTime: string; // 'HH:mm'
  toleranceMin: number;
  entryId: string | null;
  checkIn: string | null; // 'HH:mm'
  checkOut: string | null; // 'HH:mm'
  lateMinutes: number;
  corrected: boolean;
  status: AttendanceStatus;
}

export interface AttendanceStats {
  total: number;
  presentes: number;
  tardanzas: number;
  sinMarcarOFaltas: number;
  licencias: number;
}

/** GET /api/attendance/day?date=YYYY-MM-DD. */
export interface AttendanceDay {
  date: string;
  isBusinessDay: boolean;
  rows: AttendanceRow[];
  stats: AttendanceStats;
}

// ---- Reglas ----------------------------------------------------------------
export type CountPeriod = 'MES' | 'BIMESTRE';

export interface AttendanceRuleGroup {
  id: string;
  name: string;
  entryTime: string; // 'HH:mm'
  toleranceMin: number;
  roles: StaffRole[];
  sortOrder: number;
}

export interface AttendanceSettings {
  autoDiscountEnabled: boolean;
  lateCountThreshold: number;
  discountAmount: string; // NUMERIC(10,2) serializado como string
  countPeriod: CountPeriod;
}

/** GET /api/attendance/rules. */
export interface AttendanceRules {
  groups: AttendanceRuleGroup[];
  settings: AttendanceSettings;
}

// ---- Bodies de mutación ----------------------------------------------------
export interface CheckBody {
  staffId: string;
}

export interface CorrectBody {
  staffId: string;
  date: string; // 'YYYY-MM-DD'
  checkIn?: string | null; // 'HH:mm' o null para vaciar
  checkOut?: string | null;
  reason: string;
}

export interface SaveRulesBody {
  groups: { id: string; entryTime: string; toleranceMin: number }[];
  settings: AttendanceSettings;
}
