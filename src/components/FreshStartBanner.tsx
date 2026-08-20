import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { freshStartKind } from '../lib/freshStart';
import { GlowCard } from './GlowCard';
import { useAppData } from '../store/AppDataContext';
import { useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

/**
 * Shows on real temporal landmarks (Monday, the 1st of the month) — see
 * freshStart.ts for why those specifically. Deliberately not a one-time
 * dismissible popup: it's a pure function of today's date, so it reappears
 * every time Home loads on a landmark day, matching how the fresh-start
 * effect actually works (the whole day carries the motivational lift, not
 * just the first time you notice it).
 */
export function FreshStartBanner() {
  const styles = useThemedStyles(makeStyles);
  const { data } = useAppData();
  const kind = freshStartKind();
  const archetype = data.identity?.archetype;

  if (!kind || !archetype) return null;

  return (
    <GlowCard strong style={styles.card}>
      <Text style={styles.eyebrow}>FRESH START</Text>
      <Text style={styles.heading}>{kind === 'month' ? 'NEW MONTH. NEW CHAPTER.' : 'NEW WEEK. NEW CHAPTER.'}</Text>
      <Text style={styles.body}>
        Today's a clean page for {archetype}. Whatever last {kind === 'month' ? 'month' : 'week'} looked like, it
        doesn't decide this one.
      </Text>
    </GlowCard>
  );
}

const makeStyles = ({ colors, typography, glowShadow }: AppTheme) =>
  StyleSheet.create({
    card: {
      gap: 4,
    },
    eyebrow: {
      fontFamily: typography.label.fontFamily,
      fontSize: 11,
      color: colors.glowStrong,
      letterSpacing: 2,
    },
    heading: {
      fontFamily: typography.cardTitle.fontFamily,
      fontSize: 17,
      color: colors.textPrimary,
      marginTop: 2,
      ...glowShadow,
    },
    body: {
      fontFamily: typography.body.fontFamily,
      fontSize: 13,
      lineHeight: 19,
      color: colors.textSecondary,
      marginTop: 6,
    },
  });
