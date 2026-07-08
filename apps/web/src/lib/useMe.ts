import { useQuery } from '@tanstack/react-query';
import type { Permissions, UserRole } from '@elohim/shared';
import { ApiError, apiFetch } from './api';

/** Usuario autenticado (MeDto de la API). */
export interface Me {
  id: string;
  username: string;
  email: string | null;
  fullName: string;
  role: UserRole;
  permissions: Permissions;
  mustChangePassword: boolean;
}

/**
 * Sesión actual. Devuelve `null` (no lanza) cuando la API responde 401,
 * de modo que los guards puedan distinguir "no autenticado" de "cargando".
 */
export function useMe() {
  return useQuery<Me | null>({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        return await apiFetch<Me>('/auth/me');
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return null;
        throw err;
      }
    },
    retry: false,
    staleTime: 5 * 60_000,
  });
}
