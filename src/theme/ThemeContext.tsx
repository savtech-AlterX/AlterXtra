import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { DEFAULT_THEME, Palette, palettes, ThemeName } from './colors';

const THEME_KEY = 'regrown:theme:v1';
type ThemePreference = ThemeName | 'system';

type ThemeContextValue = {
  preference: ThemePreference;
  theme: ThemeName;
  colors: Palette;
  setPreference: (pref: ThemePreference) => void;
  isLoaded: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((raw) => {
        if (raw === 'light' || raw === 'dark' || raw === 'system') setPreferenceState(raw);
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, []);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    AsyncStorage.setItem(THEME_KEY, pref).catch(() => {});
  }, []);

  const theme: ThemeName =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : DEFAULT_THEME) : preference;

  const value = useMemo(
    () => ({ preference, theme, colors: palettes[theme], setPreference, isLoaded }),
    [preference, theme, setPreference, isLoaded]
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
