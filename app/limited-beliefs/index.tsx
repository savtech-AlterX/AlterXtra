import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { GlowButton } from '../../src/components/GlowButton';
import { GlowCard } from '../../src/components/GlowCard';
import { EmptyState } from '../../src/components/EmptyState';
import { HudScreen } from '../../src/components/HudScreen';
import { StackHeader } from '../../src/components/StackHeader';
import { useAppData } from '../../src/store/AppDataContext';
import { LimitedBelief } from '../../src/store/types';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function LimitedBeliefCard({ lb }: { lb: LimitedBelief }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <GlowCard style={styles.card}>
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
  );
}

export default function LimitedBeliefsHub() {
  const { typography } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { data } = useAppData();

  return (
    <HudScreen scroll={false} style={styles.noPad}>
      {/* A FlatList so a long rewiring history stays smooth instead of every
          belief rendering into one giant ScrollView. */}
      <FlatList
        data={data.limitedBeliefs}
        keyExtractor={(lb) => lb.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <StackHeader title="LIMITED BELIEFS" />
            <Text style={typography.label}>REWIRING LOG</Text>
            <Text style={styles.subtitle}>Review the beliefs you are rewiring, and add new ones over time.</Text>

            {data.limitedBeliefs.length === 0 && (
              <EmptyState
                icon="bulb-outline"
                title="NOTHING LOGGED YET"
                body="Name a belief that holds you back and write what replaces it. Each one you rewire stays here."
              />
            )}

            <GlowButton
              label="ADD NEW LIMITED BELIEF"
              icon={<Ionicons name="add" size={16} color="#02141f" />}
              onPress={() => router.push('/limited-beliefs/new')}
            />
          </View>
        }
        renderItem={({ item }) => <LimitedBeliefCard lb={item} />}
      />
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  noPad: {
    padding: 0,
    gap: 0,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  headerBlock: {
    gap: 16,
  },
  subtitle: {
    fontFamily: typography.body.fontFamily,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
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
    lineHeight: 20,
  },
  replacement: {
    color: colors.accentTeal,
    ...glowShadow,
  },
});
