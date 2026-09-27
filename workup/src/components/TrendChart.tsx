import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { colors } from '../theme/colors';
import type { ProgressEntry } from '../types';

type Props = {
  entries: ProgressEntry[]; // must be sorted oldest first
};

const CHART_HEIGHT = 120;
const PADDING = 16;

export function TrendChart({ entries }: Props) {
  const points = entries.filter((entry) => entry.bodyWeightKg != null) as (ProgressEntry & { bodyWeightKg: number })[];

  if (points.length < 2) return null;

  const weights = points.map((p) => p.bodyWeightKg);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const range = maxWeight - minWeight || 1;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Body weight</Text>
        <Text style={styles.range}>
          {minWeight.toFixed(1)}–{maxWeight.toFixed(1)} kg
        </Text>
      </View>
      <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 300 ${CHART_HEIGHT}`}>
        <Line x1={0} y1={CHART_HEIGHT - PADDING} x2={300} y2={CHART_HEIGHT - PADDING} stroke={colors.border} strokeWidth={1} />
        <Polyline
          points={points
            .map((p, i) => {
              const x = (i / (points.length - 1)) * 300;
              const y = PADDING + (1 - (p.bodyWeightKg - minWeight) / range) * (CHART_HEIGHT - PADDING * 2);
              return `${x},${y}`;
            })
            .join(' ')}
          fill="none"
          stroke={colors.accent}
          strokeWidth={2}
        />
        {points.map((p, i) => {
          const x = (i / (points.length - 1)) * 300;
          const y = PADDING + (1 - (p.bodyWeightKg - minWeight) / range) * (CHART_HEIGHT - PADDING * 2);
          return <Circle key={p.id} cx={x} cy={y} r={3} fill={colors.accent} />;
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontWeight: '700',
  },
  range: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
