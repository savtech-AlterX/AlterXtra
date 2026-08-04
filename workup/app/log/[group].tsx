import { Directory, File, Paths } from 'expo-file-system';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MUSCLE_GROUP_LABELS, isMuscleGroup } from '../../src/constants/muscleGroups';
import { useWorkupData } from '../../src/data/WorkupDataContext';
import { colors } from '../../src/theme/colors';
import type { Measurement } from '../../src/types';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function persistPhoto(sourceUri: string, id: string): string {
  const photoDir = new Directory(Paths.document, 'workup-photos');
  if (!photoDir.exists) {
    photoDir.create({ intermediates: true });
  }
  const sourceFile = new File(sourceUri);
  const destFile = new File(photoDir, `${id}.jpg`);
  sourceFile.copy(destFile);
  return destFile.uri;
}

export default function LogEntryScreen() {
  const { group, photoUri } = useLocalSearchParams<{ group: string; photoUri: string }>();
  const router = useRouter();
  const { addEntry } = useWorkupData();

  const [bodyWeightKg, setBodyWeightKg] = useState('');
  const [measurements, setMeasurements] = useState<{ label: string; value: string }[]>([
    { label: '', value: '' },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  if (!group || !isMuscleGroup(group) || !photoUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Missing photo or muscle group</Text>
      </View>
    );
  }

  const updateMeasurement = (index: number, field: 'label' | 'value', text: string) => {
    setMeasurements((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: text } : m))
    );
  };

  const addMeasurementRow = () => {
    setMeasurements((prev) => [...prev, { label: '', value: '' }]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const id = generateId();
      const persistedUri = persistPhoto(decodeURIComponent(photoUri), id);

      const parsedMeasurements: Measurement[] = measurements
        .filter((m) => m.label.trim() && m.value.trim() && !Number.isNaN(Number(m.value)))
        .map((m) => ({ label: m.label.trim(), valueCm: Number(m.value) }));

      await addEntry({
        id,
        muscleGroup: group,
        photoUri: persistedUri,
        date: new Date().toISOString(),
        bodyWeightKg: bodyWeightKg.trim() ? Number(bodyWeightKg) : undefined,
        measurements: parsedMeasurements.length ? parsedMeasurements : undefined,
      });

      router.replace(`/muscle/${group}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: `Log ${MUSCLE_GROUP_LABELS[group]}` }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Body weight (kg)</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="e.g. 82.5"
          placeholderTextColor={colors.textMuted}
          value={bodyWeightKg}
          onChangeText={setBodyWeightKg}
        />

        <Text style={styles.label}>Measurements (optional)</Text>
        {measurements.map((m, index) => (
          <View key={index} style={styles.measurementRow}>
            <TextInput
              style={[styles.input, styles.measurementLabelInput]}
              placeholder="e.g. Arm"
              placeholderTextColor={colors.textMuted}
              value={m.label}
              onChangeText={(text) => updateMeasurement(index, 'label', text)}
            />
            <TextInput
              style={[styles.input, styles.measurementValueInput]}
              placeholder="cm"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={m.value}
              onChangeText={(text) => updateMeasurement(index, 'value', text)}
            />
          </View>
        ))}
        <Pressable onPress={addMeasurementRow} style={styles.addRow}>
          <Text style={styles.addRowText}>+ Add another measurement</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
          <Text style={styles.saveButtonText}>{isSaving ? 'Saving…' : 'Save Entry'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
  label: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
  },
  measurementRow: {
    flexDirection: 'row',
    gap: 10,
  },
  measurementLabelInput: {
    flex: 2,
    minWidth: 0,
  },
  measurementValueInput: {
    flex: 1,
    minWidth: 0,
  },
  addRow: {
    marginTop: 10,
  },
  addRowText: {
    color: colors.accent,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 16,
  },
});
