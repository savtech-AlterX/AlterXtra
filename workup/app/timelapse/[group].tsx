import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MUSCLE_GROUP_LABELS, isMuscleGroup } from '../../src/constants/muscleGroups';
import { useWorkupData } from '../../src/data/WorkupDataContext';
import { colors } from '../../src/theme/colors';

const FRAME_DURATION_MS = 1200;

export default function TimelapseScreen() {
  const { group } = useLocalSearchParams<{ group: string }>();
  const { getEntriesForGroup } = useWorkupData();
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const validGroup = group && isMuscleGroup(group) ? group : null;

  // Oldest first, so the timelapse plays forward through progress.
  const entries = validGroup
    ? [...getEntriesForGroup(validGroup)].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  useEffect(() => {
    if (!isPlaying || entries.length < 2) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % entries.length);
    }, FRAME_DURATION_MS);
    return () => clearInterval(interval);
  }, [isPlaying, entries.length]);

  if (!validGroup) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Unknown muscle group</Text>
      </View>
    );
  }

  if (entries.length < 2) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: `${MUSCLE_GROUP_LABELS[validGroup]} Timelapse` }} />
        <Text style={styles.emptyText}>Need at least two photos to play a timelapse.</Text>
      </View>
    );
  }

  const current = entries[index];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `${MUSCLE_GROUP_LABELS[validGroup]} Timelapse` }} />
      <Image source={{ uri: current.photoUri }} style={styles.image} resizeMode="cover" />
      <View style={styles.footer}>
        <Text style={styles.date}>
          {new Date(current.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
        <Text style={styles.frameCount}>
          {index + 1} / {entries.length}
        </Text>
        <View style={styles.controlsRow}>
          <Pressable
            style={styles.controlButton}
            onPress={() => setIndex((prev) => (prev - 1 + entries.length) % entries.length)}
          >
            <Text style={styles.controlText}>Prev</Text>
          </Pressable>
          <Pressable style={styles.controlButton} onPress={() => setIsPlaying((prev) => !prev)}>
            <Text style={styles.controlText}>{isPlaying ? 'Pause' : 'Play'}</Text>
          </Pressable>
          <Pressable style={styles.controlButton} onPress={() => setIndex((prev) => (prev + 1) % entries.length)}>
            <Text style={styles.controlText}>Next</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  image: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.surfaceAlt,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 24,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  date: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  frameCount: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
    marginBottom: 14,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  controlText: {
    color: colors.text,
    fontWeight: '600',
  },
});
