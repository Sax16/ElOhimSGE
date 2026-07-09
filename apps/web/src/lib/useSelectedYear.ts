// Resuelve el año académico vigente para las pantallas anuales (Etapa 5).
// Mismo criterio que Estudiantes/Estructura: el selector del shell manda; si no,
// el año ACTIVO. Un año CERRADO es solo lectura (bloqueo también a nivel API).
import { useYearStore } from '../stores/year.store';
import { useYears } from '../features/structure/api';
import type { ApiYear } from '../features/structure/types';

export interface SelectedYear {
  year: ApiYear | null;
  yearId: string | undefined;
  yearName: string;
  readOnly: boolean;
  isLoading: boolean;
}

export function useSelectedYear(): SelectedYear {
  const selectedYearName = useYearStore((s) => s.selectedYearName);
  const { data, isLoading } = useYears();
  const years = data ?? [];
  const activeYear = years.find((y) => y.status === 'ACTIVO') ?? null;
  const currentName = selectedYearName ?? activeYear?.name ?? '';
  const year = years.find((y) => y.name === currentName) ?? activeYear ?? years[0] ?? null;
  return {
    year,
    yearId: year?.id,
    yearName: year?.name ?? '',
    readOnly: year?.status === 'CERRADO',
    isLoading,
  };
}
