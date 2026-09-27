import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { useAppTheme, useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';
import { fonts } from '../theme/typography';

export function HudTextInput({ style, multiline, ...rest }: TextInputProps & { multiline?: boolean }) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      multiline={multiline}
      {...rest}
      style={[styles.input, multiline && styles.multiline, style]}
    />
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontFamily: fonts.body,
    fontSize: 16,
    backgroundColor: 'rgba(63, 169, 255, 0.06)',
  },
  multiline: {
    borderRadius: 16,
    textAlignVertical: 'top',
    minHeight: 110,
  },
});
