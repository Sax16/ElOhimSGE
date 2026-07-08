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
