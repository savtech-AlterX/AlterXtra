import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { GlowButton } from '../src/components/GlowButton';
import { GlowCard } from '../src/components/GlowCard';
import { HudScreen } from '../src/components/HudScreen';
import { StackHeader } from '../src/components/StackHeader';
import { FREE_HABIT_LIMIT } from '../src/lib/premium';
import { useAppData } from '../src/store/AppDataContext';
import { useAppTheme, useThemedStyles } from '../src/theme/useAppTheme';
import type { AppTheme } from '../src/theme/useAppTheme';

const PERKS = [`Unlimited habit reprograms (free plan stops at ${FREE_HABIT_LIMIT})`];

export default function Upgrade() {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { data, setPremium } = useAppData();
  const router = useRouter();

  function unlock() {
    setPremium(true);
    Alert.alert(
      'Premium unlocked',
      'Real in-app purchases aren’t connected yet, so this just flips the local switch for testing. Set up App Store Connect subscription products before release.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }

  function relock() {
    setPremium(false);
  }

  return (
    <HudScreen>
      <StackHeader title="PREMIUM" />

      <GlowCard style={styles.card}>
        <Text style={typography.label}>{data.isPremium ? 'PREMIUM ACTIVE' : 'FREE PLAN'}</Text>
        {PERKS.map((perk) => (
          <View key={perk} style={styles.perkRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} style={iconGlow} />
            <Text style={styles.perkText}>{perk}</Text>
          </View>
        ))}
      </GlowCard>

      {data.isPremium ? (
        <GlowButton
          label="TURN OFF PREMIUM (TEST)"
          variant="outline"
          onPress={relock}
        />
      ) : (
        <GlowButton label="UNLOCK PREMIUM" onPress={unlock} />
      )}

      <Text style={styles.note}>
        This screen is a placeholder switch, not a real purchase flow. Wiring it to App Store / Play Store
        subscriptions requires setting up in-app purchase products in App Store Connect (and, typically, a
        purchase SDK like RevenueCat or expo-in-app-purchases).
      </Text>
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
    card: {
      gap: 10,
    },
    perkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    perkText: {
      flex: 1,
      fontFamily: typography.body.fontFamily,
      fontSize: 14,
      lineHeight: 20,
      color: colors.textPrimary,
    },
    note: {
      fontFamily: typography.bodyMuted.fontFamily,
      fontSize: 12,
      lineHeight: 17,
      color: colors.textMuted,
    },
  });
