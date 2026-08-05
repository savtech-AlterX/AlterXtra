import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../src/components/EmptyState';
import { GlowCard } from '../../src/components/GlowCard';
import { GoalCelebration } from '../../src/components/GoalCelebration';
import { GoalCountdownBar } from '../../src/components/GoalCountdownBar';
import { CloseToHome } from '../../src/components/CloseToHome';
import { HudScreen } from '../../src/components/HudScreen';
import { useAppData } from '../../src/store/AppDataContext';
import { Goal } from '../../src/store/types';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

function progress(goal: Goal) {
  const total = goal.steps.length;
  const done = goal.steps.filter((s) => s.done).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, pct };
}

function StepRow({
  step,
  onToggle,
}: {
  step: { text: string; done: boolean };
  onToggle: () => void;
}) {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      style={styles.stepRow}
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: step.done }}
      accessibilityLabel={step.text}
    >
      <Ionicons
        name={step.done ? 'checkbox' : 'square-outline'}
        size={18}
        color={step.done ? colors.success : colors.glow}
        style={iconGlow}
      />
      <Text style={[styles.stepText, step.done && styles.stepTextDone]}>{step.text}</Text>
    </Pressable>
  );
}

function PrimaryGoalCard({ goal, onToggleStep }: { goal: Goal; onToggleStep: (i: number) => void }) {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { total, done, pct } = progress(goal);
  return (
    <GlowCard strong style={styles.primaryCard}>
      <Text style={styles.goalLabel}>PRIMARY OBJECTIVE</Text>
      <GoalCountdownBar goal={goal} />
      <View style={styles.targetRow}>
        <Ionicons name="calendar-outline" size={14} color={colors.glow} style={iconGlow} />
        <Text style={styles.targetLabel}>TARGET</Text>
        <Text style={styles.targetValue}>{goal.targetDate || '—'}</Text>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.ring}>
          <Text style={styles.ringValue}>{pct}%</Text>
          <Text style={styles.ringLabel}>COMPLETE</Text>
        </View>
        <View style={styles.progressCol}>
          <Text style={styles.goalLabel}>PROGRESS</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.stepsComplete}>
            {done}/{total} steps complete
          </Text>
        </View>
      </View>

      {total > 0 && (
        <View style={styles.steps}>
          {goal.steps.map((step, i) => (
            <StepRow key={i} step={step} onToggle={() => onToggleStep(i)} />
          ))}
        </View>
      )}
    </GlowCard>
  );
}

function SecondaryGoalCard({ goal, onToggleStep }: { goal: Goal; onToggleStep: (i: number) => void }) {
  const styles = useThemedStyles(makeStyles);
  const { total, done, pct } = progress(goal);
  return (
    <GlowCard style={styles.secondaryCard}>
      <Text style={styles.goalTitle}>{goal.objective}</Text>
      <Text style={styles.targetValue}>TARGET: {goal.targetDate || '—'}</Text>
      {total > 0 && (
        <>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
          <View style={styles.steps}>
            {goal.steps.map((step, i) => (
              <StepRow key={i} step={step} onToggle={() => onToggleStep(i)} />
            ))}
          </View>
        </>
      )}
    </GlowCard>
  );
}

export default function Goals() {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { data, toggleGoalStep } = useAppData();
  const [celebrating, setCelebrating] = useState<string | null>(null);

  const primary = data.goals.length > 0 ? data.goals[data.goals.length - 1] : null;
  const secondary = data.goals.length > 1 ? data.goals.slice(0, -1) : [];

  // Toggle the step, and if that action is what finished the goal, celebrate it.
  function handleToggleStep(goal: Goal, stepIndex: number) {
    const wasComplete = goal.steps.length > 0 && goal.steps.every((s) => s.done);
    toggleGoalStep(goal.id, stepIndex);
    const next = goal.steps.map((s, i) => (i === stepIndex ? { ...s, done: !s.done } : s));
    const nowComplete = next.length > 0 && next.every((s) => s.done);
    if (!wasComplete && nowComplete) setCelebrating(goal.objective);
  }

  return (
    <HudScreen>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <CloseToHome />
          <Text style={typography.screenTitle}>GOALS</Text>
        </View>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/goals/new')}
          accessibilityRole="button"
          accessibilityLabel="Add new goal"
        >
          <Ionicons name="create-outline" size={20} color={colors.glow} style={iconGlow} />
        </Pressable>
      </View>

      {!primary && (
        <EmptyState
          icon="flag-outline"
          title="NO OBJECTIVE SET"
          body="Your primary objective sits at the top of this screen with a live countdown. Set one and every step you tick off moves the bar."
          actionLabel="SET YOUR OBJECTIVE"
          onAction={() => router.push('/goals/new')}
        />
      )}

      {primary && (
        <PrimaryGoalCard goal={primary} onToggleStep={(i) => handleToggleStep(primary, i)} />
      )}

      <View style={styles.header}>
        <Text style={typography.label}>SECONDARY GOALS</Text>
        <Pressable
          style={styles.addButtonSmall}
          onPress={() => router.push('/goals/new')}
          accessibilityRole="button"
          accessibilityLabel="Add secondary goal"
        >
          <Ionicons name="add" size={18} color={colors.glow} style={iconGlow} />
        </Pressable>
      </View>

      {secondary.length === 0 && (
        <EmptyState
          compact
          icon="add-circle-outline"
          title="NO SECONDARY GOALS"
          body="Smaller objectives that run alongside your main one."
          actionLabel="ADD ONE"
          onAction={() => router.push('/goals/new')}
        />
      )}

      {secondary.map((goal) => (
        <SecondaryGoalCard key={goal.id} goal={goal} onToggleStep={(i) => handleToggleStep(goal, i)} />
      ))}

      {celebrating && (
        <GoalCelebration objective={celebrating} onDismiss={() => setCelebrating(null)} />
      )}
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCard: {
    gap: 6,
  },
  secondaryCard: {
    gap: 8,
  },
  goalLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    color: colors.glow,
    letterSpacing: 2,
  },
  goalTitle: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 18,
    color: colors.textPrimary,
    ...glowShadow,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  targetLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    color: colors.glow,
    letterSpacing: 1,
  },
  targetValue: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
  ring: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.glow,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  ringValue: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 18,
    color: colors.textPrimary,
  },
  ringLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 8,
    color: colors.glow,
    letterSpacing: 1,
    marginTop: 2,
  },
  progressCol: {
    flex: 1,
    gap: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressPct: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    color: colors.glow,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.panelSolid,
    borderWidth: 1,
    borderColor: colors.borderDim,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.glow,
  },
  stepsComplete: {
    fontFamily: typography.bodyMuted.fontFamily,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  steps: {
    gap: 8,
    marginTop: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepText: {
    fontFamily: typography.body.fontFamily,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  stepTextDone: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
});
