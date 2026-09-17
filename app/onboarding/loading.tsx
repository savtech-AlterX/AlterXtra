import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { HudScreen } from '../../src/components/HudScreen';
import { IdentityMarkRing } from '../../src/components/IdentityMarkRing';
import { useAppData } from '../../src/store/AppDataContext';
import { AppIconChoice } from '../../src/store/types';
import { useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

const TOTAL_MS = 2800;

// The candidates "flashed through" before settling on the real pick, in the
// same reading order as the choose-icon grid (top-left to bottom-right,
// skipping 'mystery' — an abstract "?" glyph doesn't read as a face being
// tried on). The last slot always shows the identity actually chosen, so the
// ring doesn't visibly jump between this screen's final frame and the home
// hero right after.
const CYCLE_ICONS: AppIconChoice[] = ['male', 'male-mohawk', 'female-curly', 'female'];
const FRAME_MS = TOTAL_MS / CYCLE_ICONS.length;

export default function Loading() {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { data } = useAppData();
  const progress = useRef(new Animated.Value(0)).current;
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: TOTAL_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const frameTimer = setInterval(() => {
      setFrame((f) => Math.min(f + 1, CYCLE_ICONS.length - 1));
    }, FRAME_MS);

    const timer = setTimeout(() => router.replace('/(tabs)'), 3000);
    return () => {
      clearInterval(frameTimer);
      clearTimeout(timer);
    };
  }, []);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const isLastFrame = frame === CYCLE_ICONS.length - 1;
  const shownIcon = isLastFrame ? data.identity?.icon ?? CYCLE_ICONS[frame] : CYCLE_ICONS[frame];

  return (
    <HudScreen scroll={false}>
      <View style={styles.flexWrap}>
        <View style={styles.center}>
          <IdentityMarkRing size={110} style={styles.mark} icon={shownIcon} />
          <View style={styles.barTrack}>
            <Animated.View style={[styles.barFill, { width }]} />
          </View>
          <Text style={styles.label}>REPROGRAMMING IDENTITY...</Text>
        </View>
        <View style={styles.dots}>
          {CYCLE_ICONS.map((_, i) => (
            <View key={i} style={[styles.dot, i === frame && styles.dotActive]} />
          ))}
        </View>
      </View>
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  flexWrap: {
    flex: 1,
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
  dots: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 8,
    paddingBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderDim,
  },
  dotActive: {
    backgroundColor: colors.glow,
    shadowColor: colors.glow,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
});
