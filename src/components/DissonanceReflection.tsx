import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { consecutiveMisalignedStreak, DISSONANCE_THRESHOLD } from '../lib/dissonance';
import { useAppData } from '../store/AppDataContext';
import { useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

/**
 * A cognitive-dissonance nudge, not a punitive one: after a run of
 * misaligned logs, quote the user's own stated goal back at them instead of
 * animating a broken streak. Confronting a gap between stated identity and
 * recent behavior is a stronger, less easily-dismissed lever than a counter
 * — and it's shown inline on the screen where the pattern is actually
 * visible, not as an interrupting modal.
 */
export function DissonanceReflection() {
  const styles = useThemedStyles(makeStyles);
  const { data } = useAppData();
  const streak = consecutiveMisalignedStreak(data.logEntries);
  const archetype = data.identity?.archetype;

  if (streak < DISSONANCE_THRESHOLD || !archetype) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>WORTH NOTICING</Text>
      <Text style={styles.body}>
        You said you wanted to become {archetype}. The last {streak} logs don't look like that.
      </Text>
    </View>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: colors.warning,
      borderRadius: 14,
      backgroundColor: 'rgba(255, 182, 72, 0.08)',
      padding: 14,
      gap: 4,
    },
    eyebrow: {
      fontFamily: typography.label.fontFamily,
      fontSize: 10,
      letterSpacing: 1.5,
      color: colors.warning,
    },
    body: {
      fontFamily: typography.body.fontFamily,
      fontSize: 14,
      lineHeight: 20,
      color: colors.textPrimary,
    },
  });
