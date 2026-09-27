import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme, useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

type Props = {
  title: string;
  body: string;
};

// Stands in for a Growth-screen section (or anything else) that's moved
// behind Alter-Xtra — same card footprint as the real thing it replaces, so
// the screen doesn't visibly shrink, just makes plain what's not included yet.
export function XtraLockedCard({ title, body }: Props) {
  const { colors, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push('/alter-xtra')}
      accessibilityRole="button"
      accessibilityLabel={`${title}. Coming soon with Alter-Xtra.`}
    >
      <View style={styles.badge}>
        <Ionicons name="lock-closed" size={11} color={colors.glow} style={iconGlow} />
        <Text style={styles.badgeText}>COMING SOON &middot; ALTER-XTRA</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </Pressable>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
    card: {
      gap: 8,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderDim,
      borderStyle: 'dashed',
      backgroundColor: colors.panelSolid,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      alignSelf: 'flex-start',
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 999,
      backgroundColor: colors.glowDim,
    },
    badgeText: {
      fontFamily: typography.label.fontFamily,
      fontSize: 9,
      letterSpacing: 1,
      color: colors.glow,
    },
    title: {
      fontFamily: typography.cardTitle.fontFamily,
      fontSize: 14,
      color: colors.textSecondary,
    },
    body: {
      fontFamily: typography.bodyMuted.fontFamily,
      fontSize: 12.5,
      lineHeight: 18,
      color: colors.textMuted,
    },
  });
