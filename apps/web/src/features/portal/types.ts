// DTOs del Portal del apoderado (v1.0.0), según el contrato de la API (base /api).
// Tipos espejo locales: el back del portal aún no exporta desde @elohim/shared.
import type { StudentAttendanceStatus } from '../student-attendance/types';
import type { ConductSeverity, ConductStatus } from '../conduct/types';
import type { GradeLetter } from '@elohim/shared';

// ---- GET /portal/me --------------------------------------------------------
/** Estudiante (matrícula vigente) del apoderado autenticado. */
export interface PortalStudent {
  enrollmentId: string;
  studentCode: string;
  fullName: string;
  sectionLabel: string; // "3° A"
  levelName: string; // "Primaria"
}

export interface PortalMe {
  guardian: { name: string };
  isPrimaryOf: string[]; // códigos de estudiante donde es contacto principal
  students: PortalStudent[];
  secretariaPhone: string | null;
}

// ---- GET /portal/students/:enrollmentId/summary ----------------------------
export interface PortalNextDue {
  label: string;
  dueDate: string; // ISO date
  total: string; // decimal "250.00"
}

export interface PortalUpcomingEvent {
  date: string; // ISO date
  name: string;
  type: string; // FERIADO | ACTIVIDAD | EVALUACION | VENCIMIENTO | ...
}

export interface PortalAnnouncementRef {
  id: string;
  code: string; // "C-0004"
  title: string;
  sentAt: string; // ISO
}

export interface PortalSummary {
  debt: {
    overdueCount: number;
    overdueTotal: string; // decimal "0.00"
    nextDue: PortalNextDue | null;
  };
  attendanceMonth: {
    month: string; // "2026-07"
    P: number;
    T: number;
    F: number;
    J: number;
    pct: number | null;
  };
  conductOpen: number;
  upcomingEvents: PortalUpcomingEvent[];
  lastAnnouncements: PortalAnnouncementRef[];
}

// ---- GET /portal/students/:enrollmentId/installments -----------------------
export type InstallmentStatus =
  | 'PAGADO'
  | 'PENDIENTE'
  | 'VENCIDO'
  | 'EXONERADO'
  | 'ANULADO';

export interface PortalInstallment {
  id: string;
  label: string; // "Pensión julio"
  dueDate: string; // ISO date
  amount: string; // decimal "250.00"
  lateFee: string; // decimal "0.00"
  total: string; // decimal "250.00"
  status: InstallmentStatus;
  paidAt: string | null; // ISO
  receiptCode: string | null; // "R-2026-00042"
}

export interface PortalInstallmentsResponse {
  installments: PortalInstallment[];
}

// ---- GET /portal/students/:enrollmentId/attendance?month= ------------------
export type AttendanceLetter = 'P' | 'T' | 'F' | 'J';

export interface PortalAttendanceDay {
  date: string; // ISO date
  status: AttendanceLetter;
}

export interface PortalAttendanceResponse {
  month: string; // "2026-07"
  days: PortalAttendanceDay[];
  totals: { P: number; T: number; F: number; J: number };
  pct: number | null;
}

// ---- GET /portal/students/:enrollmentId/schedule --------------------------
export interface PortalScheduleBlock {
  id: string;
  order: number;
  startTime: string; // "07:45"
  endTime: string; // "08:30"
  isBreak: boolean;
  label: string | null;
}

export interface PortalScheduleSlot {
  dayOfWeek: number; // 1..5
  blockId: string;
  courseName: string;
  teacherName: string | null;
}

export interface PortalScheduleResponse {
  blocks: PortalScheduleBlock[];
  slots: PortalScheduleSlot[];
}

// ---- GET /portal/students/:enrollmentId/grades ----------------------------
export interface PortalGradePeriod {
  id: string;
  name: string; // "I Bimestre"
  order: number;
}

export interface PortalGradeCourse {
  courseName: string;
  byPeriod: Record<string, GradeLetter | null>; // periodId → letra
}

export interface PortalGradeAspect {
  kind: 'FORMATIVO' | 'APODERADO';
  name: string;
  byPeriod: Record<string, GradeLetter | null>;
}

export interface PortalGradesResponse {
  periods: PortalGradePeriod[]; // solo cerrados
  courses: PortalGradeCourse[];
  aspects: PortalGradeAspect[];
}

// ---- GET /portal/students/:enrollmentId/conduct ---------------------------
export interface PortalConductIncident {
  code: string; // "I-0032"
  occurredAt: string; // ISO
  summary: string;
  severity: ConductSeverity;
  status: ConductStatus;
  citationAt: string | null; // ISO
}

export interface PortalConductResponse {
  incidents: PortalConductIncident[];
}

// ---- GET /portal/announcements --------------------------------------------
export interface PortalAnnouncement {
  code: string; // "C-0004"
  title: string;
  body: string;
  scopeLabel: string; // "3° A · Primaria" | "Toda la institución"
  sentAt: string; // ISO
}

export interface PortalAnnouncementsResponse {
  announcements: PortalAnnouncement[];
}

// ---- GET /portal/calendar?month= ------------------------------------------
export interface PortalCalendarEvent {
  type: string;
  name: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
}

export interface PortalCalendarResponse {
  events: PortalCalendarEvent[];
}

// Re-export para conveniencia de las vistas.
export type { StudentAttendanceStatus };
