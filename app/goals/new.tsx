import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { GlowButton } from '../../src/components/GlowButton';
import { HudScreen } from '../../src/components/HudScreen';
import { HudTextInput } from '../../src/components/HudTextInput';
import { StackHeader } from '../../src/components/StackHeader';
import { useAppData } from '../../src/store/AppDataContext';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

export default function NewGoal() {
  const { typography } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { addGoal } = useAppData();
  const [objective, setObjective] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [stepPlan, setStepPlan] = useState('');

  function save() {
    if (!objective.trim() || !targetDate.trim()) return;
    const steps = stepPlan
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    addGoal(objective.trim(), targetDate.trim(), steps);
    router.back();
  }

  return (
    <HudScreen>
      <StackHeader title="PRIMARY OBJECTIVE" />

      <Text style={typography.label}>OBJECTIVE</Text>
      <HudTextInput
        placeholder="e.g. Compete in first MMA fight"
        value={objective}
        onChangeText={setObjective}
      />

      <Text style={[typography.label, styles.spacer]}>TARGET DATE (YYYY-MM-DD)</Text>
      <HudTextInput placeholder="2026-09-01" value={targetDate} onChangeText={setTargetDate} />

      <Text style={[typography.label, styles.spacer]}>STEP PLAN (ONE PER LINE)</Text>
      <HudTextInput
        placeholder={'Join a gym\nTrain 4x per week\nSpar regularly'}
        value={stepPlan}
        onChangeText={setStepPlan}
        multiline
      />

      <GlowButton
        label="SAVE OBJECTIVE"
        onPress={save}
        disabled={!objective.trim() || !targetDate.trim()}
        style={styles.spacer}
      />
      <GlowButton label="CANCEL" variant="outline" onPress={() => router.back()} />
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  spacer: {
    marginTop: 6,
  },
});
