import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_THEME, Palette, palettes, ThemeName } from './colors';

const THEME_KEY = 'alterx:theme:v1';

type ThemeContextValue = {
  theme: ThemeName;
  colors: Palette;
  setTheme: (name: ThemeName) => void;
  resetTheme: () => void;
  isLoaded: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(DEFAULT_THEME);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((raw) => {
        if (raw && raw in palettes) setThemeState(raw as ThemeName);
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeState(name);
    AsyncStorage.setItem(THEME_KEY, name).catch(() => {});
  }, []);

  // Theme lives under its own storage key, separate from app data — "Reset
  // All Data" needs to reach it explicitly or a previously-picked colour
  // survives the reset and the "fresh install" experience is a lie.
  const resetTheme = useCallback(() => {
    setThemeState(DEFAULT_THEME);
    AsyncStorage.setItem(THEME_KEY, DEFAULT_THEME).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ theme, colors: palettes[theme], setTheme, resetTheme, isLoaded }),
    [theme, setTheme, resetTheme, isLoaded]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** The active palette. Components read colours through this so themes apply live. */
export function useTheme(): Palette {
  const ctx = useContext(ThemeContext);
  return ctx ? ctx.colors : palettes[DEFAULT_THEME];
}

export function useThemeControls() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeControls must be used within ThemeProvider');
  return ctx;
}
