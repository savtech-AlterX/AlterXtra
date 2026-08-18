import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GlowButton } from '../../src/components/GlowButton';
import { GlowCard } from '../../src/components/GlowCard';
import { HudScreen } from '../../src/components/HudScreen';
import { HudTextInput } from '../../src/components/HudTextInput';
import { StackHeader } from '../../src/components/StackHeader';
import { useAppData } from '../../src/store/AppDataContext';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

const MONTH_NAMES = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];
const STEP_PLACEHOLDERS = ['Join a gym', 'Train 4x per week', 'Spar regularly'];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

// A tap-to-adjust date, not a format to remember — nothing here can ever be
// an invalid date, so there's no "YYYY-MM-DD" instruction to parse or get
// wrong, and no keyboard needed at all.
function DateStepper({
  label,
  value,
  onDecrease,
  onIncrease,
  decreaseLabel,
  increaseLabel,
}: {
  label: string;
  value: string;
  onDecrease: () => void;
  onIncrease: () => void;
  decreaseLabel: string;
  increaseLabel: string;
}) {
  const { colors, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.dateSegment}>
      <Pressable
        onPress={onIncrease}
        accessibilityRole="button"
        accessibilityLabel={increaseLabel}
        hitSlop={8}
        style={({ pressed }) => [styles.dateStepButton, pressed && styles.dateStepButtonPressed]}
      >
        <Ionicons name="chevron-up" size={18} color={colors.glow} style={iconGlow} />
      </Pressable>
      <Text style={styles.dateSegmentValue}>{value}</Text>
      <Pressable
        onPress={onDecrease}
        accessibilityRole="button"
        accessibilityLabel={decreaseLabel}
        hitSlop={8}
        style={({ pressed }) => [styles.dateStepButton, pressed && styles.dateStepButtonPressed]}
      >
        <Ionicons name="chevron-down" size={18} color={colors.glow} style={iconGlow} />
      </Pressable>
      <Text style={styles.dateSegmentLabel}>{label}</Text>
    </View>
  );
}

