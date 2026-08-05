import { useMemo } from 'react';
import { Palette } from './colors';
import { useTheme } from './ThemeContext';
import { makeGlowShadow, makeIconGlow, makeTypography } from './typography';

export type AppTheme = {
  colors: Palette;
  typography: ReturnType<typeof makeTypography>;
  glowShadow: ReturnType<typeof makeGlowShadow>;
  iconGlow: ReturnType<typeof makeIconGlow>;
};

/** Every design token, resolved against the active theme. */
export function useAppTheme(): AppTheme {
  const colors = useTheme();
  return useMemo(
    () => ({
      colors,
      typography: makeTypography(colors),
      glowShadow: makeGlowShadow(colors),
      iconGlow: makeIconGlow(colors),
    }),
    [colors]
  );
}

/**
 * Build a StyleSheet from the active theme. `factory` must be defined at module
 * scope so its identity is stable and the sheet is only rebuilt on theme change.
 */
export function useThemedStyles<T>(factory: (theme: AppTheme) => T): T {
  const theme = useAppTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}
