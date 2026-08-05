import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { goalCountdown } from '../lib/countdown';
import { Goal } from '../store/types';
import { useAppTheme, useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

const BAR_HEIGHT = 62;
const TICK_MS = 60 * 1000;

/**
 * A thick live countdown bar. The fill drains as the deadline approaches and
 * the goal title sits on top of it, so the bar reads as the goal rather than
 * as a separate widget.
 */
export function GoalCountdownBar({ goal }: { goal: Goal }) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const [now, setNow] = useState(() => new Date());
  const fill = useRef(new Animated.Value(0)).current;

  // Re-tick each minute so the bar is genuinely live, not a static snapshot.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const countdown = goalCountdown(goal, now);
  const remaining = 1 - countdown.elapsedFraction;

  useEffect(() => {
    Animated.timing(fill, {
      toValue: remaining,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [remaining, fill]);

  const width = fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const urgent = countdown.valid && !countdown.expired && countdown.daysLeft <= 7;
  const fillColor = countdown.expired ? colors.danger : urgent ? colors.warning : colors.glow;

  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityLabel={`${goal.objective}, ${countdown.label}`}
    >
      <Animated.View style={[styles.fill, { width, backgroundColor: fillColor }]} />
      <View style={styles.content} pointerEvents="none">
        <Text style={styles.title} numberOfLines={1}>
          {goal.objective}
        </Text>
        <Text style={styles.meta}>{countdown.label}</Text>
      </View>
    </View>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  track: {
    height: BAR_HEIGHT,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panelSolid,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    right: undefined,
    opacity: 0.28,
  },
  content: {
    paddingHorizontal: 16,
    gap: 2,
  },
  title: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 16,
    color: colors.textPrimary,
    ...glowShadow,
  },
  meta: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textSecondary,
  },
});
