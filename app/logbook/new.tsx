import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GlowButton } from '../../src/components/GlowButton';
import { HudScreen } from '../../src/components/HudScreen';
import { HudTextInput } from '../../src/components/HudTextInput';
import { StackHeader } from '../../src/components/StackHeader';
import { useAppData } from '../../src/store/AppDataContext';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

export default function NewLogEntry() {
  const router = useRouter();
  const { addLogEntry } = useAppData();
  const [aligned, setAligned] = useState<boolean | null>(null);
  const [proof, setProof] = useState('');
  const [correction, setCorrection] = useState('');

  function save() {
    if (aligned === null || !proof.trim()) return;
    addLogEntry(aligned, proof.trim(), correction.trim());
    router.back();
  }

  return (
    <HudScreen>
      <StackHeader title="LOG TODAY" />

      <Text style={typography.label}>WERE YOU ALIGNED TODAY?</Text>
      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggle, aligned === true && styles.toggleAligned]}
          onPress={() => setAligned(true)}
        >
          <Text style={[styles.toggleLabel, aligned === true && styles.toggleLabelActive]}>
            ALIGNED
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggle, aligned === false && styles.toggleMisaligned]}
          onPress={() => setAligned(false)}
        >
          <Text style={[styles.toggleLabel, aligned === false && styles.toggleLabelActive]}>
            MISALIGNED
          </Text>
        </Pressable>
      </View>

      <Text style={[typography.label, styles.spacer]}>PROOF</Text>
      <HudTextInput
        placeholder="e.g. Woke up early"
        value={proof}
        onChangeText={setProof}
        multiline
      />

      <Text style={[typography.label, styles.spacer]}>CORRECTION</Text>
      <HudTextInput
        placeholder="Where did you drift, and how will you correct it?"
        value={correction}
        onChangeText={setCorrection}
        multiline
      />

      <GlowButton
        label="SAVE LOG"
        onPress={save}
        disabled={aligned === null || !proof.trim()}
        style={styles.spacer}
      />
    </HudScreen>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggle: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderDim,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  toggleAligned: {
    borderColor: colors.success,
    backgroundColor: 'rgba(63, 224, 138, 0.1)',
  },
  toggleMisaligned: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(255, 77, 94, 0.1)',
  },
  toggleLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  toggleLabelActive: {
    color: colors.textPrimary,
  },
  spacer: {
    marginTop: 6,
  },
});
