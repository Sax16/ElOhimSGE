import { create } from 'zustand';

interface PortalState {
  /** enrollmentId del hijo seleccionado; null = usar el primero disponible. */
  selectedEnrollmentId: string | null;
  setSelectedEnrollment: (enrollmentId: string | null) => void;
}

/** Selección de hijo persistente entre las páginas del portal (una sesión). */
export const usePortalStore = create<PortalState>((set) => ({
  selectedEnrollmentId: null,
  setSelectedEnrollment: (enrollmentId) => set({ selectedEnrollmentId: enrollmentId }),
}));
