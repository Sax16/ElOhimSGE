import { create } from 'zustand';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'sge_theme';

function readInitial(): Theme {
  if (typeof localStorage === 'undefined') return 'light';
  return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

function apply(theme: Theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, theme);
  }
}

// Aplica el tema al cargar el módulo para evitar el flash inicial.
const initialTheme = readInitial();
apply(initialTheme);

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  setTheme: (theme) => {
    apply(theme);
    set({ theme });
  },
}));
