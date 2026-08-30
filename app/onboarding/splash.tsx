import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { GlowButton } from '../../src/components/GlowButton';
import { wordmarkSource } from '../../src/lib/avatar';
import { useThemeControls } from '../../src/theme/ThemeContext';
import { HudScreen } from '../../src/components/HudScreen';
import { IdentityMarkRing } from '../../src/components/IdentityMarkRing';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

export default function Splash() {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useAppTheme();
  const { theme } = useThemeControls();
  const router = useRouter();

  return (
    <HudScreen scroll={false}>
      <View style={styles.center}>
        <IdentityMarkRing size={140} />
        <Image source={wordmarkSource()} style={[styles.wordmark, { tintColor: colors.glow }]} resizeMode="contain" />
        <Text style={styles.subtitle}>IDENTITY TRANSFORMATION</Text>
      </View>

      <GlowButton label="BEGIN" onPress={() => router.push('/onboarding/account')} />
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  wordmark: {
    width: 230,
    height: 45,
    marginTop: 10,
  },
  subtitle: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    color: colors.glowStrong,
    letterSpacing: 3,
    marginTop: -8,
  },
});
