import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AVATAR_ASPECT, avatarSource } from '../lib/avatar';
import { useAppData } from '../store/AppDataContext';
import { useThemeControls } from '../theme/ThemeContext';
import { useAppTheme, useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

const RAY_COUNT = 16;
const AVATAR_WIDTH = 150;

type Props = {
  objective: string;
  onDismiss: () => void;
};

/**
 * Full-screen "you did it" moment, in the spirit of an arcade high-score
 * screen: radiating rays, a big headline, and the user's own avatar centre
 * stage. Fires once when the final step of a goal is checked off.
 */
export function GoalCelebration({ objective, onDismiss }: Props) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useAppTheme();
  const { data } = useAppData();
  const { theme } = useThemeControls();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const spin = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  const rayFieldSize = Math.max(width, height) * 1.6;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: false }),
      Animated.spring(pop, { toValue: 1, friction: 5, tension: 70, useNativeDriver: false }),
    ]).start();

    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 24000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [fade, pop, spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Modal visible transparent animationType="none" onRequestClose={onDismiss} statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: fade }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss celebration"
        >
        <View style={styles.rayLayer} pointerEvents="none">
          <Animated.View
            style={[
              styles.rayField,
              { width: rayFieldSize, height: rayFieldSize, transform: [{ rotate }] },
            ]}
          >
            {Array.from({ length: RAY_COUNT }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.raySlot,
                  { transform: [{ rotate: `${(360 / RAY_COUNT) * i}deg` }] },
                ]}
              >
                <View style={[styles.ray, { height: rayFieldSize / 2 }]} />
              </View>
            ))}
          </Animated.View>
        </View>

          <Animated.View
            style={[
              styles.content,
              { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, transform: [{ scale: pop }] },
            ]}
          >
            <Text style={styles.kicker}>GOAL COMPLETE</Text>
            <Text style={styles.objective} numberOfLines={3}>
              {objective}
            </Text>

            <Image
              source={avatarSource(data.identity?.icon)}
              style={[styles.avatar, { tintColor: colors.glow }]}
              resizeMode="contain"
            />

            <Text style={styles.identityLine}>
              {(data.identity?.archetype ?? 'YOU').toUpperCase()}
            </Text>
            <Text style={styles.tapHint}>TAP TO CONTINUE</Text>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // Solid ground; the fade-in is driven by the animated opacity above.
    backgroundColor: colors.background,
    zIndex: 200,
  },
  rayLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rayField: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Each slot spans the full field and is rotated about its own centre, so the
  // bar inside it sweeps out from the middle like a spoke.
  raySlot: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
  },
  ray: {
    width: 46,
    backgroundColor: colors.glow,
    opacity: 0.07,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 6,
  },
  kicker: {
    fontFamily: typography.screenTitle.fontFamily,
    fontSize: 26,
    letterSpacing: 4,
    color: colors.glowStrong,
    textAlign: 'center',
    ...glowShadow,
    textShadowRadius: 20,
  },
  objective: {
    fontFamily: typography.body.fontFamily,
    fontSize: 16,
    lineHeight: 23,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 10,
  },
  avatar: {
    width: AVATAR_WIDTH,
    height: AVATAR_WIDTH * AVATAR_ASPECT,
  },
  identityLine: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 18,
    letterSpacing: 2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 8,
    ...glowShadow,
  },
  tapHint: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.textSecondary,
    marginTop: 18,
  },
});
