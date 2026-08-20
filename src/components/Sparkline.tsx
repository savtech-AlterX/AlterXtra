import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme, useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

type Point = { total: number; rate: number };

const HEIGHT = 56;
const MIN_BAR_HEIGHT = 8;
const NO_DATA_HEIGHT = 4;

// Plain-View bar chart, matching the flat neon-HUD look used everywhere else
// in the app (progressTrack/progressFill) rather than pulling in a charting
// library. Weeks with no log entries get a short dim nub instead of a 0%
// bar, so "no data" reads differently from "0% aligned that week."
export function Sparkline({ points }: { points: Point[] }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.row}>
      {points.map((p, i) => {
        const hasData = p.total > 0;
        const height = hasData ? Math.max(MIN_BAR_HEIGHT, (p.rate / 100) * HEIGHT) : NO_DATA_HEIGHT;
        return (
          <View key={i} style={styles.slot}>
            <View style={styles.track} />
            <View style={[styles.bar, hasData ? styles.barActive : styles.barEmpty, { height }]} />
          </View>
        );
      })}
    </View>
  );
}

const makeStyles = ({ colors }: AppTheme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: HEIGHT,
      gap: 4,
    },
    slot: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      height: HEIGHT,
    },
    // A faint full-height column behind every bar, so an 8-slot week grid
    // reads clearly even when most weeks have no data yet.
    track: {
      ...StyleSheet.absoluteFillObject,
      marginHorizontal: 2,
      borderRadius: 3,
      backgroundColor: colors.panelSolid,
    },
    bar: {
      width: '100%',
      borderRadius: 3,
    },
    barActive: {
      backgroundColor: colors.glow,
    },
    barEmpty: {
      backgroundColor: colors.borderDim,
    },
  });
