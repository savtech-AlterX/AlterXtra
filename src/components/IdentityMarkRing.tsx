import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';
import { useAppData } from '../store/AppDataContext';
import { markSource, MarkExpression } from '../lib/avatar';
import { AppIconChoice } from '../store/types';
import { useThemeControls } from '../theme/ThemeContext';
import { useAppTheme, useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

type Props = {
  size?: number;
  style?: ViewStyle;
  // Override the mark shown. Defaults to whichever icon the user picked
  // during onboarding, so the choice carries through the whole app.
  icon?: AppIconChoice;
  // Defaults to neutral everywhere except the one screen that asks for
  // something else (loading, currently) — see markSource for why this is a
  // no-op until the expression art exists.
  expression?: MarkExpression;
};

// The identity-mark icon inside a circular glowing ring, as shown
// consistently across the reference recording (splash + home hero).
export function IdentityMarkRing({ size = 130, style, icon, expression = 'neutral' }: Props) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useAppTheme();
  const { data } = useAppData();
  const { theme } = useThemeControls();
  const resolved = icon ?? data.identity?.icon;
  return (
    <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <Image
        source={markSource(resolved, expression)}
        style={{ width: size * 0.46, height: size * 0.46 * (350 / 207), tintColor: colors.glow }}
        resizeMode="contain"
      />
    </View>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  ring: {
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.glow,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
});
