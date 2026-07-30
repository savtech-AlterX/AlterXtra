import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GlowCard } from '../../src/components/GlowCard';
import { HudScreen } from '../../src/components/HudScreen';
import { useAppData } from '../../src/store/AppDataContext';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

export default function Goals() {
  const router = useRouter();
  const { data } = useAppData();

  return (
    <HudScreen>
      <View style={styles.header}>
        <Text style={typography.screenTitle}>GOALS</Text>
        <Pressable style={styles.addButton} onPress={() => router.push('/goals/new')}>
          <Ionicons name="add" size={22} color={colors.glow} />
        </Pressable>
      </View>

      {data.goals.length === 0 && (
        <GlowCard style={styles.emptyCard}>
          <Ionicons name="flag-outline" size={36} color={colors.glow} />
          <Text style={styles.emptyText}>
            No objectives yet. Tap + to set your primary objective and step plan.
          </Text>
        </GlowCard>
      )}

      {data.goals.map((goal) => (
        <GlowCard key={goal.id} style={styles.goalCard}>
          <Text style={styles.goalLabel}>PRIMARY OBJECTIVE</Text>
          <Text style={styles.goalTitle}>{goal.objective}</Text>
          <Text style={styles.goalDate}>TARGET: {goal.targetDate}</Text>
          <View style={styles.steps}>
            {goal.steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.glow} />
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </GlowCard>
      ))}
    </HudScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  emptyCard: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 32,
  },
  emptyText: {
    fontFamily: typography.bodyMuted.fontFamily,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  goalCard: {
    gap: 6,
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
  },
  goalDate: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  steps: {
    gap: 6,
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
  },
});
