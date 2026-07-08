import { create } from 'zustand';

interface YearState {
  /** Nombre del año académico seleccionado. `null` = el año activo. */
  selectedYearName: string | null;
  setSelectedYear: (name: string | null) => void;
}

export const useYearStore = create<YearState>((set) => ({
  selectedYearName: null,
  setSelectedYear: (name) => set({ selectedYearName: name }),
}));
