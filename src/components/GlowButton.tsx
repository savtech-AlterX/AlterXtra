import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useThemedStyles } from '../theme/useAppTheme';
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
  // Overrides what a screen reader announces — defaults to the visible
  // label, which is right for plain text buttons but wrong for ones whose
  // label is decorative or ambiguous without more context.
  accessibilityLabel?: string;
};

export function GlowButton({
  label,
  onPress,
  variant = 'solid',
  icon,
  style,
  disabled,
  labelColor,
  accessibilityLabel,
}: Props) {
  const styles = useThemedStyles(makeStyles);
  if (variant === 'outline') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled: !!disabled }}
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
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [styles.solidWrap, style, (pressed || disabled) && styles.pressed]}
    >
      <View style={styles.solid}>
        <Text style={styles.solidLabel}>{label}</Text>
        {icon}
      </View>
    </Pressable>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  // The outer glow lives on this wrapper, not the gradient — a shadow on the
  // same layer as the gradient's own borderRadius clips unpredictably on
  // iOS, so the halo needs its own unclipped box around it.
  solidWrap: {
    borderRadius: 999,
    shadowColor: colors.glow,
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  solid: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.glowStrong,
    backgroundColor: colors.glow,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  // White instead of the old near-black label — reads as a neon tube lit up
  // against the electric-blue fill, rather than printed text sitting on it.
  solidLabel: {
    fontFamily: fonts.titleMedium,
    fontSize: 14,
    letterSpacing: 2,
    color: '#ffffff',
    textShadowColor: '#ffffff',
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 0 },
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
