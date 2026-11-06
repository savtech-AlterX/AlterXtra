import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../src/components/EmptyState';
import { GlowCard } from '../../src/components/GlowCard';
import { CloseToHome } from '../../src/components/CloseToHome';
import { HudScreen } from '../../src/components/HudScreen';
import { useAppData } from '../../src/store/AppDataContext';
import { Goal } from '../../src/store/types';
import { useWinFlash } from '../../src/store/WinFlashContext';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

function progress(goal: Goal) {
  const total = goal.steps.length;
  const done = goal.steps.filter((step) => step.done).length;
  return { total, done, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
}

function isComplete(goal: Goal) {
  return !!goal.completedAt || (goal.steps.length > 0 && goal.steps.every((step) => step.done));
}

function isOverdue(goal: Goal) {
  const now = new Date();
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  return !isComplete(goal) && goal.targetDate < today;
}

function StepRow({ step, onToggle }: { step: { text: string; done: boolean }; onToggle: () => void }) {
  const { colors, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable style={styles.stepRow} onPress={onToggle} accessibilityRole="checkbox" accessibilityState={{ checked: step.done }} accessibilityLabel={step.text}>
      <Ionicons name={step.done ? 'checkbox' : 'square-outline'} size={18} color={step.done ? colors.success : colors.glow} style={iconGlow} />
      <Text style={[styles.stepText, step.done && styles.stepTextDone]}>{step.text}</Text>
    </Pressable>
  );
}

function GoalCard({
  goal, number, onToggleStep, onEdit, onCheckOut,
}: {
  goal: Goal;
  number: number;
  onToggleStep: (index: number) => void;
  onEdit: () => void;
  onCheckOut: () => void;
}) {
  const { colors, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { total, done, pct } = progress(goal);
  const overdue = isOverdue(goal);
  return (
    <GlowCard strong={!overdue} style={styles.goalCard}>
      <View style={styles.cardHeading}>
        <View style={styles.headingText}>
          <Text style={styles.goalLabel}>GOAL {number}</Text>
          <Text style={styles.goalTitle}>{goal.objective}</Text>
        </View>
        <Pressable onPress={onEdit} hitSlop={10} accessibilityRole="button" accessibilityLabel="Edit goal" style={styles.editButton}>
          <Ionicons name="create-outline" size={19} color={colors.glow} style={iconGlow} />
        </Pressable>
      </View>

      {overdue ? (
        <View style={styles.overdueBanner}>
          <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
          <Text style={styles.overdueText}>OVERDUE</Text>
        </View>
      ) : null}

      <Text style={styles.targetValue}>TARGET: {goal.targetDate || '—'}</Text>
      {overdue && goal.consequence?.trim() ? (
        <Text style={styles.consequence}>({goal.consequence.trim()})</Text>
      ) : null}

      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>PROGRESS</Text>
        <Text style={styles.progressLabel}>{pct}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.stepsComplete}>{done}/{total} steps complete</Text>

      {total > 0 && (
        <View style={styles.steps}>
          {goal.steps.map((step, index) => (
            <StepRow key={index} step={step} onToggle={() => onToggleStep(index)} />
          ))}
        </View>
      )}

      {overdue && (
        <View style={styles.overdueActions}>
          <Pressable onPress={onCheckOut} style={styles.checkOutButton} accessibilityRole="button">
            <Text style={styles.checkOutText}>CHECK OUT</Text>
          </Pressable>
          <Pressable onPress={onEdit} style={styles.extendButton} accessibilityRole="button">
            <Ionicons name="time-outline" size={15} color={colors.glow} style={iconGlow} />
            <Text style={styles.extendText}>EXTEND TIMELINE</Text>
          </Pressable>
        </View>
      )}
    </GlowCard>
  );
}

export default function Goals() {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { data, toggleGoalStep, dismissGoal } = useAppData();
  const winFlash = useWinFlash();

  const visibleGoals = [...data.goals]
    .filter((goal) => !goal.dismissedAt)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const activeGoals = visibleGoals.filter((goal) => !isComplete(goal));
  const completedGoals = visibleGoals.filter(isComplete);
  const goalNumber = (goal: Goal) => visibleGoals.findIndex((item) => item.id === goal.id) + 1;

  function handleToggleStep(goal: Goal, stepIndex: number) {
    const wasDone = goal.steps[stepIndex]?.done ?? false;
    toggleGoalStep(goal.id, stepIndex);
    if (!wasDone) winFlash();
  }

  const openGoalEditor = (goalId?: string) => {
    if (goalId) router.push({ pathname: '/goals/new', params: { id: goalId } });
    else router.push('/goals/new');
  };

  return (
    <HudScreen>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <CloseToHome />
          <Text style={typography.screenTitle}>GOALS</Text>
        </View>
        <Pressable style={styles.addButton} onPress={() => openGoalEditor()} accessibilityRole="button" accessibilityLabel="Add new goal">
          <Ionicons name="add" size={21} color={colors.glow} style={iconGlow} />
        </Pressable>
      </View>

      {activeGoals.length === 0 && completedGoals.length === 0 ? (
        <EmptyState
          icon="flag-outline"
          title="NO GOALS SET"
          body="Create your first goal, set a deadline and track the steps that move you forward."
          actionLabel="CREATE A GOAL"
          onAction={() => openGoalEditor()}
        />
      ) : null}

      {activeGoals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          number={goalNumber(goal)}
          onToggleStep={(index) => handleToggleStep(goal, index)}
          onEdit={() => openGoalEditor(goal.id)}
          onCheckOut={() => dismissGoal(goal.id)}
        />
      ))}

      {completedGoals.length > 0 && (
        <>
          <Text style={typography.label}>COMPLETED GOALS</Text>
          {completedGoals.map((goal) => (
            <GlowCard key={goal.id} style={styles.completedCard}>
              <View style={styles.completedHeading}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={styles.completedLabel}>GOAL {goalNumber(goal)} · COMPLETED</Text>
              </View>
              <Text style={styles.completedTitle}>{goal.objective}</Text>
            </GlowCard>
          ))}
        </>
      )}
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    addButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    goalCard: { gap: 9 },
    cardHeading: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
    headingText: { flex: 1, gap: 5 },
    goalLabel: { fontFamily: typography.label.fontFamily, fontSize: 10, color: colors.glow, letterSpacing: 2 },
    goalTitle: { fontFamily: typography.cardTitle.fontFamily, fontSize: 18, color: colors.textPrimary, ...glowShadow },
    editButton: { padding: 5 },
    targetValue: { fontFamily: typography.body.fontFamily, fontSize: 12, color: colors.textSecondary },
    overdueBanner: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 2 },
    overdueText: { fontFamily: typography.label.fontFamily, color: colors.danger, fontSize: 11, letterSpacing: 1.7 },
    consequence: { color: colors.textSecondary, fontFamily: typography.body.fontFamily, fontSize: 13, lineHeight: 19, fontStyle: 'italic' },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
    progressLabel: { fontFamily: typography.label.fontFamily, fontSize: 10, color: colors.glow, letterSpacing: 1.3 },
    progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.panelSolid, borderWidth: 1, borderColor: colors.borderDim, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: colors.glow },
    stepsComplete: { fontFamily: typography.bodyMuted.fontFamily, fontSize: 11, color: colors.textSecondary },
    steps: { gap: 8, marginTop: 6 },
    stepRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    stepText: { fontFamily: typography.body.fontFamily, color: colors.textPrimary, fontSize: 14, lineHeight: 20, flex: 1 },
    stepTextDone: { color: colors.textMuted, textDecorationLine: 'line-through' },
    overdueActions: { flexDirection: 'row', gap: 9, marginTop: 8 },
    checkOutButton: { flex: 1, borderRadius: 999, paddingVertical: 12, alignItems: 'center', backgroundColor: colors.panelSolid, borderWidth: 1, borderColor: colors.borderDim },
    checkOutText: { fontFamily: typography.label.fontFamily, color: colors.textSecondary, fontSize: 10, letterSpacing: 1.3 },
    extendButton: { flex: 1.3, flexDirection: 'row', gap: 6, borderRadius: 999, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
    extendText: { fontFamily: typography.label.fontFamily, color: colors.glow, fontSize: 10, letterSpacing: 1.1 },
    completedCard: { gap: 6, opacity: 0.78 },
    completedHeading: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    completedLabel: { fontFamily: typography.label.fontFamily, fontSize: 10, color: colors.success, letterSpacing: 1.2 },
    completedTitle: { fontFamily: typography.cardTitle.fontFamily, fontSize: 16, color: colors.textPrimary },
  });
