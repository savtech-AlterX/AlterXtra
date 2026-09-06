import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  // Sizing/positioning for how the card sits in its parent (width, flexBasis,
  // margin) — needed separately because it must land on the Pressable
  // wrapper, not the inner card box, or percentage widths compound.
  containerStyle?: ViewStyle;
  onPress?: () => void;
  strong?: boolean;
  // Overrides what a screen reader announces for the whole card — without
  // it, VoiceOver/TalkBack falls back to concatenating the text of every
  // child, which is usually fine (icon + title + subtitle reads sensibly)
  // but isn't always the clearest wording.
  accessibilityLabel?: string;
};

export function GlowCard({ children, style, containerStyle, onPress, strong, accessibilityLabel }: Props) {
  const styles = useThemedStyles(makeStyles);
  const card = <View style={[styles.card, strong && styles.strong, style]}>{children}</View>;

  if (!onPress) {
    return containerStyle ? <View style={containerStyle}>{card}</View> : card;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [containerStyle, pressed && styles.pressed]}
    >
      {card}
    </Pressable>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.panel,
    padding: 20,
    shadowColor: colors.glow,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  strong: {
    borderColor: colors.glowStrong,
    shadowOpacity: 0.55,
  },
  pressed: {
    opacity: 0.7,
  },
});
