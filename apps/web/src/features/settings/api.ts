// Hooks de datos para la pantalla Configuración (institución y usuarios).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  InstitutionUpdateInput,
  Permissions,
  UserCreateInput,
  UserRole,
  UserStatus,
  UserUpdateInput,
} from '@elohim/shared';
import { apiFetch } from '../../lib/api';

/** Institución tal como la devuelve GET /api/institution. */
export interface Institution {
  id: string;
  name: string;
  modularCode: string;
  ruc: string;
  address: string;
  phone: string;
  email: string;
  region: string;
  ugel: string;
  motto: string | null;
  logoUrl: string | null;
}

/** Usuario tal como lo devuelve GET /api/users. */
export interface ApiUser {
  id: string;
  username: string;
  email: string | null;
  fullName: string;
  role: UserRole;
  /** Puede faltar en la respuesta del listado; se asume ACTIVO cuando no viene. */
  status?: UserStatus;
  permissions: Permissions;
  mustChangePassword: boolean;
}

/** Respuesta de POST /api/users: el usuario creado + la contraseña temporal (solo aquí). */
export type CreatedUser = ApiUser & { tempPassword: string };

export function useInstitution() {
  return useQuery<Institution>({
    queryKey: ['institution'],
    queryFn: () => apiFetch<Institution>('/institution'),
  });
}

export function useUpdateInstitution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: InstitutionUpdateInput) =>
      apiFetch<Institution>('/institution', { method: 'PATCH', body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['institution'] });
    },
  });
}

export function useUsers() {
  return useQuery<ApiUser[]>({
    queryKey: ['users'],
    queryFn: () => apiFetch<ApiUser[]>('/users'),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UserCreateInput) =>
      apiFetch<CreatedUser>('/users', { method: 'POST', body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UserUpdateInput }) =>
      apiFetch<ApiUser>(`/users/${id}`, { method: 'PATCH', body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useResetPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ tempPassword: string }>(`/users/${id}/reset-password`, { method: 'POST' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// ---- Planilla: parámetros y catálogo de régimen pensionario -----------------
// Tipos locales (el backend de R3·E4 va en paralelo). Montos y tasas como string
// decimal ("9.00") — nunca float; el catálogo AFP/ONP es editable solo por Admin.

/** Parámetros globales de planilla. */
export interface PayrollSettings {
  /** Tasa de EsSalud a cargo del colegio ("9.00"). */
  essaludRatePct: string;
  /** Tasa de gratificación (uso futuro). */
  gratiRatePct: string;
  /** Bonificación extraordinaria sobre la gratificación (uso futuro). */
  gratiBonusPct: string;
  /** Días de CTS por año (uso futuro). */
  ctsDaysPerYear: number;
  /** Día del mes en que se paga; null = último día del mes. */
  payDayOfMonth: number | null;
}

/** Régimen pensionario del catálogo (ONP o AFP). */
export interface PensionScheme {
  id: string;
  name: string;
  kind: 'ONP' | 'AFP';
  active: boolean;
  sortOrder: number;
  /** % de aporte ONP (solo ONP). */
  onpRatePct: string | null;
  /** % de fondo AFP (solo AFP). */
  fundRatePct: string | null;
  /** % de comisión AFP (solo AFP). */
  commissionRatePct: string | null;
  /** % de seguro AFP (solo AFP). */
  insuranceRatePct: string | null;
  /** Empleados con este régimen en su ficha. */
  staffCount: number;
}

/** Respuesta de GET /api/payroll/settings. */
export interface PayrollSettingsResponse {
  settings: PayrollSettings;
  pensionSchemes: PensionScheme[];
}

/** Body de PUT /api/payroll/settings. */
export type PayrollSettingsInput = PayrollSettings;

/** Body de PATCH /api/payroll/pension-schemes/:id (campos parciales). */
export interface PensionSchemeUpdateInput {
  onpRatePct?: string;
  fundRatePct?: string;
  commissionRatePct?: string;
  insuranceRatePct?: string;
  active?: boolean;
}

export function usePayrollSettings() {
  return useQuery<PayrollSettingsResponse>({
    queryKey: ['payroll', 'settings'],
    queryFn: () => apiFetch<PayrollSettingsResponse>('/payroll/settings'),
  });
}

export function useUpdatePayrollSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PayrollSettingsInput) =>
      apiFetch<PayrollSettings>('/payroll/settings', { method: 'PUT', body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['payroll'] });
    },
  });
}

export function useUpdatePensionScheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: PensionSchemeUpdateInput }) =>
      apiFetch<PensionScheme>(`/payroll/pension-schemes/${id}`, { method: 'PATCH', body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['payroll'] });
    },
  });
}
