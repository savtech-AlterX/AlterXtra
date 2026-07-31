import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { GlowButton } from '../src/components/GlowButton';
import { GlowCard } from '../src/components/GlowCard';
import { HudScreen } from '../src/components/HudScreen';
import { HudTextInput } from '../src/components/HudTextInput';
import { StackHeader } from '../src/components/StackHeader';
import { useAppData } from '../src/store/AppDataContext';
import { colors } from '../src/theme/colors';
import { glowShadow, typography } from '../src/theme/typography';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function HabitReprogramming() {
  const { data, addHabitReprogram } = useAppData();
  const [trigger, setTrigger] = useState('');
  const [oldHabit, setOldHabit] = useState('');
  const [replacement, setReplacement] = useState('');
  const [reward, setReward] = useState('');
  const [identityStatement, setIdentityStatement] = useState('');

  const canSave = trigger.trim().length > 0 && replacement.trim().length > 0;

  function save() {
    if (!canSave) return;
    addHabitReprogram(
      trigger.trim(),
      oldHabit.trim(),
      replacement.trim(),
      reward.trim(),
      identityStatement.trim()
    );
    setTrigger('');
    setOldHabit('');
    setReplacement('');
    setReward('');
    setIdentityStatement('');
  }

  return (
    <HudScreen>
      <StackHeader title="HABIT REPROGRAMMING" />
      <Text style={styles.subtitle}>Rewire the loop: trigger, replacement, reward, identity.</Text>

      <Text style={typography.label}>TRIGGER</Text>
      <HudTextInput placeholder="e.g. Feeling stressed after work" value={trigger} onChangeText={setTrigger} />

      <Text style={[typography.label, styles.spacer]}>OLD HABIT</Text>
      <HudTextInput placeholder="e.g. Doom-scrolling for an hour" value={oldHabit} onChangeText={setOldHabit} />

      <Text style={[typography.label, styles.spacer]}>REPLACEMENT</Text>
      <HudTextInput
        placeholder="e.g. 10 min stretch + plan tomorrow"
        value={replacement}
        onChangeText={setReplacement}
      />

      <Text style={[typography.label, styles.spacer]}>REWARD</Text>
      <HudTextInput placeholder="e.g. Better sleep, better performance" value={reward} onChangeText={setReward} />

      <Text style={[typography.label, styles.spacer]}>IDENTITY STATEMENT</Text>
      <HudTextInput
        placeholder="e.g. I protect my recovery."
        value={identityStatement}
        onChangeText={setIdentityStatement}
      />

      <GlowButton label="SAVE HABIT" onPress={save} disabled={!canSave} style={styles.spacer} />

      {data.habitReprograms.length > 0 && (
        <>
          <Text style={[typography.label, styles.spacer]}>REPROGRAMMED HABITS</Text>
          {data.habitReprograms.map((h) => (
            <GlowCard key={h.id} style={styles.entry}>
              <Text style={styles.entryDate}>{formatDate(h.createdAt)}</Text>
              <Text style={styles.entryTitle}>{h.trigger}</Text>
              <Text style={styles.entryBody}>→ {h.replacement}</Text>
              {!!h.identityStatement && <Text style={styles.entryIdentity}>"{h.identityStatement}"</Text>}
            </GlowCard>
          ))}
        </>
      )}
    </HudScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontFamily: typography.body.fontFamily,
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: -8,
  },
  spacer: {
    marginTop: 6,
  },
  entry: {
    gap: 6,
  },
  entryDate: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    color: colors.glow,
    letterSpacing: 1,
  },
  entryTitle: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 16,
    color: colors.textPrimary,
    ...glowShadow,
  },
  entryBody: {
    fontFamily: typography.body.fontFamily,
    color: colors.textPrimary,
    fontSize: 14,
  },
  entryIdentity: {
    fontFamily: typography.body.fontFamily,
    fontStyle: 'italic',
    color: colors.accentTeal,
    fontSize: 14,
  },
});
