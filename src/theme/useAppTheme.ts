import { useMemo } from 'react';
import { Palette } from './colors';
import { useTheme } from './ThemeContext';
import { makeCardShadow, makeTypography } from './typography';

export type AppTheme = {
  colors: Palette;
  typography: ReturnType<typeof makeTypography>;
  cardShadow: ReturnType<typeof makeCardShadow>;
};

/** Every design token, resolved against the active theme. */
export function useAppTheme(): AppTheme {
  const colors = useTheme();
  return useMemo(
    () => ({
      colors,
      typography: makeTypography(colors),
      cardShadow: makeCardShadow(colors),
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
