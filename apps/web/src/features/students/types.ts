// DTOs de la pantalla Estudiantes, según el contrato de la API (Etapa 4).
// Los tipos calcan las respuestas/bodies que consume el front; la validación
// de dominio vive en @elohim/shared.
import type {
  EnrollmentStatus,
  EnrollmentType,
  GuardianRelation,
  InstallmentStatus,
  InstallmentType,
  InsuranceType,
  Sex,
  Shift,
  StudentStatus,
} from '@elohim/shared';

/** Ubicación del estudiante dentro de la estructura (matrícula activa). */
export interface StudentPlacement {
  levelName: string;
  gradeName: string;
  sectionName: string;
  sectionId: string;
}

/** Fila del listado — GET /api/students. */
export interface StudentListItem {
  id: string;
  code: string;
  firstNames: string;
  lastNames: string;
  dni: string;
  status: StudentStatus;
  shift: Shift | null;
  photoUrl: string | null;
  placement: StudentPlacement | null;
  debtCents: number;
  primaryGuardian: { fullName: string } | null;
}

/** Respuesta paginada del listado. */
export interface StudentsResponse {
  items: StudentListItem[];
  total: number;
  page: number;
  pageSize: number;
}

/** Autorizado a recoger al estudiante. */
export interface AuthorizedPickup {
  name: string;
  dni?: string | null;
  relation: string;
}

/** Vínculo apoderado ↔ estudiante en la ficha del estudiante. */
export interface StudentGuardianLink {
  guardian: {
    id: string;
    code: string;
    fullName: string;
    dni: string;
    phone: string;
    email: string | null;
  };
  relation: GuardianRelation;
  isPrimary: boolean;
}

/** Matrícula activa del estudiante. */
export interface StudentEnrollment {
  code: string;
  type: EnrollmentType;
  status: EnrollmentStatus;
  sectionName: string;
  gradeName: string;
  levelName: string;
  sectionId?: string;
  /** La API la expone como `year`; se acepta `yearName` por compatibilidad con el contrato. */
  year?: string;
  yearName?: string;
  /** Cuotas de la matrícula (llegan anidadas en la ficha; vacías hasta R2). */
  installments?: StudentInstallment[];
}

/** Cuota de la ficha (estructura mínima; el módulo de dinero llega en R2). */
export interface StudentInstallment {
  id: string;
  type: InstallmentType;
  status: InstallmentStatus;
  amountCents: number;
  dueDate: string;
}

/** Ficha completa — GET /api/students/:id. */
export interface StudentDetail {
  id: string;
  code: string;
  firstNames: string;
  lastNames: string;
  dni: string;
  status: StudentStatus;
  shift: Shift | null;
  photoUrl: string | null;
  birthDate: string;
  sex: Sex;
  address: string;
  previousSchool: string | null;
  allergies: string | null;
  insuranceType: InsuranceType;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  authorizedPickups: AuthorizedPickup[];
  guardians: StudentGuardianLink[];
  enrollment: StudentEnrollment | null;
  /** Cuotas a nivel de ficha (opcional; la API las anida en `enrollment`). */
  installments?: StudentInstallment[];
  /** Puede venir en la ficha; si no, se usa la deuda de la fila del listado. */
  debtCents?: number;
}

// ---- Bodies de mutación ----------------------------------------------------

export interface StudentCreateBody {
  firstNames: string;
  lastNames: string;
  dni: string;
  birthDate: string;
  sex: Sex;
  address: string;
  // Campos opcionales: null los limpia explícitamente (undefined no los toca en PATCH).
  previousSchool?: string | null;
  shift?: Shift | null;
  allergies?: string | null;
  insuranceType: InsuranceType;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  authorizedPickups: AuthorizedPickup[];
}

/** Edición parcial; el estado solo admite ACTIVO/BECADO/RESERVADO. */
export type StudentUpdateBody = Partial<StudentCreateBody> & {
  status?: Extract<StudentStatus, 'ACTIVO' | 'BECADO' | 'RESERVADO'>;
};

export interface WithdrawBody {
  type: 'RETIRO' | 'TRASLADO';
  reason: string;
  effectiveDate: string;
  destinationSchool?: string;
}

/** Filtros del listado (se serializan a query string). */
export interface StudentsFilters {
  search: string;
  levelId: string;
  gradeLevelId: string;
  sectionId: string;
  status: string;
  page: number;
  pageSize: number;
}
