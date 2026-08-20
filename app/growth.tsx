import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GlowCard } from '../src/components/GlowCard';
import { EmptyState } from '../src/components/EmptyState';
import { HudScreen } from '../src/components/HudScreen';
import { CloseToHome } from '../src/components/CloseToHome';
import { MilestoneCelebration } from '../src/components/MilestoneCelebration';
import { Sparkline } from '../src/components/Sparkline';
import { computeGrowthStats, formatDurationShort, GrowthStats } from '../src/lib/growth';
import { useAppData } from '../src/store/AppDataContext';
import { useSettings } from '../src/store/SettingsContext';
import { useAppTheme, useThemedStyles } from '../src/theme/useAppTheme';
import type { AppTheme } from '../src/theme/useAppTheme';

// Streak-day thresholds that trigger a one-time celebration, largest first
// so the highest one already crossed wins if several are hit at once (e.g.
// importing a backup that jumps the streak straight past two thresholds).
const STREAK_MILESTONES = [365, 100, 30, 7];

function StatCard({
  icon,
  value,
  label,
  recentAdd,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  recentAdd?: number;
}) {
  const { colors, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <GlowCard containerStyle={styles.statCardContainer} style={styles.statCard}>
      <Ionicons name={icon} size={20} color={colors.glow} style={iconGlow} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {!!recentAdd && <Text style={styles.statDelta}>+{recentAdd} this wk</Text>}
    </GlowCard>
  );
}

function AlignmentBar({
  label,
  aligned,
  total,
  unit = 'aligned',
}: {
  label: string;
  aligned: number;
  total: number;
  unit?: string;
}) {
  const styles = useThemedStyles(makeStyles);
  const pct = total === 0 ? 0 : Math.round((aligned / total) * 100);
  return (
    <View style={styles.alignmentRow}>
      <Text style={styles.alignmentLabel}>{label}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.alignmentValue}>
        {total === 0 ? 'No entries' : `${aligned}/${total} ${unit}`}
      </Text>
    </View>
  );
}

function AlignmentTrend({ stats }: { stats: GrowthStats }) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { thisWeek, lastWeek } = stats.alignment;
  const thisRate = thisWeek.total === 0 ? null : Math.round((thisWeek.aligned / thisWeek.total) * 100);
  const lastRate = lastWeek.total === 0 ? null : Math.round((lastWeek.aligned / lastWeek.total) * 100);
  const delta = thisRate !== null && lastRate !== null ? thisRate - lastRate : null;

  return (
    <GlowCard style={styles.card}>
      <View style={styles.trendHeaderRow}>
        <Text style={styles.label}>ALIGNMENT TREND · 8 WEEKS</Text>
        {delta !== null && delta !== 0 && (
          <View style={styles.deltaPill}>
            <Ionicons name={delta > 0 ? 'trending-up' : 'trending-down'} size={12} color={delta > 0 ? colors.success : colors.danger} />
            <Text style={[styles.deltaText, { color: delta > 0 ? colors.success : colors.danger }]}>
              {delta > 0 ? '+' : ''}
              {delta}% vs last wk
            </Text>
          </View>
        )}
      </View>
      <Sparkline points={stats.weeklyTrend} />
      <AlignmentBar label="THIS WEEK" aligned={thisWeek.aligned} total={thisWeek.total} />
      <AlignmentBar label="LAST WEEK" aligned={lastWeek.aligned} total={lastWeek.total} />
    </GlowCard>
  );
}

