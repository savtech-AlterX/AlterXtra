import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { HudScreen } from '../../src/components/HudScreen';
import { IdentityMarkRing } from '../../src/components/IdentityMarkRing';
import { useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

export default function Loading() {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => router.replace('/(tabs)'), 3000);
    return () => clearTimeout(timer);
  }, []);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <HudScreen scroll={false}>
      <View style={styles.center}>
        {/* A charismatic smirk while the identity data is being written — a
            small "trust me" beat instead of a blank stare. Animated so it
            plays as an expression forming, not just a different drawing
            that was already there when the screen mounted. */}
        <IdentityMarkRing size={110} style={styles.mark} expression="smile" animated />
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
