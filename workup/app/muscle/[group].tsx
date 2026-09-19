import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { EntryCard } from '../../src/components/EntryCard';
import { TrendChart } from '../../src/components/TrendChart';
import { MUSCLE_GROUP_LABELS, isMuscleGroup } from '../../src/constants/muscleGroups';
import { useWorkupData } from '../../src/data/WorkupDataContext';
import { colors } from '../../src/theme/colors';
import { computeWeeklyStreak } from '../../src/utils/streaks';

export default function MuscleGroupScreen() {
  const { group } = useLocalSearchParams<{ group: string }>();
  const router = useRouter();
  const { getEntriesForGroup } = useWorkupData();

  if (!group || !isMuscleGroup(group)) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Unknown muscle group</Text>
      </View>
    );
  }

  const entries = getEntriesForGroup(group);
  const label = MUSCLE_GROUP_LABELS[group];
  const streak = computeWeeklyStreak(entries);
  const chronological = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: label }} />

      {streak > 0 && (
        <Text style={styles.streak}>
          🔥 {streak} week{streak === 1 ? '' : 's'} streak
        </Text>
      )}

      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.actionButton, styles.actionPrimary]}
          onPress={() => router.push(`/camera/${group}`)}
        >
          <Text style={styles.actionPrimaryText}>Take Photo</Text>
        </Pressable>
      </View>
      <View style={styles.actionsRow}>
        <Pressable
          style={styles.actionButton}
          onPress={() => router.push(`/compare/${group}`)}
          disabled={entries.length < 2}
        >
          <Text style={[styles.actionText, entries.length < 2 && styles.actionTextDisabled]}>Compare</Text>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => router.push(`/timelapse/${group}`)}
          disabled={entries.length < 2}
        >
          <Text style={[styles.actionText, entries.length < 2 && styles.actionTextDisabled]}>Timelapse</Text>
        </Pressable>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(entry) => entry.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<TrendChart entries={chronological} />}
        renderItem={({ item }) => <EntryCard entry={item} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No photos yet. Take your first one to start tracking {label.toLowerCase()}.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  streak: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionPrimary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  actionPrimaryText: {
    color: colors.background,
    fontWeight: '700',
  },
  actionText: {
    color: colors.text,
    fontWeight: '700',
  },
  actionTextDisabled: {
    color: colors.textMuted,
  },
  list: {
    paddingBottom: 40,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 20,
  },
});
