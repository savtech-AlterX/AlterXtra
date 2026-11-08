import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../src/components/EmptyState';
import { GlowCard } from '../../src/components/GlowCard';
import { GoalCountdownBar } from '../../src/components/GoalCountdownBar';
import { CloseToHome } from '../../src/components/CloseToHome';
import { HudScreen } from '../../src/components/HudScreen';
import { useAppData } from '../../src/store/AppDataContext';
import { isGoalComplete } from '../../src/lib/goals';
import { Goal } from '../../src/store/types';
import { useWinFlash } from '../../src/store/WinFlashContext';
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

function PrimaryGoalCard({ goal, number, overdue, onToggleStep, onEdit, onCheckout, onExtend }: { goal: Goal; number: number; overdue: boolean; onToggleStep: (i: number) => void; onEdit: () => void; onCheckout: () => void; onExtend: () => void }) {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { total, done, pct } = progress(goal);
  return (
    <GlowCard strong style={styles.primaryCard}>
      <Text style={styles.goalLabel}>{number === 1 ? "FIRST GOAL" : `${number === 2 ? "SECOND" : number === 3 ? "THIRD" : `${number}TH`} GOAL`}</Text>
      <GoalCountdownBar goal={goal} />
      {overdue && <Text style={[styles.goalLabel, { color: colors.danger }]}>OVERDUE</Text>}
      {!!goal.consequence && <Text style={styles.stepsComplete}>CONSEQUENCE · {goal.consequence}</Text>}
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

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
        <Pressable onPress={onEdit}><Text style={styles.goalLabel}>EDIT</Text></Pressable>
        {overdue && <><Pressable onPress={onCheckout}><Text style={[styles.goalLabel, { color: colors.danger }]}>CHECK OUT</Text></Pressable><Pressable onPress={onExtend}><Text style={styles.goalLabel}>EXTEND TIMELINE</Text></Pressable></>}
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

function SecondaryGoalCard({ goal, number, overdue, onToggleStep, onEdit, onCheckout, onExtend }: { goal: Goal; number: number; overdue: boolean; onToggleStep: (i: number) => void; onEdit: () => void; onCheckout: () => void; onExtend: () => void }) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { total, done, pct } = progress(goal);
  return (
    <GlowCard style={styles.secondaryCard}>
      <Text style={styles.goalLabel}>{number === 2 ? 'SECOND GOAL' : number === 3 ? 'THIRD GOAL' : `${number}TH GOAL`}</Text>
      <Text style={styles.goalTitle}>{goal.objective}</Text>
      {overdue && <Text style={[styles.goalLabel, { color: colors.danger }]}>OVERDUE</Text>}
      {!!goal.consequence && <Text style={styles.stepsComplete}>CONSEQUENCE · {goal.consequence}</Text>}
      <View style={{ flexDirection: 'row', gap: 12 }}><Pressable onPress={onEdit}><Text style={styles.goalLabel}>EDIT</Text></Pressable>{overdue && <><Pressable onPress={onCheckout}><Text style={[styles.goalLabel, { color: colors.danger }]}>CHECK OUT</Text></Pressable><Pressable onPress={onExtend}><Text style={styles.goalLabel}>EXTEND TIMELINE</Text></Pressable></>}</View>
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
  const { data, toggleGoalStep, deleteGoal, updateGoal } = useAppData();
  const winFlash = useWinFlash();

  const activeGoals = data.goals.filter((goal) => !isGoalComplete(goal));
  const primary = activeGoals.length > 0 ? activeGoals[activeGoals.length - 1] : null;
  const secondary = activeGoals.length > 1 ? activeGoals.slice(0, -1) : [];

  function handleToggleStep(goal: Goal, stepIndex: number) {
    const wasDone = goal.steps[stepIndex]?.done ?? false;
    toggleGoalStep(goal.id, stepIndex);
    if (!wasDone) winFlash();
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
        <PrimaryGoalCard goal={primary} number={activeGoals.indexOf(primary) + 1} overdue={!!primary.targetDate && new Date(`${primary.targetDate}T23:59:59`) < new Date()} onEdit={() => router.push({ pathname: '/goals/new', params: { id: primary.id } })} onCheckout={() => deleteGoal(primary.id)} onExtend={() => updateGoal(primary.id, primary.objective, new Date(new Date(`${primary.targetDate}T12:00:00`).getTime() + 7 * 86400000).toISOString().slice(0,10), primary.steps.map((x) => x.text), primary.consequence)} onToggleStep={(i) => handleToggleStep(primary, i)} />
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
        <SecondaryGoalCard key={goal.id} goal={goal} number={activeGoals.indexOf(goal) + 1} overdue={!!goal.targetDate && new Date(`${goal.targetDate}T23:59:59`) < new Date()} onEdit={() => router.push({ pathname: '/goals/new', params: { id: goal.id } })} onCheckout={() => deleteGoal(goal.id)} onExtend={() => updateGoal(goal.id, goal.objective, new Date(new Date(`${goal.targetDate}T12:00:00`).getTime() + 7 * 86400000).toISOString().slice(0,10), goal.steps.map((x) => x.text), goal.consequence)} onToggleStep={(i) => handleToggleStep(goal, i)} />
      ))}
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
