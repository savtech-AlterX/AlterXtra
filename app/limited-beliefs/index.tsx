import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { GlowButton } from '../../src/components/GlowButton';
import { GlowCard } from '../../src/components/GlowCard';
import { HudScreen } from '../../src/components/HudScreen';
import { StackHeader } from '../../src/components/StackHeader';
import { useAppData } from '../../src/store/AppDataContext';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function LimitedBeliefsHub() {
  const { typography } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { data } = useAppData();

  return (
    <HudScreen>
      <StackHeader title="LIMITED BELIEFS" />
      <Text style={typography.label}>REWIRING LOG</Text>
      <Text style={styles.subtitle}>Review the beliefs you are rewiring, and add new ones over time.</Text>

      {data.limitedBeliefs.length === 0 && <Text style={styles.empty}>No beliefs logged yet.</Text>}

      <GlowButton
        label="ADD NEW LIMITED BELIEF"
        icon={<Ionicons name="add" size={16} color="#02141f" />}
        onPress={() => router.push('/limited-beliefs/new')}
      />

      {data.limitedBeliefs.map((lb) => (
        <GlowCard key={lb.id} style={styles.card}>
          <Text style={styles.date}>{formatDate(lb.createdAt)}</Text>
          <Text style={styles.label}>LIMITED BELIEF</Text>
          <Text style={styles.value}>{lb.belief}</Text>
          {!!lb.origin && (
            <>
              <Text style={styles.label}>ORIGIN</Text>
              <Text style={styles.value}>{lb.origin}</Text>
            </>
          )}
          <Text style={styles.label}>REPLACEMENT</Text>
          <Text style={[styles.value, styles.replacement]}>{lb.replacement}</Text>
        </GlowCard>
      ))}
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  subtitle: {
    fontFamily: typography.body.fontFamily,
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: -8,
  },
  empty: {
    fontFamily: typography.bodyMuted.fontFamily,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    gap: 4,
  },
  date: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    color: colors.glow,
    letterSpacing: 1,
    marginBottom: 4,
  },
  label: {
    fontFamily: typography.label.fontFamily,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1,
    marginTop: 6,
  },
  value: {
    fontFamily: typography.body.fontFamily,
    color: colors.textPrimary,
    fontSize: 14,
  },
  replacement: {
    color: colors.accentTeal,
    ...glowShadow,
  },
});
