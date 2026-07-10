// DTOs de la pantalla Apoderados, según el contrato de la API (Etapa 4).
import type { GuardianRelation, NotificationChannel, StudentStatus } from '@elohim/shared';
import type { StudentPlacement } from '../students/types';

/** Fila del listado — GET /api/guardians. */
export interface GuardianListItem {
  id: string;
  code: string;
  fullName: string;
  dni: string;
  phone: string;
  email: string | null;
  notificationChannel: NotificationChannel;
  childrenCount: number;
  debtCents: number;
}

/** Respuesta paginada del listado. */
export interface GuardiansResponse {
  items: GuardianListItem[];
  total: number;
  page: number;
  pageSize: number;
}

/** Hijo vinculado en la ficha del apoderado (relación N:M). */
export interface GuardianChild {
  student: {
    id: string;
    code: string;
    firstNames: string;
    paternalLastName: string;
    maternalLastName: string | null;
    status: StudentStatus;
  };
  relation: GuardianRelation;
  isPrimary: boolean;
  placement: StudentPlacement | null;
  debtCents: number;
}

/** Ficha completa — GET /api/guardians/:id.
 *  Nota: la API no repite `childrenCount`/`debtCents` aquí — se derivan de `children`. */
export interface GuardianDetail {
  id: string;
  code: string;
  fullName: string;
  dni: string;
  phone: string;
  email: string | null;
  notificationChannel: NotificationChannel;
  address: string;
  children: GuardianChild[];
  childrenCount?: number;
  debtCents?: number;
}

/** Estado de cuenta como lo espera el filtro del listado. */
export type GuardianAccountFilter = 'todas' | 'con_deuda' | 'al_dia';

// ---- Bodies de mutación ----------------------------------------------------
export interface GuardianCreateBody {
  fullName: string;
  dni: string;
  phone: string;
  email?: string;
  address: string;
  notificationChannel: NotificationChannel;
}

export type GuardianUpdateBody = Partial<GuardianCreateBody>;
