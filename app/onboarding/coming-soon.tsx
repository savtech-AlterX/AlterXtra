import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { HudScreen } from '../../src/components/HudScreen';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

const MASCOT = require('../../assets/coming-soon-mascot.png');
const MASCOT_ASPECT = 865 / 490;

// The very first thing a new user sees on opening the app — a teaser for the
// full AlterXtra roster before onboarding starts. Advances on tap rather
// than a timer, since there's no progress happening yet for a countdown to
// track.
export default function ComingSoon() {
  const { colors, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();

  return (
    <HudScreen scroll={false} style={styles.screen}>
      <View style={styles.center}>
        <Image source={MASCOT} style={styles.mascot} resizeMode="contain" />
      </View>
      <Pressable
        style={styles.continueButton}
        onPress={() => router.replace('/onboarding/icon')}
        accessibilityRole="button"
        accessibilityLabel="Continue"
      >
        <Text style={styles.continueLabel}>TAP TO CONTINUE</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.glow} style={iconGlow} />
      </Pressable>
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
  screen: {
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascot: {
    width: '100%',
    aspectRatio: MASCOT_ASPECT,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  continueLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 13,
    letterSpacing: 3,
    color: colors.glow,
  },
});
