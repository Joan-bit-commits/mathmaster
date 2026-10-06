import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  applyTheme: () => void;
}

function getSystemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => { set({ theme }); get().applyTheme(); },
      applyTheme: () => {
        const { theme } = get();
        const isDark = theme === 'dark' || (theme === 'system' && getSystemDark());
        document.documentElement.classList.toggle('dark', isDark);
      },
    }),
    { name: 'mathmaster-theme' }
  )
);
