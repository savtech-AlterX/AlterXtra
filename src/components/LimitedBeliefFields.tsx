import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlowCard } from './GlowCard';
import { HudTextInput } from './HudTextInput';
import { useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

type Props = {
  belief: string;
  onBeliefChange: (v: string) => void;
  origin: string;
  onOriginChange: (v: string) => void;
  replacement: string;
  onReplacementChange: (v: string) => void;
};

function Question({
  number,
  prompt,
  value,
  onChangeText,
}: {
  number: number;
  prompt: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <GlowCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{number}</Text>
        </View>
        <Text style={styles.prompt}>{prompt}</Text>
      </View>
      <HudTextInput
        placeholder="Type your answer here..."
        value={value}
        onChangeText={onChangeText}
        multiline
      />
    </GlowCard>
  );
}

export function LimitedBeliefFields({
  belief,
  onBeliefChange,
  origin,
  onOriginChange,
  replacement,
  onReplacementChange,
}: Props) {
  return (
    <View style={{ gap: 16 }}>
      <Question number={1} prompt="What is a limited belief you hold?" value={belief} onChangeText={onBeliefChange} />
      <Question
        number={2}
        prompt="Where did this false belief originate?"
        value={origin}
        onChangeText={onOriginChange}
      />
      <Question
        number={3}
        prompt="What is now the replacement belief?"
        value={replacement}
        onChangeText={onReplacementChange}
      />
    </View>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  card: {
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: typography.cardTitle.fontFamily,
    color: colors.textPrimary,
    fontSize: 13,
  },
  prompt: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
});
