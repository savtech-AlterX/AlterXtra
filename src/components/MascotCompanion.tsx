import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData } from '../store/AppDataContext';
import { useSettings } from '../store/SettingsContext';
import { useThemeControls } from '../theme/ThemeContext';
import { computeGrowthStats } from '../lib/growth';
import { buildMascotMessagePool, pickMascotMessage } from '../lib/mascotMessages';
import { AVATAR_ASPECT, avatarSource } from '../lib/avatar';
import { useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

const FIGURE_WIDTH = 62;
const FIGURE_HEIGHT = FIGURE_WIDTH * AVATAR_ASPECT;

const WALK_SPEED = 26; // px per second
const STEP_MS = 320; // one stride
const BOB_HEIGHT = 4;
const IDLE_MIN_MS = 1800;
const IDLE_MAX_MS = 5000;
const WALK_MIN_MS = 2500;
const WALK_MAX_MS = 6000;
const MESSAGE_VISIBLE_MS = 4000;

type Phase = 'idle' | 'walking';

function randBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/**
 * A companion that actually walks the floor rather than drifting.
 * It paces left and right along the bottom of the screen, taking strides
 * (a small vertical bob synced to footfalls) and pausing to idle, and it
 * flips to face whichever way it's heading.
 */
export function MascotCompanion() {
  const styles = useThemedStyles(makeStyles);
  const { data } = useAppData();
  const { theme } = useThemeControls();
  const { settings, isLoaded } = useSettings();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const floor = insets.bottom + 12;
  const maxX = Math.max(0, width - FIGURE_WIDTH);

  const x = useRef(new Animated.Value(maxX / 2)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const xValue = useRef(maxX / 2);
  const [facingLeft, setFacingLeft] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const messageTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const walkAnim = useRef<Animated.CompositeAnimation | null>(null);

  const visible = isLoaded && settings.mascotEnabled && !!data.identity;

  useEffect(() => {
    const id = x.addListener(({ value }) => {
      xValue.current = value;
    });
    return () => x.removeListener(id);
  }, [x]);

  // Alternate between standing still and walking to a new spot on the floor.
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;

    function schedule(phase: Phase) {
      if (cancelled) return;
      if (phase === 'idle') {
        phaseTimer.current = setTimeout(() => schedule('walking'), randBetween(IDLE_MIN_MS, IDLE_MAX_MS));
        return;
      }

      const from = xValue.current;
      const duration = randBetween(WALK_MIN_MS, WALK_MAX_MS);
      const reach = (WALK_SPEED * duration) / 1000;
      const direction = Math.random() < 0.5 ? -1 : 1;
      // Keep it on screen: bounce the target back inside the bounds.
      let target = from + direction * reach;
      if (target < 0) target = Math.min(maxX, Math.abs(target));
      if (target > maxX) target = Math.max(0, maxX - (target - maxX));

      setFacingLeft(target < from);

      const distance = Math.abs(target - from);
      const realDuration = (distance / WALK_SPEED) * 1000;

      walkAnim.current = Animated.timing(x, {
        toValue: target,
        duration: realDuration,
        easing: Easing.linear,
        useNativeDriver: false,
      });
      walkAnim.current.start(({ finished }) => {
        if (finished && !cancelled) schedule('idle');
      });
    }

    schedule('idle');
    return () => {
      cancelled = true;
      if (phaseTimer.current) clearTimeout(phaseTimer.current);
      walkAnim.current?.stop();
    };
  }, [visible, maxX, x]);

  // Footfall bob, running continuously so strides read as steps.
  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: -BOB_HEIGHT,
          duration: STEP_MS / 2,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: STEP_MS / 2,
          easing: Easing.in(Easing.quad),
          useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible, bob]);

  useEffect(() => {
    return () => {
      if (messageTimeout.current) clearTimeout(messageTimeout.current);
    };
  }, []);

  if (!visible) return null;

  function handlePress() {
    const stats = computeGrowthStats(data);
    const pool = buildMascotMessagePool(stats);
    setMessage(pickMascotMessage(pool));
    if (messageTimeout.current) clearTimeout(messageTimeout.current);
    messageTimeout.current = setTimeout(() => setMessage(null), MESSAGE_VISIBLE_MS);
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrapper, { bottom: floor, transform: [{ translateX: x }, { translateY: bob }] }]}
    >
      {message && (
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{message}</Text>
        </View>
      )}
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel="AlterX companion — tap for a message"
        style={styles.figureButton}
      >
        <Image
          source={avatarSource(data.identity?.icon, theme)}
          style={[styles.figure, { transform: [{ scaleX: facingLeft ? -1 : 1 }] }]}
          resizeMode="contain"
        />
      </Pressable>
    </Animated.View>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    width: FIGURE_WIDTH,
    alignItems: 'center',
    zIndex: 50,
  },
  figureButton: {
    width: FIGURE_WIDTH,
    height: FIGURE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  figure: {
    width: FIGURE_WIDTH,
    height: FIGURE_HEIGHT,
  },
  bubble: {
    position: 'absolute',
    left: 0,
    bottom: FIGURE_HEIGHT + 8,
    width: 180,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panelSolid,
  },
  bubbleText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 12,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 17,
  },
});
