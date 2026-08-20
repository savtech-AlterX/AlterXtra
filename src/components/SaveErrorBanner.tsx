import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData } from '../store/AppDataContext';
import { useSettings } from '../store/SettingsContext';
import { useAppTheme, useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

// Sits above the Stack so it's visible no matter which screen the failed
// write happened on — a save failing silently is exactly the bug this
// exists to prevent.
export function SaveErrorBanner() {
  const { colors, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { saveError: dataSaveError, retrySave: retryData } = useAppData();
  const { saveError: settingsSaveError, retrySave: retrySettings } = useSettings();

  if (!dataSaveError && !settingsSaveError) return null;

  function retry() {
    if (dataSaveError) retryData();
    if (settingsSaveError) retrySettings();
  }

  return (
    <Pressable
      style={[styles.banner, { paddingTop: insets.top + 8 }]}
      onPress={retry}
      accessibilityRole="button"
      accessibilityLabel="Retry saving"
    >
      <Ionicons name="warning-outline" size={16} color={colors.danger} style={iconGlow} />
      <Text style={styles.text}>Couldn't save your latest changes. Tap to retry.</Text>
    </Pressable>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingBottom: 8,
      paddingHorizontal: 16,
      backgroundColor: colors.panelSolid,
      borderBottomWidth: 1,
      borderBottomColor: colors.danger,
    },
    text: {
      flex: 1,
      fontFamily: typography.bodyMuted.fontFamily,
      fontSize: 12,
      color: colors.danger,
    },
  });
