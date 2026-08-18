import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, ViewStyle } from 'react-native';
import { useAppData } from '../store/AppDataContext';
import { markSource, MarkExpression } from '../lib/avatar';
import { AppIconChoice } from '../store/types';
import { useThemeControls } from '../theme/ThemeContext';
import { useAppTheme, useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

// A beat of "just standing there" before the smile forms, then how long the
// crossfade itself takes — a smile that's already there when the screen
// mounts doesn't read as an expression at all, just a different drawing.
const SMILE_DELAY_MS = 500;
const SMILE_FADE_MS = 550;

type Props = {
  size?: number;
  style?: ViewStyle;
  // Override the mark shown. Defaults to whichever icon the user picked
  // during onboarding, so the choice carries through the whole app.
  icon?: AppIconChoice;
  // Defaults to neutral everywhere except the one screen that asks for
  // something else (loading, currently, which shows the charismatic smirk).
  expression?: MarkExpression;
  // Plays the neutral -> expression change as a crossfade shortly after
  // mount, instead of just showing the target expression outright.
  animated?: boolean;
};

// The identity-mark icon inside a circular glowing ring, as shown
// consistently across the reference recording (splash + home hero).
export function IdentityMarkRing({ size = 130, style, icon, expression = 'neutral', animated = false }: Props) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useAppTheme();
  const { data } = useAppData();
  const { theme } = useThemeControls();
  const resolved = icon ?? data.identity?.icon;
  const neutral = markSource(resolved, 'neutral');
  const target = markSource(resolved, expression);
  const markWidth = size * 0.46;
  const crossfade = useRef(new Animated.Value(0)).current;

  const playAnimation = animated && target.source !== neutral.source;

  useEffect(() => {
    if (!playAnimation) return;
    crossfade.setValue(0);
    const timer = setTimeout(() => {
      Animated.timing(crossfade, {
        toValue: 1,
        duration: SMILE_FADE_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }, SMILE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [playAnimation, crossfade]);

  if (!playAnimation) {
    return (
      <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }, style]}>
        <Animated.Image
          source={target.source}
          style={{ width: markWidth, height: markWidth / target.aspect, tintColor: colors.glow }}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <Animated.Image
        source={neutral.source}
        style={{
          width: markWidth,
          height: markWidth / neutral.aspect,
          tintColor: colors.glow,
          opacity: crossfade.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
        }}
        resizeMode="contain"
      />
      <Animated.Image
        source={target.source}
        style={{
          position: 'absolute',
          width: markWidth,
          height: markWidth / target.aspect,
          tintColor: colors.glow,
          opacity: crossfade,
        }}
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
