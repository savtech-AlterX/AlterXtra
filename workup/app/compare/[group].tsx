import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EntryCard } from '../../src/components/EntryCard';
import { MUSCLE_GROUP_LABELS, isMuscleGroup } from '../../src/constants/muscleGroups';
import { useWorkupData } from '../../src/data/WorkupDataContext';
import { colors } from '../../src/theme/colors';
import type { ProgressEntry } from '../../src/types';

export default function CompareScreen() {
  const { group } = useLocalSearchParams<{ group: string }>();
  const { getEntriesForGroup } = useWorkupData();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (!group || !isMuscleGroup(group)) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Unknown muscle group</Text>
      </View>
    );
  }

  const entries = getEntriesForGroup(group);
  const label = MUSCLE_GROUP_LABELS[group];

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((existing) => existing !== id);
      if (prev.length === 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const selectedEntries: ProgressEntry[] = selectedIds
    .map((id) => entries.find((entry) => entry.id === id))
    .filter((entry): entry is ProgressEntry => Boolean(entry));

  // Show oldest first so the comparison reads left-to-right as progress.
  const orderedSelection = [...selectedEntries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Compare ${label}` }} />
      <Text style={styles.hint}>Pick two photos to compare side by side</Text>

      {orderedSelection.length === 2 && (
        <View style={styles.comparisonRow}>
          {orderedSelection.map((entry) => (
            <View key={entry.id} style={styles.comparisonColumn}>
              <Image source={{ uri: entry.photoUri }} style={styles.comparisonImage} />
              <Text style={styles.comparisonDate}>
                {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
              {entry.bodyWeightKg != null && (
                <Text style={styles.comparisonDetail}>{entry.bodyWeightKg} kg</Text>
              )}
            </View>
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.list}>
        {entries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            selected={selectedIds.includes(entry.id)}
            onPress={() => toggleSelect(entry.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  hint: {
    color: colors.textMuted,
    marginBottom: 16,
  },
  comparisonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  comparisonColumn: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
  },
  comparisonDate: {
    color: colors.text,
    fontWeight: '600',
    marginTop: 8,
  },
  comparisonDetail: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  list: {
    paddingBottom: 40,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
});
