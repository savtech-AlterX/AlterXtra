import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { daysSinceLastActivity } from '../lib/identityVoice';
import { useAppData } from '../store/AppDataContext';
import { useAppTheme, useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

const THRESHOLD_DAYS = 2;

/**
 * Not "you lost your streak" — the archetype the user themselves chose,
 * turned around on them: "{ARCHETYPE} hasn't shown up in N days." A number
 * going to zero is easy to shrug off; being told the person you said you
 * were becoming has gone quiet reads as an identity claim you're failing to
 * back up, which is a harder thing to ignore.
 */
export function IdentityVoiceNudge() {
  const { colors, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { data } = useAppData();

  const archetype = data.identity?.archetype;
  const days = archetype ? daysSinceLastActivity(data) : null;

  if (!archetype || days === null || days < THRESHOLD_DAYS) return null;

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push('/logbook/new')}
      accessibilityRole="button"
      accessibilityLabel={`${archetype} hasn't shown up in ${days} days. Log today.`}
    >
      <Ionicons name="alert-circle-outline" size={20} color={colors.danger} style={iconGlow} />
      <View style={styles.textBlock}>
        <Text style={styles.title}>
          {archetype.toUpperCase()} HASN'T SHOWN UP IN {days} DAYS
        </Text>
        <Text style={styles.subtitle}>Log something today to keep becoming them.</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: colors.danger,
      borderRadius: 14,
      backgroundColor: 'rgba(255, 77, 94, 0.08)',
      padding: 14,
    },
    textBlock: {
      flex: 1,
      gap: 2,
    },
    title: {
      fontFamily: typography.cardTitle.fontFamily,
      fontSize: 13,
      letterSpacing: 0.5,
      color: colors.textPrimary,
    },
    subtitle: {
      fontFamily: typography.bodyMuted.fontFamily,
      fontSize: 12,
      color: colors.textSecondary,
    },
  });
