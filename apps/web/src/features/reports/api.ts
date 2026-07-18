// Hooks TanStack Query de Reportes (R2 · Etapa 5). Cada reporte tiene sus filtros;
// la exportación reusa el mismo querystring y descarga el .xlsx generado en el API.
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { downloadFile } from '../../lib/download';
import type {
  CashReport,
  DelinquencyReport,
  IncomeReport,
  ReportKey,
  RosterReport,
  StudentAttendanceReport,
} from './types';

// ---- Filtros por reporte ----------------------------------------------------
export interface DelinquencyFilters {
  yearId: string | undefined;
}
export interface IncomeFilters {
  /** Año calendario (p. ej. 2026). */
  year: number;
  /** Mes 1..12, o null para «Todo el año». */
  month: number | null;
}
export interface CashFilters {
  /** yyyy-mm-dd. */
  from: string;
  /** yyyy-mm-dd. */
  to: string;
}
export interface RosterFilters {
  yearId: string | undefined;
  /** Id de nivel, o null para «Todos». */
  levelId: string | null;
}
export interface PayrollAnnualFilters {
  /** Año calendario (p. ej. 2026). */
  year: number;
}
export interface StudentAttendanceFilters {
  yearId: string | undefined;
  /** Mes 'YYYY-MM'. */
  month: string;
}

// ---- Querystrings (compartidos entre consulta y exportación) ----------------
function delinquencyQS(f: DelinquencyFilters): string {
  const p = new URLSearchParams();
  if (f.yearId) p.set('yearId', f.yearId);
  return p.toString();
}
function incomeQS(f: IncomeFilters): string {
  const p = new URLSearchParams();
  p.set('year', String(f.year));
  if (f.month != null) p.set('month', String(f.month));
  return p.toString();
}
function cashQS(f: CashFilters): string {
  const p = new URLSearchParams();
  if (f.from) p.set('from', f.from);
  if (f.to) p.set('to', f.to);
  return p.toString();
}
function rosterQS(f: RosterFilters): string {
  const p = new URLSearchParams();
  if (f.yearId) p.set('yearId', f.yearId);
  if (f.levelId) p.set('levelId', f.levelId);
  return p.toString();
}
function payrollAnnualQS(f: PayrollAnnualFilters): string {
  const p = new URLSearchParams();
  p.set('year', String(f.year));
  return p.toString();
}
function studentAttendanceQS(f: StudentAttendanceFilters): string {
  const p = new URLSearchParams();
  if (f.yearId) p.set('yearId', f.yearId);
  if (f.month) p.set('month', f.month);
  return p.toString();
}

export const reportsKeys = {
  delinquency: (f: DelinquencyFilters) => ['reports', 'delinquency', f] as const,
  income: (f: IncomeFilters) => ['reports', 'income', f] as const,
  cash: (f: CashFilters) => ['reports', 'cash', f] as const,
  roster: (f: RosterFilters) => ['reports', 'roster', f] as const,
  studentAttendance: (f: StudentAttendanceFilters) =>
    ['reports', 'studentAttendance', f] as const,
};

// ---- Consultas --------------------------------------------------------------
export function useDelinquencyReport(f: DelinquencyFilters, enabled: boolean) {
  return useQuery<DelinquencyReport>({
    queryKey: reportsKeys.delinquency(f),
    queryFn: () => apiFetch<DelinquencyReport>(`/reports/delinquency?${delinquencyQS(f)}`),
    enabled: enabled && !!f.yearId,
    placeholderData: (prev) => prev,
  });
}

export function useIncomeReport(f: IncomeFilters, enabled: boolean) {
  return useQuery<IncomeReport>({
    queryKey: reportsKeys.income(f),
    queryFn: () => apiFetch<IncomeReport>(`/reports/income?${incomeQS(f)}`),
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useCashReport(f: CashFilters, enabled: boolean) {
  return useQuery<CashReport>({
    queryKey: reportsKeys.cash(f),
    queryFn: () => apiFetch<CashReport>(`/reports/cash?${cashQS(f)}`),
    enabled: enabled && !!f.from && !!f.to,
    placeholderData: (prev) => prev,
  });
}

export function useRosterReport(f: RosterFilters, enabled: boolean) {
  return useQuery<RosterReport>({
    queryKey: reportsKeys.roster(f),
    queryFn: () => apiFetch<RosterReport>(`/reports/roster?${rosterQS(f)}`),
    enabled: enabled && !!f.yearId,
    placeholderData: (prev) => prev,
  });
}

export function useStudentAttendanceReport(f: StudentAttendanceFilters, enabled: boolean) {
  return useQuery<StudentAttendanceReport>({
    queryKey: reportsKeys.studentAttendance(f),
    queryFn: () =>
      apiFetch<StudentAttendanceReport>(`/reports/student-attendance?${studentAttendanceQS(f)}`),
    enabled: enabled && !!f.yearId && !!f.month,
    placeholderData: (prev) => prev,
  });
}

// ---- Exportación ------------------------------------------------------------
/** Descarga el .xlsx del reporte activo con los filtros aplicados. */
export function exportReport(
  key: ReportKey,
  filters:
    | DelinquencyFilters
    | IncomeFilters
    | CashFilters
    | RosterFilters
    | PayrollAnnualFilters
    | StudentAttendanceFilters,
): Promise<void> {
  // La planilla anual tiene su propia ruta (no sigue el patrón /reports/:key/export).
  if (key === 'payrollAnnual') {
    const f = filters as PayrollAnnualFilters;
    return downloadFile(`/reports/payroll-annual?${payrollAnnualQS(f)}`, `planilla-anual-${f.year}.xlsx`);
  }
  // La asistencia mensual usa una ruta con guiones (student-attendance).
  if (key === 'studentAttendance') {
    const f = filters as StudentAttendanceFilters;
    return downloadFile(
      `/reports/student-attendance/export?${studentAttendanceQS(f)}`,
      `asistencia-${f.month}.xlsx`,
    );
  }
  const qs =
    key === 'delinquency'
      ? delinquencyQS(filters as DelinquencyFilters)
      : key === 'income'
        ? incomeQS(filters as IncomeFilters)
        : key === 'cash'
          ? cashQS(filters as CashFilters)
          : rosterQS(filters as RosterFilters);
  return downloadFile(`/reports/${key}/export?${qs}`, `${key}.xlsx`);
}
