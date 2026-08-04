import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { iconGlow } from '../theme/typography';

/**
 * The single way out of any section: an X in the corner that returns to the
 * home screen. Used instead of a bottom tab bar.
 */
export function CloseToHome() {
  const router = useRouter();
  return (
    <Pressable
      style={styles.button}
      onPress={() => router.replace('/(tabs)')}
      accessibilityRole="button"
      accessibilityLabel="Close and return home"
      hitSlop={8}
    >
      <Ionicons name="close" size={22} color={colors.glow} style={iconGlow} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
