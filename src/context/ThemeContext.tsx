import React, { createContext, useContext, useState, useEffect } from 'react';

export type PastelTheme = 'sakura' | 'lavender' | 'matcha' | 'peach' | 'sky' | 'butter';
export type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeConfig {
  id: PastelTheme;
  name: string;
  emoji: string;
  primaryClass: string;
  bgPastelClass: string;
  borderClass: string;
  badgeClass: string;
  gradientClass: string;
  previewHex: string;
  darkBg: string;
}

export const PASTEL_THEMES: Record<PastelTheme, ThemeConfig> = {
  sakura: {
    id: 'sakura',
    name: 'Hoa Anh Đào',
    emoji: '🌸',
    primaryClass: 'text-pink-600 dark:text-pink-400',
    bgPastelClass: 'bg-pink-50/70 dark:bg-pink-950/30',
    borderClass: 'border-pink-200 dark:border-pink-800/40',
    badgeClass: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
    gradientClass: 'from-pink-400 via-rose-400 to-pink-500',
    previewHex: '#f472b6',
    darkBg: '#1f131a',
  },
  lavender: {
    id: 'lavender',
    name: 'Hoa Oải Hương',
    emoji: '🪻',
    primaryClass: 'text-purple-600 dark:text-purple-400',
    bgPastelClass: 'bg-purple-50/70 dark:bg-purple-950/30',
    borderClass: 'border-purple-200 dark:border-purple-800/40',
    badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    gradientClass: 'from-purple-400 via-violet-400 to-indigo-400',
    previewHex: '#a855f7',
    darkBg: '#1a1426',
  },
  matcha: {
    id: 'matcha',
    name: 'Trà Xanh Matcha',
    emoji: '🍵',
    primaryClass: 'text-emerald-600 dark:text-emerald-400',
    bgPastelClass: 'bg-emerald-50/70 dark:bg-emerald-950/30',
    borderClass: 'border-emerald-200 dark:border-emerald-800/40',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    gradientClass: 'from-emerald-400 via-teal-400 to-green-500',
    previewHex: '#34d399',
    darkBg: '#122019',
  },
  peach: {
    id: 'peach',
    name: 'Đào Mọng Ngọt',
    emoji: '🍑',
    primaryClass: 'text-orange-600 dark:text-orange-400',
    bgPastelClass: 'bg-orange-50/70 dark:bg-orange-950/30',
    borderClass: 'border-orange-200 dark:border-orange-800/40',
    badgeClass: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
    gradientClass: 'from-orange-400 via-amber-400 to-rose-400',
    previewHex: '#fb923c',
    darkBg: '#211714',
  },
  sky: {
    id: 'sky',
    name: 'Mây Xanh Yên Bình',
    emoji: '☁️',
    primaryClass: 'text-sky-600 dark:text-sky-400',
    bgPastelClass: 'bg-sky-50/70 dark:bg-sky-950/30',
    borderClass: 'border-sky-200 dark:border-sky-800/40',
    badgeClass: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300',
    gradientClass: 'from-sky-400 via-cyan-400 to-blue-400',
    previewHex: '#38bdf8',
    darkBg: '#111c26',
  },
  butter: {
    id: 'butter',
    name: 'Kem Bơ Ấm Áp',
    emoji: '🧈',
    primaryClass: 'text-amber-600 dark:text-amber-400',
    bgPastelClass: 'bg-amber-50/70 dark:bg-amber-950/30',
    borderClass: 'border-amber-200 dark:border-amber-800/40',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    gradientClass: 'from-amber-300 via-yellow-400 to-orange-300',
    previewHex: '#f59e0b',
    darkBg: '#211d14',
  },
};

interface ThemeContextType {
  pastelTheme: PastelTheme;
  setPastelTheme: (theme: PastelTheme) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  themeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pastelTheme, setPastelThemeState] = useState<PastelTheme>(() => {
    return (localStorage.getItem('today_pastel_theme') as PastelTheme) || 'sakura';
  });

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('today_theme_mode') as ThemeMode) || 'system';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('today_theme_mode') as ThemeMode;
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listen to system dark mode changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (themeMode === 'system') {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  // Update dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
      setIsDark(true);
    } else {
      root.classList.remove('dark');
      setIsDark(false);
    }
  }, [themeMode]);

  const setPastelTheme = (theme: PastelTheme) => {
    setPastelThemeState(theme);
    localStorage.setItem('today_pastel_theme', theme);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('today_theme_mode', mode);
  };

  const themeConfig = PASTEL_THEMES[pastelTheme] || PASTEL_THEMES.sakura;

  return (
    <ThemeContext.Provider
      value={{
        pastelTheme,
        setPastelTheme,
        themeMode,
        setThemeMode,
        isDark,
        themeConfig,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
