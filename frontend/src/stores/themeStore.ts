import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeColor } from '../types';

interface ThemeState {
  // State
  theme: ThemeColor;

  // Actions
  setTheme: (theme: ThemeColor) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      // Default theme is orange
      theme: 'orange',

      // Set theme and apply to document
      setTheme: (theme: ThemeColor) => {
        // Apply theme to document
        if (theme === 'orange') {
          document.documentElement.removeAttribute('data-theme');
        } else {
          document.documentElement.setAttribute('data-theme', theme);
        }
        set({ theme });
      },
    }),
    {
      name: 'habit-pulse-theme', // localStorage key
      onRehydrateStorage: () => (state) => {
        // Apply theme on app load
        if (state?.theme && state.theme !== 'orange') {
          document.documentElement.setAttribute('data-theme', state.theme);
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
