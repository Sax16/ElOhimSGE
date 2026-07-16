// DTOs de Asignación docente (R4 · Etapa 1), según el contrato de la API.
// Tipos locales del feature hasta que @elohim/shared los exporte.

/** Fila de la tabla — GET /course-assignments. */
export interface CourseAssignment {
  id: string;
  teacherId: string;
  teacherName: string;
  courseId: string;
  courseName: string;
  weeklyHours: number;
  gradeLevelId: string;
  gradeLabel: string; // "3° · Primaria"
  sectionId: string;
  sectionLabel: string; // "A · Mañana"
}

export interface AssignmentsResponse {
  assignments: CourseAssignment[];
}

// ---- Opciones para el diálogo ----------------------------------------------
export interface OptionTeacher {
  id: string;
  fullName: string;
}

export interface OptionCourse {
  id: string;
  name: string;
  weeklyHours: number;
}

export interface OptionSection {
  id: string;
  label: string;
}

export interface OptionGrade {
  gradeLevelId: string;
  label: string;
  courses: OptionCourse[];
  sections: OptionSection[];
}

/** GET /course-assignments/options. */
export interface AssignmentOptions {
  teachers: OptionTeacher[];
  grades: OptionGrade[];
}

// ---- Bodies de mutación ----------------------------------------------------
export interface CreateAssignmentBody {
  courseId: string;
  sectionId: string;
  teacherId: string;
}

export interface UpdateAssignmentBody {
  teacherId: string;
}
