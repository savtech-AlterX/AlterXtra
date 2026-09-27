import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BodyDiagram } from '../src/components/BodyDiagram';
import { MUSCLE_GROUP_LABELS } from '../src/constants/muscleGroups';
import { colors } from '../src/theme/colors';
import type { MuscleGroup } from '../src/types';

export default function HomeScreen() {
  const router = useRouter();
  const [view, setView] = useState<'front' | 'back'>('front');

  const handleSelectGroup = (group: MuscleGroup) => {
    router.push(`/muscle/${group}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.push('/settings')} hitSlop={12} style={styles.settingsButton}>
              <Text style={styles.settingsLink}>Settings</Text>
            </Pressable>
          ),
        }}
      />
      <Text style={styles.title}>Workup</Text>
      <Text style={styles.subtitle}>Tap a muscle group to log or review progress</Text>

      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggleButton, view === 'front' && styles.toggleButtonActive]}
          onPress={() => setView('front')}
        >
          <Text style={[styles.toggleText, view === 'front' && styles.toggleTextActive]}>Front</Text>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, view === 'back' && styles.toggleButtonActive]}
          onPress={() => setView('back')}
        >
          <Text style={[styles.toggleText, view === 'back' && styles.toggleTextActive]}>Back</Text>
        </Pressable>
      </View>

      <View style={styles.diagramWrap}>
        <BodyDiagram view={view} onSelectGroup={handleSelectGroup} />
      </View>

      <Text style={styles.legendHint}>
        {Object.values(MUSCLE_GROUP_LABELS).join(' · ')}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    alignSelf: 'flex-start',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  settingsButton: {
    paddingRight: 16,
  },
  settingsLink: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 15,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: colors.accent,
  },
  toggleText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: colors.background,
  },
  diagramWrap: {
    width: '100%',
    maxWidth: 260,
  },
  legendHint: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});
