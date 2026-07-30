import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export function HudTextInput(props: TextInputProps & { multiline?: boolean }) {
  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      style={[styles.input, props.multiline && styles.multiline, props.style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
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
