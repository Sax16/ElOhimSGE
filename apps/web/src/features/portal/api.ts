// Hooks TanStack Query del Portal del apoderado (solo lectura).
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type {
  PortalAnnouncementsResponse,
  PortalAttendanceResponse,
  PortalCalendarResponse,
  PortalConductResponse,
  PortalGradesResponse,
  PortalInstallmentsResponse,
  PortalMe,
  PortalScheduleResponse,
  PortalSummary,
} from './types';

export const portalKeys = {
  me: ['portal', 'me'] as const,
  summary: (id: string) => ['portal', 'summary', id] as const,
  installments: (id: string) => ['portal', 'installments', id] as const,
  attendance: (id: string, month: string) => ['portal', 'attendance', id, month] as const,
  schedule: (id: string) => ['portal', 'schedule', id] as const,
  grades: (id: string) => ['portal', 'grades', id] as const,
  conduct: (id: string) => ['portal', 'conduct', id] as const,
  announcements: ['portal', 'announcements'] as const,
  calendar: (month: string) => ['portal', 'calendar', month] as const,
};

/** Apoderado autenticado + sus hijos con matrícula vigente. */
export function usePortalMe() {
  return useQuery<PortalMe>({
    queryKey: portalKeys.me,
    queryFn: () => apiFetch<PortalMe>('/portal/me'),
    staleTime: 5 * 60_000,
  });
}

export function usePortalSummary(enrollmentId: string | undefined) {
  return useQuery<PortalSummary>({
    queryKey: portalKeys.summary(enrollmentId ?? ''),
    queryFn: () => apiFetch<PortalSummary>(`/portal/students/${enrollmentId}/summary`),
    enabled: !!enrollmentId,
  });
}

export function usePortalInstallments(enrollmentId: string | undefined) {
  return useQuery<PortalInstallmentsResponse>({
    queryKey: portalKeys.installments(enrollmentId ?? ''),
    queryFn: () =>
      apiFetch<PortalInstallmentsResponse>(`/portal/students/${enrollmentId}/installments`),
    enabled: !!enrollmentId,
  });
}

export function usePortalAttendance(enrollmentId: string | undefined, month: string) {
  return useQuery<PortalAttendanceResponse>({
    queryKey: portalKeys.attendance(enrollmentId ?? '', month),
    queryFn: () =>
      apiFetch<PortalAttendanceResponse>(
        `/portal/students/${enrollmentId}/attendance?month=${month}`,
      ),
    enabled: !!enrollmentId,
    placeholderData: (prev) => prev,
  });
}

export function usePortalSchedule(enrollmentId: string | undefined) {
  return useQuery<PortalScheduleResponse>({
    queryKey: portalKeys.schedule(enrollmentId ?? ''),
    queryFn: () => apiFetch<PortalScheduleResponse>(`/portal/students/${enrollmentId}/schedule`),
    enabled: !!enrollmentId,
  });
}

export function usePortalGrades(enrollmentId: string | undefined) {
  return useQuery<PortalGradesResponse>({
    queryKey: portalKeys.grades(enrollmentId ?? ''),
    queryFn: () => apiFetch<PortalGradesResponse>(`/portal/students/${enrollmentId}/grades`),
    enabled: !!enrollmentId,
  });
}

export function usePortalConduct(enrollmentId: string | undefined) {
  return useQuery<PortalConductResponse>({
    queryKey: portalKeys.conduct(enrollmentId ?? ''),
    queryFn: () => apiFetch<PortalConductResponse>(`/portal/students/${enrollmentId}/conduct`),
    enabled: !!enrollmentId,
  });
}

export function usePortalAnnouncements() {
  return useQuery<PortalAnnouncementsResponse>({
    queryKey: portalKeys.announcements,
    queryFn: () => apiFetch<PortalAnnouncementsResponse>('/portal/announcements'),
  });
}

export function usePortalCalendar(month: string) {
  return useQuery<PortalCalendarResponse>({
    queryKey: portalKeys.calendar(month),
    queryFn: () => apiFetch<PortalCalendarResponse>(`/portal/calendar?month=${month}`),
    placeholderData: (prev) => prev,
  });
}
