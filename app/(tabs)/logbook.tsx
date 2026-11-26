import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { EmptyState } from '../../src/components/EmptyState';
import { GlowCard } from '../../src/components/GlowCard';
import { CloseToHome } from '../../src/components/CloseToHome';
import { HudScreen } from '../../src/components/HudScreen';
import { useAppData } from '../../src/store/AppDataContext';
import { LogEntry } from '../../src/store/types';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';
import { fonts } from '../../src/theme/typography';

function LogEntryRow({ entry }: { entry: LogEntry }) {
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
    </GlowCard>
  );
}

export default function LogBook() {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { data, deleteLogEntry } = useAppData();

  return (
    <HudScreen scroll={false} style={styles.noPad}>
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
                <Text style={styles.logTodaySubtitle}>Aligning your actions</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.glow} style={iconGlow} />
            </GlowCard>

            <View style={styles.categoryButtons}>
              <Pressable style={styles.categoryButton} onPress={() => router.push('/logbook/aligned')}>
                <Text style={styles.categoryButtonText}>ALIGNED</Text>
                <Ionicons name="arrow-forward" size={13} color={colors.success} />
              </Pressable>
              <Pressable style={styles.categoryButton} onPress={() => router.push('/logbook/misaligned')}>
                <Text style={styles.categoryButtonText}>MISALIGNED</Text>
                <Ionicons name="arrow-forward" size={13} color={colors.glow} />
              </Pressable>
            </View>
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
          <Swipeable
            overshootRight={false}
            renderRightActions={() => (
              <Pressable
                style={styles.deleteAction}
                onPress={() => deleteLogEntry(item.id)}
                accessibilityRole="button"
                accessibilityLabel={'Delete log entry from ' + new Date(item.createdAt).toLocaleDateString()}
              >
                <Ionicons name="trash-outline" size={19} color="#ffffff" />
                <Text style={styles.deleteActionText}>DELETE</Text>
              </Pressable>
            )}
          >
            <LogEntryRow entry={item} />
          </Swipeable>
        )}
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
  categoryButtons: { flexDirection: 'row', gap: 10 },
  categoryButton: { flex: 1, minHeight: 42, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.borderDim, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoryButtonText: { fontFamily: typography.label.fontFamily, fontSize: 10, letterSpacing: 1, color: colors.textPrimary },
  empty: {
    fontFamily: typography.bodyMuted.fontFamily,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  deleteAction: {
    width: 86,
    marginLeft: 8,
    marginBottom: 2,
    borderRadius: 14,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  deleteActionText: {
    fontFamily: typography.label.fontFamily,
    fontSize: 9,
    letterSpacing: 1,
    color: '#ffffff',
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
    color: colors.glow,
  },
  entryProof: {
    fontFamily: typography.body.fontFamily,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
});
