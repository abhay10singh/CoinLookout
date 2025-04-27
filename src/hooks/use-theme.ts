'use client';

import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'coinlookout-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light');

  // Function to apply the theme class to the document element
  const applyTheme = useCallback((selectedTheme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(selectedTheme);
  }, []);

  // Effect to read the theme from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
    setThemeState(initialTheme);
    applyTheme(initialTheme);
  }, [applyTheme]);

  // Function to update the theme state and localStorage
  const setTheme = useCallback(
    (newTheme: Theme) => {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
      applyTheme(newTheme);
    },
    [applyTheme]
  );

  return { theme, setTheme };
}
