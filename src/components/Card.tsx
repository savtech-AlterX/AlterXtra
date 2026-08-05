import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
};

export function Card({ children, style, onPress }: Props) {
  const styles = useThemedStyles(makeStyles);
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, style, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

const makeStyles = ({ colors, cardShadow }: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      padding: 16,
      ...cardShadow,
    },
    pressed: { opacity: 0.9 },
  });
