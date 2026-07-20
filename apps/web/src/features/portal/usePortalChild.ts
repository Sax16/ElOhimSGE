// Resuelve el hijo seleccionado a partir de /portal/me + el store de selección.
// Si la selección guardada ya no está entre los hijos vigentes (o es null),
// cae al primero. Todas las páginas del portal consumen este hook.
import { useMemo } from 'react';
import { usePortalStore } from '../../stores/portal.store';
import { usePortalMe } from './api';
import type { PortalStudent } from './types';

export interface PortalChildContext {
  isLoading: boolean;
  guardianName: string;
  secretariaPhone: string | null;
  students: PortalStudent[];
  /** Hijo seleccionado (o null si el apoderado no tiene hijos vigentes). */
  selected: PortalStudent | null;
}

export function usePortalChild(): PortalChildContext {
  const { data, isLoading } = usePortalMe();
  const selectedId = usePortalStore((s) => s.selectedEnrollmentId);

  const students = useMemo(() => data?.students ?? [], [data]);

  const selected = useMemo<PortalStudent | null>(() => {
    if (students.length === 0) return null;
    return students.find((s) => s.enrollmentId === selectedId) ?? students[0] ?? null;
  }, [students, selectedId]);

  return {
    isLoading,
    guardianName: data?.guardian.name ?? '',
    secretariaPhone: data?.secretariaPhone ?? null,
    students,
    selected,
  };
}
