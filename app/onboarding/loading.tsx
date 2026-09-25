import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { HudScreen } from '../../src/components/HudScreen';
import { IdentityMarkRing } from '../../src/components/IdentityMarkRing';
import { useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

const TOTAL_MS = 2800;

export default function Loading() {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;
  const bannerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: TOTAL_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    Animated.timing(bannerOpacity, {
      toValue: 1,
      duration: 500,
      delay: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => router.replace('/onboarding/xtra-teaser'), 3000);
    return () => clearTimeout(timer);
  }, []);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <HudScreen scroll={false}>
      <Animated.View style={[styles.banner, { opacity: bannerOpacity }]}>
        <Text style={styles.bannerText}>ALTERXTRA IS COMING SOON</Text>
      </Animated.View>
      <View style={styles.center}>
        <IdentityMarkRing size={110} style={styles.mark} />
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, { width }]} />
        </View>
        <Text style={styles.label}>REPROGRAMMING IDENTITY...</Text>
      </View>
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  banner: {
    position: 'absolute',
    top: '14%',
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: colors.glowStrong,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: colors.panelSolid,
    shadowColor: colors.glow,
    shadowOpacity: 0.8,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  bannerText: {
    fontFamily: typography.screenTitle.fontFamily,
    fontSize: 13,
    letterSpacing: 2,
    textAlign: 'center',
    color: colors.textPrimary,
    ...glowShadow,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  mark: {
    opacity: 0.7,
  },
  barTrack: {
    width: '70%',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.panelSolid,
    borderWidth: 1,
    borderColor: colors.borderDim,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.glow,
  },
  label: {
    fontFamily: typography.label.fontFamily,
    fontSize: 12,
    color: colors.glow,
    letterSpacing: 3,
  },
});
