// DTOs del Dashboard mínimo R1 — GET /api/dashboard/summary.
import type { EnrollmentType } from '@elohim/shared';

export interface DashboardSummary {
  yearName: string;
  students: { active: number };
  enrollments: {
    total: number;
    byType: Record<EnrollmentType, number>;
    today: number;
    week: number;
  };
  vacancies: { capacity: number; enrolled: number; free: number };
  byLevel: { levelName: string; enrolled: number; capacity: number }[];
}
