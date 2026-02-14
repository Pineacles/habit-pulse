import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeColor, ThemeMode } from '../types';



function applyThemeAttribute(theme: ThemeColor): void {
  if (theme === 'orange') {
    document.documentElement.removeAttribute('data-theme');
    return;
  }

  document.documentElement.setAttribute('data-theme', theme);
}

function resolveMode(mode: ThemeMode): 'dark' | 'light' {
  if (mode === 'system') {
    // Migration for existing users: check system preference once, then stick to it
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark'; // Fallback
  }
  return mode;
}

function applyModeAttribute(mode: ThemeMode): void {
  const effectiveMode = resolveMode(mode);
  if (effectiveMode === 'light') {
    document.documentElement.setAttribute('data-mode', 'light');
    return;
  }

  document.documentElement.removeAttribute('data-mode');
}



interface ThemeState {
  // State
  theme: ThemeColor;
  mode: ThemeMode;

  // Actions
  setTheme: (theme: ThemeColor) => void;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      // Default theme is orange
      theme: 'orange',
      mode: 'system',

      // Set theme and apply to document
      setTheme: (theme: ThemeColor) => {
        applyThemeAttribute(theme);
        set({ theme });
      },
      setMode: (mode: ThemeMode) => {
        applyModeAttribute(mode);
        set({ mode });
      },
    }),
    {
      name: 'habit-pulse-theme', // localStorage key
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }

        // Apply theme + mode on app load
        applyThemeAttribute(state.theme ?? 'orange');
        applyModeAttribute(state.mode ?? 'system');

        // Migrate 'system' to explicit preference on load
        if (state.mode === 'system') {
          const resolved = resolveMode('system');
          state.setMode(resolved);
        } else {
          applyModeAttribute(state.mode ?? 'light');
        }
      },
    }
  )
);

// Theme options for the settings page
export const THEME_OPTIONS: { value: ThemeColor; label: string; color: string }[] = [
  { value: 'orange', label: 'Orange', color: '#f97316' },
  { value: 'teal', label: 'Teal', color: '#14b8a6' },
  { value: 'purple', label: 'Purple', color: '#a855f7' },
  { value: 'blue', label: 'Blue', color: '#3b82f6' },
  { value: 'rose', label: 'Rose', color: '#f43f5e' },
  { value: 'emerald', label: 'Emerald', color: '#10b981' },
];

export const MODE_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
];
