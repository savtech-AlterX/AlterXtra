import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { HudScreen } from '../../src/components/HudScreen';
import { IdentityMarkRing } from '../../src/components/IdentityMarkRing';
import { useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

const MASCOT = require('../../assets/coming-soon-mascot.png');
const MASCOT_ASPECT = 865 / 490;
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

    const timer = setTimeout(() => router.replace('/onboarding/reveal'), 3000);
    return () => clearTimeout(timer);
  }, []);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <HudScreen scroll={false}>
      <View style={styles.stack}>
        <Animated.View style={{ opacity: bannerOpacity }}>
          <Image source={MASCOT} style={styles.mascot} resizeMode="contain" />
        </Animated.View>
        <View style={styles.center}>
          <IdentityMarkRing size={90} style={styles.mark} />
          <View style={styles.barTrack}>
            <Animated.View style={[styles.barFill, { width }]} />
          </View>
          <Text style={styles.label}>REPROGRAMMING IDENTITY...</Text>
        </View>
      </View>
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  stack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  mascot: {
    width: 220,
    aspectRatio: MASCOT_ASPECT,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  mark: {
    opacity: 0.7,
  },
  barTrack: {
    width: 200,
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
