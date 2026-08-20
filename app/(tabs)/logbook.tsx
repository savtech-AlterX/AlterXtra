import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { DissonanceReflection } from '../../src/components/DissonanceReflection';
import { EmptyState } from '../../src/components/EmptyState';
import { GlowCard } from '../../src/components/GlowCard';
import { CloseToHome } from '../../src/components/CloseToHome';
import { HudScreen } from '../../src/components/HudScreen';
import { confirmDestructive } from '../../src/lib/confirm';
import { useAppData } from '../../src/store/AppDataContext';
import { LogEntry } from '../../src/store/types';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';
import { fonts } from '../../src/theme/typography';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function StatBox({ value, label }: { value: string | number; label: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function LogEntryRow({ entry, onDelete }: { entry: LogEntry; onDelete: () => void }) {
  const { colors, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const d = new Date(entry.createdAt);
  return (
    <GlowCard style={styles.entryRow}>
      <View style={styles.entryDate}>
        <Text style={styles.entryDateNum}>{d.getDate()}</Text>
        <Text style={styles.entryDateMonth}>
          {d.toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}
        </Text>
      </View>
      <View style={styles.entryBody}>
        <Text style={[styles.entryTag, entry.aligned ? styles.tagAligned : styles.tagMisaligned]}>
          ● {entry.aligned ? 'ALIGNED' : 'MISALIGNED'}
        </Text>
        <Text style={styles.entryProof}>{entry.proof}</Text>
      </View>
      <Pressable onPress={onDelete} hitSlop={8} accessibilityRole="button" accessibilityLabel="Delete log entry">
        <Ionicons name="trash-outline" size={18} color={colors.danger} />
      </Pressable>
    </GlowCard>
  );
}

export default function LogBook() {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { data, deleteLogEntry } = useAppData();

  const { thisWeekEntries, alignedDays, missedTarget } = useMemo(() => {
    const now = Date.now();
    const weekEntries = data.logEntries.filter(
      (e) => now - new Date(e.createdAt).getTime() <= WEEK_MS
    );
    return {
      thisWeekEntries: weekEntries,
      alignedDays: weekEntries.filter((e) => e.aligned).length,
      missedTarget: weekEntries.filter((e) => !e.aligned).length,
    };
  }, [data.logEntries]);

  return (
    <HudScreen scroll={false} style={styles.noPad}>
      {/* A FlatList, not the ScrollView+map every other screen used to use —
          this is the full log, unbounded, and it needs to stay smooth once
          someone has hundreds of entries instead of only ever rendering the
          most recent 20. */}
      <FlatList
        data={data.logEntries}
        keyExtractor={(entry) => entry.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <View style={styles.titleRow}>
              <CloseToHome />
              <Text style={typography.screenTitle}>LOG BOOK</Text>
            </View>

            <GlowCard style={styles.logToday} onPress={() => router.push('/logbook/new')}>
              <View style={styles.logTodayIcon}>
                <Ionicons name="document-text-outline" size={22} color={colors.glow} style={iconGlow} />
              </View>
              <View style={styles.logTodayText}>
                <Text style={styles.logTodayTitle}>LOG TODAY</Text>
                <Text style={styles.logTodaySubtitle}>Record proof, misalignment, and corrections.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.glow} style={iconGlow} />
            </GlowCard>

            <Text style={typography.label}>THIS WEEK</Text>
            <GlowCard style={styles.statsRow}>
              <StatBox value={thisWeekEntries.length} label="ENTRIES" />
              <StatBox value={alignedDays} label="ALIGNED DAYS" />
              <StatBox value={missedTarget} label="MISSED TARGET" />
            </GlowCard>

            <DissonanceReflection />

            <Text style={typography.label}>RECENT ENTRIES</Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="clipboard-outline"
            title="NOTHING LOGGED YET"
            body="Log a day and it appears here. The weekly counts above fill in as you go."
            actionLabel="LOG TODAY"
            onAction={() => router.push('/logbook/new')}
          />
        }
        renderItem={({ item }) => (
          <LogEntryRow
            entry={item}
            onDelete={() =>
              confirmDestructive('Delete Entry', 'This log entry will be permanently deleted.', 'Delete', () =>
                deleteLogEntry(item.id)
              )
            }
          />
        )}
      />
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  // Zeroes out HudScreen's own padding/gap so the FlatList's
  // contentContainerStyle is the only thing controlling spacing.
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logToday: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logTodayIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logTodayText: {
    flex: 1,
    gap: 2,
  },
  logTodayTitle: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 16,
    color: colors.textPrimary,
    letterSpacing: 1,
    ...glowShadow,
  },
  logTodaySubtitle: {
    fontFamily: typography.bodyMuted.fontFamily,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: fonts.title,
    fontSize: 22,
    color: colors.textPrimary,
  },
  statLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 9,
    color: colors.glow,
    letterSpacing: 1,
    textAlign: 'center',
  },
  empty: {
    fontFamily: typography.bodyMuted.fontFamily,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  entryDate: {
    alignItems: 'center',
    width: 44,
  },
  entryDateNum: {
    fontFamily: fonts.title,
    fontSize: 20,
    color: colors.textPrimary,
  },
  entryDateMonth: {
    fontFamily: typography.label.fontFamily,
    fontSize: 10,
    color: colors.glow,
  },
  entryBody: {
    flex: 1,
    gap: 2,
  },
  entryTag: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    letterSpacing: 1,
  },
  tagAligned: {
    color: colors.success,
  },
  tagMisaligned: {
    color: colors.danger,
  },
  entryProof: {
    fontFamily: typography.body.fontFamily,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
});
