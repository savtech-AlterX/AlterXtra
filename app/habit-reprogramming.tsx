import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GlowButton } from '../src/components/GlowButton';
import { GlowCard } from '../src/components/GlowCard';
import { HudScreen } from '../src/components/HudScreen';
import { HudTextInput } from '../src/components/HudTextInput';
import { StackHeader } from '../src/components/StackHeader';
import { hasCheckedInToday, successRate } from '../src/lib/habitCheckIns';
import { useAppData } from '../src/store/AppDataContext';
import { HabitCheckIn, HabitReprogram } from '../src/store/types';
import { useAppTheme, useThemedStyles } from '../src/theme/useAppTheme';
import type { AppTheme } from '../src/theme/useAppTheme';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function CheckInRow({
  habit,
  checkIns,
  onCheckIn,
}: {
  habit: HabitReprogram;
  checkIns: HabitCheckIn[];
  onCheckIn: (followedThrough: boolean) => void;
}) {
  const { colors, typography } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const checkedInToday = hasCheckedInToday(checkIns, habit.id);
  const { followed, total } = successRate(checkIns, habit.id);

  return (
    <View style={styles.checkInBlock}>
      {checkedInToday ? (
        <View style={styles.checkedInRow}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.checkedInText}>Checked in today</Text>
        </View>
      ) : (
        <View style={styles.checkInPrompt}>
          <Text style={styles.checkInQuestion}>Did you follow through today?</Text>
          <View style={styles.checkInButtons}>
            <Pressable
              style={[styles.checkInButton, styles.checkInYes]}
              onPress={() => onCheckIn(true)}
              accessibilityRole="button"
              accessibilityLabel="Yes, I followed through today"
            >
              <Text style={styles.checkInYesText}>YES</Text>
            </Pressable>
            <Pressable
              style={[styles.checkInButton, styles.checkInNo]}
              onPress={() => onCheckIn(false)}
              accessibilityRole="button"
              accessibilityLabel="No, I did not follow through today"
            >
              <Text style={styles.checkInNoText}>NO</Text>
            </Pressable>
          </View>
        </View>
      )}
      {total > 0 && (
        <Text style={styles.successRate}>
          {followed}/{total} days followed through
        </Text>
      )}
    </View>
  );
}

export default function HabitReprogramming() {
  const { colors, typography } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { data, addHabitReprogram, addHabitCheckIn } = useAppData();
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
        placeholder="e.g. I follow through on what I commit to."
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
              <CheckInRow
                habit={h}
                checkIns={data.habitCheckIns}
                onCheckIn={(followedThrough) => addHabitCheckIn(h.id, followedThrough)}
              />
            </GlowCard>
          ))}
        </>
      )}
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
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
  checkInBlock: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderDim,
    gap: 6,
  },
  checkInPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  checkInQuestion: {
    flex: 1,
    fontFamily: typography.bodyMuted.fontFamily,
    fontSize: 13,
    color: colors.textSecondary,
  },
  checkInButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  checkInButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  checkInYes: {
    borderColor: colors.success,
    backgroundColor: 'rgba(63, 224, 138, 0.1)',
  },
  checkInYesText: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.success,
  },
  checkInNo: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(255, 77, 94, 0.1)',
  },
  checkInNoText: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.danger,
  },
  checkedInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkedInText: {
    fontFamily: typography.bodyMuted.fontFamily,
    fontSize: 13,
    color: colors.success,
  },
  successRate: {
    fontFamily: typography.bodyMuted.fontFamily,
    fontSize: 11,
    color: colors.textMuted,
  },
});
