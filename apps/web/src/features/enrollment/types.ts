// DTOs de la pantalla Matrícula (Etapa 5), según el contrato de la API.
// Montos de cuota viajan como centavos (…Cents) y como string decimal (…Amount).
import type {
  EnrollmentStatus,
  EnrollmentType,
  InstallmentStatus,
  InstallmentType,
  InsuranceType,
  Sex,
} from '@elohim/shared';

/** Ubicación de la matrícula dentro de la estructura. */
export interface EnrollmentPlacement {
  levelName: string;
  gradeName: string;
  sectionName: string;
}

/** Fila del listado — GET /api/enrollments. */
export interface EnrollmentListItem {
  id: string;
  code: string;
  student: { id: string; code: string; firstNames: string; lastNames: string };
  placement: EnrollmentPlacement;
  type: EnrollmentType;
  status: EnrollmentStatus;
  enrolledAt: string;
  discount: { name: string; percent: string } | null;
  canceled: boolean;
}

export interface EnrollmentsResponse {
  items: EnrollmentListItem[];
  total: number;
  page: number;
  pageSize: number;
}

/** KPIs del listado — GET /api/enrollments/stats. */
export interface EnrollmentStats {
  total: number;
  byType: Record<EnrollmentType, number>;
  byStatus: Record<EnrollmentStatus, number>;
  vacancies: { capacity: number; enrolled: number; free: number };
  today: number;
}

/** Cuota del cronograma (detalle y preview). */
export interface EnrollmentInstallment {
  id?: string;
  type: InstallmentType;
  concept: string;
  sequence: number;
  dueDate: string;
  baseAmount: string;
  discountAmount: string;
  programsAmount: string;
  amount: string;
  status?: InstallmentStatus;
}

/** Detalle — GET /api/enrollments/:id. */
export interface EnrollmentDetail {
  id: string;
  code: string;
  student: { id: string; code: string; firstNames: string; lastNames: string };
  placement: EnrollmentPlacement;
  type: EnrollmentType;
  status: EnrollmentStatus;
  enrolledAt: string;
  canceled: boolean;
  signingGuardian?: { id: string; fullName: string } | null;
  registeredBy?: string | null;
  discount?: { name: string; percent: string } | null;
  installments: EnrollmentInstallment[];
  programs: { id: string; name: string }[];
}

// ---- Preview / creación ----------------------------------------------------

/** Datos de un estudiante nuevo (matrícula NUEVA / TRASLADO). */
export interface NewStudentInput {
  firstNames: string;
  lastNames: string;
  dni: string;
  birthDate: string;
  sex: Sex;
  address: string;
  previousSchool?: string;
  insuranceType: InsuranceType;
}

export interface TransferInput {
  originSchool: string;
  siagieCode: string;
  entryDate: string;
}

/** Cuerpo del asistente — POST /api/enrollment/preview y POST /api/enrollments. */
export interface EnrollmentWizardBody {
  academicYearId: string;
  sectionId: string;
  type: EnrollmentType;
  studentId?: string;
  newStudent?: NewStudentInput;
  signingGuardianId: string;
  discountId?: string;
  programIds: string[];
  transfer?: TransferInput;
}

/** Fila del cronograma calculado — POST /api/enrollment/preview. */
export interface PreviewItem {
  type: InstallmentType;
  concept: string;
  sequence: number;
  dueDate: string;
  baseCents: number;
  discountCents: number;
  programsCents: number;
  totalCents: number;
  baseAmount: string;
  discountAmount: string;
  programsAmount: string;
  amount: string;
}

/** Cuota de un cronograma de programa dentro del preview. */
export interface ProgramScheduleItem {
  concept: string;
  dueDate: string;
  totalCents: number;
  sequence?: number;
  type?: string;
}

/** Cronograma independiente de un programa elegido en la matrícula. */
export interface ProgramSchedule {
  programId: string;
  name: string;
  items: ProgramScheduleItem[];
  totalCents: number;
}

export interface PreviewResponse {
  items: PreviewItem[];
  totalCents: number;
  total: string;
  discount: { id: string; name: string; percent: string; auto: boolean } | null;
  warnings: string[];
  /** Cronogramas por programa (backend nuevo). Ausente con backend anterior. */
  programSchedules?: ProgramSchedule[];
}

/** Resultado de POST /api/enrollments. */
export interface CreateEnrollmentResult {
  enrollment: { id: string; code: string };
  schedule: PreviewItem[];
  total: string;
}

/** Filtros del listado (se serializan a query string). */
export interface EnrollmentsFilters {
  yearId: string;
  search: string;
  status: string;
  type: string;
  page: number;
  pageSize: number;
}