export default function NewGoal() {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { addGoal } = useAppData();
  const [objective, setObjective] = useState('');

  // Defaults a month out — a real, usable date already sitting there beats
  // an empty field the user has to first figure out how to fill in.
  const initial = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d;
  }, []);
  const [month, setMonth] = useState(initial.getMonth() + 1);
  const [day, setDay] = useState(initial.getDate());
  const [year, setYear] = useState(initial.getFullYear());
  const thisYear = initial.getFullYear();

  const [steps, setSteps] = useState<string[]>(['', '', '']);

  function adjustMonth(delta: number) {
    setMonth((m) => {
      const next = ((m - 1 + delta + 12) % 12) + 1;
      setDay((d) => Math.min(d, daysInMonth(next, year)));
      return next;
    });
  }

  function adjustDay(delta: number) {
    setDay((d) => {
      const max = daysInMonth(month, year);
      return ((d - 1 + delta + max) % max) + 1;
    });
  }

  function adjustYear(delta: number) {
    setYear((y) => {
      const next = Math.min(Math.max(y + delta, thisYear), thisYear + 15);
      setDay((d) => Math.min(d, daysInMonth(month, next)));
      return next;
    });
  }

  const targetDate = `${year}-${pad(month)}-${pad(day)}`;
  const readableDate = new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  function updateStep(index: number, text: string) {
    setSteps((prev) => prev.map((s, i) => (i === index ? text : s)));
  }

  function addStepRow() {
    setSteps((prev) => [...prev, '']);
  }

  function removeStepRow(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  function save() {
    if (!objective.trim()) return;
    const cleanSteps = steps.map((s) => s.trim()).filter(Boolean);
    addGoal(objective.trim(), targetDate, cleanSteps);
    router.back();
  }

  return (
    <HudScreen>
      <StackHeader title="NEW GOAL" />
      <Text style={[typography.bodyMuted, styles.intro]}>
        One clear goal, a date to aim for, and a few simple steps to get there.
      </Text>

      <GlowCard>
        <Text style={typography.label}>WHAT'S THE GOAL?</Text>
        <HudTextInput
          placeholder="e.g. Compete in first MMA fight"
          value={objective}
          onChangeText={setObjective}
          style={styles.spacer}
          accessibilityLabel="Goal"
        />
      </GlowCard>

      <GlowCard>
        <Text style={typography.label}>BY WHEN?</Text>
        <View style={[styles.dateRow, styles.spacer]}>
          <DateStepper
            label="MONTH"
            value={MONTH_NAMES[month - 1]}
            onIncrease={() => adjustMonth(1)}
            onDecrease={() => adjustMonth(-1)}
            increaseLabel="Next month"
            decreaseLabel="Previous month"
          />
          <DateStepper
            label="DAY"
            value={String(day)}
            onIncrease={() => adjustDay(1)}
            onDecrease={() => adjustDay(-1)}
            increaseLabel="Next day"
            decreaseLabel="Previous day"
          />
          <DateStepper
            label="YEAR"
            value={String(year)}
            onIncrease={() => adjustYear(1)}
            onDecrease={() => adjustYear(-1)}
            increaseLabel="Next year"
            decreaseLabel="Previous year"
          />
        </View>
        <Text style={[typography.caption, styles.readableDate]}>{readableDate}</Text>
      </GlowCard>

      <GlowCard>
        <Text style={typography.label}>HOW WILL YOU GET THERE?</Text>
        <Text style={[typography.caption, styles.spacer]}>
          A few simple steps — check them off as you go.
        </Text>
        <View style={styles.stepList}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{index + 1}</Text>
              </View>
              <HudTextInput
                placeholder={STEP_PLACEHOLDERS[index] ?? 'Add a step'}
                value={step}
                onChangeText={(text) => updateStep(index, text)}
                style={styles.stepInput}
                accessibilityLabel={`Step ${index + 1}`}
              />
              {steps.length > 1 && (
                <Pressable
                  onPress={() => removeStepRow(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove step ${index + 1}`}
                  hitSlop={8}
                  style={styles.removeStepButton}
                >
                  <Ionicons name="close" size={16} color={colors.textMuted} />
                </Pressable>
              )}
            </View>
          ))}
        </View>
        <Pressable
          onPress={addStepRow}
          accessibilityRole="button"
          accessibilityLabel="Add another step"
          style={({ pressed }) => [styles.addStepButton, pressed && styles.addStepButtonPressed]}
        >
          <Ionicons name="add" size={16} color={colors.glow} style={iconGlow} />
          <Text style={styles.addStepText}>ADD A STEP</Text>
        </Pressable>
      </GlowCard>

      <GlowButton label="SAVE GOAL" onPress={save} disabled={!objective.trim()} style={styles.spacer} />
      <GlowButton label="CANCEL" variant="outline" onPress={() => router.back()} />
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  spacer: {
    marginTop: 10,
  },
  intro: {
    marginBottom: -4,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateSegment: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  dateStepButton: {
    width: 44,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateStepButtonPressed: {
    opacity: 0.6,
  },
  dateSegmentValue: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 20,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  dateSegmentLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1.5,
  },
  readableDate: {
    textAlign: 'center',
    marginTop: 14,
  },
  stepList: {
    gap: 10,
    marginTop: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    fontFamily: typography.label.fontFamily,
    fontSize: 12,
    color: colors.glow,
  },
  stepInput: {
    flex: 1,
    paddingVertical: 10,
  },
  removeStepButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderDim,
  },
  addStepButtonPressed: {
    opacity: 0.6,
  },
  addStepText: {
    fontFamily: typography.label.fontFamily,
    fontSize: 12,
    color: colors.glow,
    letterSpacing: 1.5,
  },
});