function IdentitySessionCard({
  session,
  onStart,
  onStop,
  onViewHistory,
}: {
  session: GrowthStats['identitySession'];
  onStart: () => void;
  onStop: () => void;
  onViewHistory: () => void;
}) {
  const { colors, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const [, forceTick] = useState(0);

  // Ticks the elapsed-time label once a second while a session is running.
  useEffect(() => {
    if (!session.active) return;
    const interval = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, [session.active]);

  const elapsedSeconds = session.active
    ? Math.max(0, (Date.now() - new Date(session.active.startedAt).getTime()) / 1000)
    : 0;

  return (
    <GlowCard strong={!!session.active} style={styles.sessionCard}>
      <View style={styles.sessionStatsRow}>
        <View style={styles.sessionStatBlock}>
          <Text style={styles.sessionStatValue}>{session.currentStreakDays}d</Text>
          <Text style={styles.sessionStatLabel}>STREAK</Text>
        </View>
        <View style={styles.sessionStatBlock}>
          <Text style={styles.sessionStatValue}>{session.todaySessions}</Text>
          <Text style={styles.sessionStatLabel}>TODAY</Text>
        </View>
        <View style={styles.sessionStatBlock}>
          <Text style={styles.sessionStatValue}>{formatDurationShort(session.totalSeconds)}</Text>
          <Text style={styles.sessionStatLabel}>TOTAL</Text>
        </View>
        <Pressable
          onPress={onViewHistory}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="View activity calendar"
          style={styles.historyButton}
        >
          <Ionicons name="calendar-outline" size={18} color={colors.glow} style={iconGlow} />
        </Pressable>
      </View>

      <Pressable
        style={[styles.sessionAction, session.active && styles.sessionActionActive]}
        onPress={session.active ? onStop : onStart}
        accessibilityRole="button"
        accessibilityLabel={session.active ? 'Stop identity session' : 'Start identity session'}
      >
        <Ionicons
          name={session.active ? 'stop-circle-outline' : 'play-circle-outline'}
          size={24}
          color={colors.glow}
          style={iconGlow}
        />
        <Text style={styles.sessionActionText}>
          {session.active ? `IN IDENTITY · ${formatDurationShort(elapsedSeconds)} · TAP TO STOP` : 'START SESSION'}
        </Text>
      </Pressable>
    </GlowCard>
  );
}

export default function Growth() {
  const router = useRouter();
  const { typography } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { data, startIdentitySession, stopIdentitySession } = useAppData();
  const { settings, setCelebratedStreakMilestone } = useSettings();
  const stats = useMemo(() => computeGrowthStats(data), [data]);

  const milestoneToCelebrate = STREAK_MILESTONES.find(
    (m) => stats.activeStreakDays >= m && settings.celebratedStreakMilestone < m
  );
  const [dismissedMilestone, setDismissedMilestone] = useState<number | null>(null);
  const showMilestone = milestoneToCelebrate !== undefined && dismissedMilestone !== milestoneToCelebrate;

  const hasAnyProgress =
    stats.beliefsRewired > 0 ||
    stats.habitsReprogrammed > 0 ||
    stats.goalsTotal > 0 ||
    stats.alignment.thisWeek.total > 0 ||
    stats.alignment.lastWeek.total > 0 ||
    stats.futureSelf.letters > 0 ||
    stats.futureSelf.videosSealed > 0 ||
    stats.habitFollowThrough.total > 0;

  return (
    <HudScreen>
      <View style={styles.titleRow}>
        <CloseToHome />
        <Text style={typography.screenTitle}>GROWTH</Text>
      </View>

      <GlowCard strong style={styles.hero}>
        <Text style={styles.heroValue}>{stats.activeStreakDays}</Text>
        <Text style={styles.heroLabel}>DAY ACTIVE STREAK</Text>
        {stats.daysSinceStart !== null && (
          <Text style={styles.heroSubtext}>Started {stats.daysSinceStart} days ago</Text>
        )}
      </GlowCard>

      <IdentitySessionCard
        session={stats.identitySession}
        onStart={startIdentitySession}
        onStop={stopIdentitySession}
        onViewHistory={() => router.push('/calendar')}
      />

      {!hasAnyProgress ? (
        <EmptyState
          icon="trending-up-outline"
          title="NO PROGRESS TO SHOW YET"
          body="Rewire a belief, reprogram a habit, or log a day. This screen fills in as you go, so you can see how far you've come."
        />
      ) : (
        <>
          <View style={styles.grid}>
            <StatCard icon="bulb-outline" value={String(stats.beliefsRewired)} label="Beliefs Rewired" recentAdd={stats.recentAdds.beliefs} />
            <StatCard icon="repeat-outline" value={String(stats.habitsReprogrammed)} label="Habits Reprogrammed" recentAdd={stats.recentAdds.habits} />
            <StatCard icon="flag-outline" value={`${stats.goalsCompleted}/${stats.goalsTotal}`} label="Goals Completed" />
            <StatCard
              icon="videocam-outline"
              value={`${stats.futureSelf.videosUnlocked}/${stats.futureSelf.videosSealed}`}
              label="Future Self Unlocked"
              recentAdd={stats.recentAdds.futureSelfUnlocked}
            />
          </View>

          {stats.habitFollowThrough.total > 0 && (
            <GlowCard style={styles.card}>
              <Text style={styles.label}>HABIT FOLLOW-THROUGH</Text>
              <AlignmentBar
                label="ALL CHECK-INS"
                aligned={stats.habitFollowThrough.followed}
                total={stats.habitFollowThrough.total}
                unit="followed through"
              />
            </GlowCard>
          )}

          <AlignmentTrend stats={stats} />

          {stats.journalThenNow && (
            <GlowCard style={styles.card}>
              <Text style={styles.label}>THEN VS NOW</Text>
              <View style={styles.thenNowBlock}>
                <Text style={styles.thenNowLabel}>
                  THEN · {new Date(stats.journalThenNow.then.createdAt).toLocaleDateString()}
                </Text>
                <Text style={styles.thenNowBody} numberOfLines={4}>
                  {stats.journalThenNow.then.body}
                </Text>
              </View>
              <View style={styles.thenNowBlock}>
                <Text style={styles.thenNowLabel}>
                  NOW · {new Date(stats.journalThenNow.now.createdAt).toLocaleDateString()}
                </Text>
                <Text style={styles.thenNowBody} numberOfLines={4}>
                  {stats.journalThenNow.now.body}
                </Text>
              </View>
            </GlowCard>
          )}
        </>
      )}

      {showMilestone && milestoneToCelebrate !== undefined && (
        <MilestoneCelebration
          days={milestoneToCelebrate}
          onDismiss={() => {
            setCelebratedStreakMilestone(milestoneToCelebrate);
            setDismissedMilestone(milestoneToCelebrate);
          }}
        />
      )}
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  heroValue: {
    fontFamily: typography.screenTitle.fontFamily,
    fontSize: 48,
    color: colors.textPrimary,
    ...glowShadow,
  },
  heroLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 12,
    color: colors.glowStrong,
    letterSpacing: 2,
    marginTop: 4,
  },
  heroSubtext: {
    fontFamily: typography.bodyMuted.fontFamily,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
  },
  label: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    color: colors.glow,
    letterSpacing: 2,
  },
  sessionCard: {
    gap: 14,
  },
  sessionStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  sessionStatBlock: {
    flex: 1,
    gap: 2,
  },
  sessionStatValue: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 17,
    color: colors.textPrimary,
    ...glowShadow,
  },
  sessionStatLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 1.5,
  },
  historyButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sessionActionActive: {
    borderColor: colors.glow,
    backgroundColor: colors.glowDim,
  },
  sessionActionText: {
    fontFamily: typography.label.fontFamily,
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  statCardContainer: {
    width: '47%',
  },
  statCard: {
    gap: 6,
  },
  statValue: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 22,
    color: colors.textPrimary,
    ...glowShadow,
  },
  statLabel: {
    fontFamily: typography.bodyMuted.fontFamily,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  statDelta: {
    fontFamily: typography.label.fontFamily,
    fontSize: 10,
    color: colors.success,
    letterSpacing: 0.5,
  },
  card: {
    gap: 12,
  },
  trendHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deltaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  deltaText: {
    fontFamily: typography.label.fontFamily,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  alignmentRow: {
    gap: 6,
  },
  alignmentLabel: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textPrimary,
  },
  alignmentValue: {
    fontFamily: typography.bodyMuted.fontFamily,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.panelSolid,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.glow,
  },
  thenNowBlock: {
    gap: 4,
  },
  thenNowLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 10,
    color: colors.glow,
    letterSpacing: 1.5,
  },
  thenNowBody: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
});
