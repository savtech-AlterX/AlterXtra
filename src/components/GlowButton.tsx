import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme, useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';
import { fonts } from '../theme/typography';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'solid' | 'outline';
  icon?: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
  labelColor?: string;
};

export function GlowButton({ label, onPress, variant = 'solid', icon, style, disabled, labelColor }: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  if (variant === 'outline') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.outline,
          style,
          (pressed || disabled) && styles.pressed,
        ]}
      >
        <Text style={[styles.outlineLabel, labelColor ? { color: labelColor } : null]}>{label}</Text>
        {icon}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [style, (pressed || disabled) && styles.pressed]}
    >
      <LinearGradient
        colors={[colors.glow, colors.glowStrong]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.solid}
      >
        <Text style={styles.solidLabel}>{label}</Text>
        {icon}
      </LinearGradient>
    </Pressable>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  solid: {
    borderRadius: 999,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  solidLabel: {
    fontFamily: fonts.titleMedium,
    fontSize: 14,
    letterSpacing: 2,
    color: '#02141f',
  },
  outline: {
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  outlineLabel: {
    fontFamily: fonts.titleMedium,
    fontSize: 14,
    letterSpacing: 2,
    color: colors.glow,
  },
  pressed: {
    opacity: 0.7,
  },
});
