import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import type { ProgressEntry } from '../types';

type Props = {
  entry: ProgressEntry;
  onPress?: () => void;
  selected?: boolean;
};

export function EntryCard({ entry, onPress, selected }: Props) {
  const date = new Date(entry.date);
  const dateLabel = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <Image source={{ uri: entry.photoUri }} style={styles.thumbnail} />
      <View style={styles.meta}>
        <Text style={styles.date}>{dateLabel}</Text>
        {entry.bodyWeightKg != null && (
          <Text style={styles.detail}>{entry.bodyWeightKg} kg</Text>
        )}
        {entry.measurements?.map((m) => (
          <Text key={m.label} style={styles.detail}>
            {m.label}: {m.valueCm} cm
          </Text>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardSelected: {
    borderColor: colors.accent,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
  },
  meta: {
    marginLeft: 12,
    flex: 1,
  },
  date: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  detail: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
});
