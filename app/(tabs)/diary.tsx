import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { GlowCard } from '../../src/components/GlowCard';
import { HudScreen } from '../../src/components/HudScreen';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

export default function DiaryHub() {
  const router = useRouter();

  return (
    <HudScreen>
      <Text style={typography.screenTitle}>DIARY</Text>
      <Text style={styles.subtitle}>YOUR INNER WORLD</Text>

      <GlowCard style={styles.card} onPress={() => router.push('/diary/journal')}>
        <Ionicons name="book" size={40} color={colors.glow} />
        <Text style={[typography.cardTitle, styles.cardTitle]}>JOURNAL</Text>
        <Text style={styles.cardSubtitle}>PERSONAL REFLECTIONS</Text>
      </GlowCard>

      <GlowCard style={styles.card} onPress={() => router.push('/diary/future-self')}>
        <Ionicons name="sparkles" size={40} color={colors.glow} />
        <Text style={[typography.cardTitle, styles.cardTitle]}>FUTURE SELF</Text>
        <Text style={styles.cardSubtitle}>LETTERS FORWARD IN TIME</Text>
      </GlowCard>
    </HudScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontFamily: typography.label.fontFamily,
    fontSize: 12,
    color: colors.glow,
    letterSpacing: 3,
    marginTop: -8,
  },
  card: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  cardTitle: {
    marginTop: 8,
    fontSize: 20,
  },
  cardSubtitle: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    color: colors.glow,
    letterSpacing: 2,
  },
});
