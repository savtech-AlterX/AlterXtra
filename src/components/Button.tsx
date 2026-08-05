import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({ label, onPress, variant = 'primary', disabled, loading, fullWidth = true }: Props) {
  const styles = useThemedStyles(makeStyles);
  const isDisabled = disabled || loading;
  const usesOnPrimary = variant === 'primary' || variant === 'danger';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator color={usesOnPrimary ? styles.onPrimaryColor.color : styles.primaryColor.color} />
      ) : (
        <Text
          style={[
            styles.label,
            usesOnPrimary ? styles.onPrimaryColor : styles.primaryColor,
            variant === 'ghost' && styles.ghostLabel,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
    base: {
      minHeight: 50,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      flexDirection: 'row',
    },
    fullWidth: { alignSelf: 'stretch' },
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: colors.danger },
    disabled: { opacity: 0.5 },
    pressed: { opacity: 0.85 },
    label: { ...typography.buttonLabel, textAlign: 'center' },
    onPrimaryColor: { color: colors.onPrimary },
    primaryColor: { color: colors.textPrimary },
    ghostLabel: { color: colors.primary },
  });
