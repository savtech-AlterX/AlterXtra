import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { HudScreen } from '../../src/components/HudScreen';
import { wordmarkSource } from '../../src/lib/avatar';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

const REVEAL_MS = 900;
const HOLD_MS = 350;

// The very first thing a new user sees: a dim, powered-down-looking screen
// that only comes alive once they touch it — like a HUD booting up rather
// than an app just appearing. The tap itself is the "turn the exposure up"
// gesture she asked for.
export default function Wake() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const [waking, setWaking] = useState(false);

  const pulse = useRef(new Animated.Value(0)).current;
  const dim = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  function wake() {
    if (waking) return;
    setWaking(true);
    Animated.timing(glow, {
      toValue: 1,
      duration: REVEAL_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    Animated.timing(dim, {
      toValue: 0,
      duration: REVEAL_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => router.replace('/onboarding/icon'), HOLD_MS);
    });
  }

  const promptOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.9] });
  const glowRadius = glow.interpolate({ inputRange: [0, 1], outputRange: [10, 34] });
  const wordmarkScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });

  return (
    <Pressable style={styles.fill} onPress={wake} accessibilityRole="button" accessibilityLabel="Tap to begin">
      <HudScreen scroll={false} style={styles.screen}>
        <View style={styles.center}>
          <Animated.View style={{ transform: [{ scale: wordmarkScale }] }}>
            <Animated.Image
              source={wordmarkSource()}
              style={[
                styles.wordmarkImage,
                {
                  tintColor: colors.glow,
                  shadowColor: colors.glow,
                  shadowRadius: glowRadius,
                },
              ]}
              resizeMode="contain"
            />
          </Animated.View>
          <Text style={styles.subtitle}>IDENTITY TRANSFORMATION</Text>
        </View>
      </HudScreen>

      {/* Sits above the wordmark so it starts almost fully hidden, then fades
          away on tap — the "exposure turning up" reveal. Rendered before the
          prompt below so the prompt always stays visible on top of it. */}
      <Animated.View pointerEvents="none" style={[styles.dimOverlay, { opacity: dim }]} />

      {!waking && (
        <Animated.Text style={[styles.prompt, { opacity: promptOpacity }]}>TAP TO BEGIN</Animated.Text>
      )}
    </Pressable>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: '#000000',
  },
  screen: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  center: {
    alignItems: 'center',
    gap: 8,
  },
  wordmarkImage: {
    width: 220,
    height: 42,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
  },
  subtitle: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    letterSpacing: 4,
    color: colors.glowStrong,
  },
  prompt: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 64,
    textAlign: 'center',
    fontFamily: typography.label.fontFamily,
    fontSize: 12,
    letterSpacing: 3,
    color: colors.glow,
  },
  dimOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
});
