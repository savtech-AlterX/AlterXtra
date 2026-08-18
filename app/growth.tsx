import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlowCard } from '../src/components/GlowCard';
import { EmptyState } from '../src/components/EmptyState';
import { HudScreen } from '../src/components/HudScreen';
import { CloseToHome } from '../src/components/CloseToHome';
import { computeGrowthStats, formatDurationShort, GrowthStats } from '../src/lib/growth';
import { useAppData } from '../src/store/AppDataContext';
import { useAppTheme, useThemedStyles } from '../src/theme/useAppTheme';
import type { AppTheme } from '../src/theme/useAppTheme';

function StatCard({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <GlowCard containerStyle={styles.statCardContainer} style={styles.statCard}>
      <Ionicons name={icon} size={20} color={colors.glow} style={iconGlow} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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

function IdentitySessionCard({
  session,
  onStart,
  onStop,
}: {
  session: GrowthStats['identitySession'];
  onStart: () => void;
  onStop: () => void;
}) {
  const { colors, typography, iconGlow } = useAppTheme();
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
    <GlowCard
      strong={!!session.active}
      style={styles.sessionCard}
      onPress={session.active ? onStop : onStart}
    >
      <View style={styles.sessionHeaderRow}>
        <Ionicons
          name={session.active ? 'stop-circle-outline' : 'play-circle-outline'}
          size={28}
          color={colors.glow}
          style={iconGlow}
        />
        <View style={styles.sessionHeaderText}>
          <Text style={styles.sessionTitle}>{session.active ? 'IN IDENTITY' : 'START SESSION'}</Text>
          <Text style={styles.sessionSubtitle}>
            {session.active
              ? `${formatDurationShort(elapsedSeconds)} elapsed · tap to stop`
              : 'Tap to start practicing your identity right now'}
          </Text>
        </View>
      </View>
      <View style={styles.sessionStatsRow}>
        <Text style={styles.sessionStat}>{session.currentStreakDays}d streak</Text>
        <Text style={styles.sessionStat}>{session.todaySessions} today</Text>
        <Text style={styles.sessionStat}>{formatDurationShort(session.totalSeconds)} total</Text>
      </View>
    </GlowCard>
  );
}

export default function Growth() {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { data, startIdentitySession, stopIdentitySession } = useAppData();
  const stats = useMemo(() => computeGrowthStats(data), [data]);

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
        <Text style={styles.heroValue}>{stats.daysSinceStart ?? '—'}</Text>
        <Text style={styles.heroLabel}>DAYS SINCE YOU BEGAN</Text>
      </GlowCard>

      <IdentitySessionCard
        session={stats.identitySession}
        onStart={startIdentitySession}
        onStop={stopIdentitySession}
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
            <StatCard icon="bulb-outline" value={String(stats.beliefsRewired)} label="Beliefs Rewired" />
            <StatCard icon="repeat-outline" value={String(stats.habitsReprogrammed)} label="Habits Reprogrammed" />
            <StatCard icon="flag-outline" value={`${stats.goalsCompleted}/${stats.goalsTotal}`} label="Goals Completed" />
            <StatCard
              icon="videocam-outline"
              value={`${stats.futureSelf.videosUnlocked}/${stats.futureSelf.videosSealed}`}
              label="Future Self Unlocked"
            />
          </View>

          {stats.habitFollowThrough.total > 0 && (
            <GlowCard style={styles.card}>
              <Text style={typography.label}>HABIT FOLLOW-THROUGH</Text>
              <AlignmentBar
                label="ALL CHECK-INS"
                aligned={stats.habitFollowThrough.followed}
                total={stats.habitFollowThrough.total}
                unit="followed through"
              />
            </GlowCard>
          )}

          <GlowCard style={styles.card}>
            <Text style={typography.label}>ALIGNMENT</Text>
            <AlignmentBar
              label="THIS WEEK"
              aligned={stats.alignment.thisWeek.aligned}
              total={stats.alignment.thisWeek.total}
            />
            <AlignmentBar
              label="LAST WEEK"
              aligned={stats.alignment.lastWeek.aligned}
              total={stats.alignment.lastWeek.total}
            />
          </GlowCard>

          {stats.journalThenNow && (
            <GlowCard style={styles.card}>
              <Text style={typography.label}>THEN VS NOW</Text>
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
  sessionCard: {
    gap: 14,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sessionHeaderText: {
    flex: 1,
    gap: 2,
  },
  sessionTitle: {
    fontFamily: typography.label.fontFamily,
    fontSize: 13,
    letterSpacing: 2,
    color: colors.textPrimary,
  },
  sessionSubtitle: {
    fontFamily: typography.bodyMuted.fontFamily,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  sessionStatsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  sessionStat: {
    fontFamily: typography.bodyMuted.fontFamily,
    fontSize: 12,
    color: colors.glow,
  },
  emptyCard: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 32,
  },
  emptyText: {
    fontFamily: typography.bodyMuted.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
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
  card: {
    gap: 12,
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
