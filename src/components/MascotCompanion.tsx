import React, { useCallback, useEffect, useRef, useState } from 'react';
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

const WALK_SPEED = 30; // px per second
const STEP_MS = 300; // one stride, so the bob reads as footfalls
const BOB_HEIGHT = 3.5;
const LEAN_DEG = 2.5;
const IDLE_MIN_MS = 2000;
const IDLE_MAX_MS = 5200;
const WALK_MIN_MS = 2500;
const WALK_MAX_MS = 6000;
const MESSAGE_VISIBLE_MS = 4000;

function randBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/**
 * A companion that walks the floor.
 *
 * The art is a single static image, so there are no moving legs to animate —
 * the sense of walking has to come from motion cues instead:
 *   - a contact shadow pinned to the floor line, which never bobs, so the
 *     figure reads as standing ON something rather than hovering over it
 *   - a footfall bob that runs ONLY while travelling; standing still means
 *     standing perfectly still (a bob while stationary is what made the
 *     earlier version look like it was floating)
 *   - the shadow tightening on each footfall, and a slight forward lean
 */
export function MascotCompanion() {
  const styles = useThemedStyles(makeStyles);
  const { data } = useAppData();
  const { theme } = useThemeControls();
  const { settings, isLoaded } = useSettings();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const floor = insets.bottom + 10;
  const maxX = Math.max(0, width - FIGURE_WIDTH);

  const x = useRef(new Animated.Value(maxX / 2)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const xValue = useRef(maxX / 2);
  const [facingLeft, setFacingLeft] = useState(false);
  const [walking, setWalking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const messageTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const walkAnim = useRef<Animated.CompositeAnimation | null>(null);
  const bobLoop = useRef<Animated.CompositeAnimation | null>(null);

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

    function stand() {
      if (cancelled) return;
      setWalking(false);
      phaseTimer.current = setTimeout(walk, randBetween(IDLE_MIN_MS, IDLE_MAX_MS));
    }

    function walk() {
      if (cancelled) return;
      const from = xValue.current;
      const reach = (WALK_SPEED * randBetween(WALK_MIN_MS, WALK_MAX_MS)) / 1000;
      const direction = Math.random() < 0.5 ? -1 : 1;
      // Keep it on screen: fold the target back inside the bounds.
      let target = from + direction * reach;
      if (target < 0) target = Math.min(maxX, Math.abs(target));
      if (target > maxX) target = Math.max(0, maxX - (target - maxX));

      const distance = Math.abs(target - from);
      if (distance < 4) {
        stand();
        return;
      }

      setFacingLeft(target < from);
      setWalking(true);

      walkAnim.current = Animated.timing(x, {
        toValue: target,
        duration: (distance / WALK_SPEED) * 1000,
        easing: Easing.inOut(Easing.quad), // ease off the mark and settle, not a constant glide
        useNativeDriver: false,
      });
      walkAnim.current.start(({ finished }) => {
        if (finished && !cancelled) stand();
      });
    }

    stand();
    return () => {
      cancelled = true;
      if (phaseTimer.current) clearTimeout(phaseTimer.current);
      walkAnim.current?.stop();
    };
  }, [visible, maxX, x]);

  // Footfall bob — only while actually travelling.
  useEffect(() => {
    bobLoop.current?.stop();
    if (!visible || !walking) {
      Animated.timing(bob, { toValue: 0, duration: 120, useNativeDriver: false }).start();
      return;
    }
    bobLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
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
    bobLoop.current.start();
    return () => bobLoop.current?.stop();
  }, [visible, walking, bob]);

  useEffect(() => {
    return () => {
      if (messageTimeout.current) clearTimeout(messageTimeout.current);
    };
  }, []);

  const handlePress = useCallback(() => {
    const stats = computeGrowthStats(data);
    setMessage(pickMascotMessage(buildMascotMessagePool(stats)));
    if (messageTimeout.current) clearTimeout(messageTimeout.current);
    messageTimeout.current = setTimeout(() => setMessage(null), MESSAGE_VISIBLE_MS);
  }, [data]);

  if (!visible) return null;

  const lift = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -BOB_HEIGHT] });
  // Shadow tightens as the figure rises, as if pushing off the floor.
  const shadowScale = bob.interpolate({ inputRange: [0, 1], outputRange: [1, 0.72] });
  const shadowOpacity = bob.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.26] });
  const lean = `${(facingLeft ? 1 : -1) * (walking ? LEAN_DEG : 0)}deg`;

  return (
    <View pointerEvents="box-none" style={[styles.layer, { bottom: floor }]}>
      <Animated.View pointerEvents="box-none" style={[styles.column, { transform: [{ translateX: x }] }]}>
        {message && (
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{message}</Text>
          </View>
        )}

        {/* Rises and falls with the stride. */}
        <Animated.View style={{ transform: [{ translateY: lift }, { rotate: lean }] }}>
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

        {/* Stays welded to the floor line — the cue that it isn't hovering. */}
        <Animated.View
          pointerEvents="none"
          style={[styles.shadow, { opacity: shadowOpacity, transform: [{ scaleX: shadowScale }] }]}
        />
      </Animated.View>
    </View>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
    layer: {
      position: 'absolute',
      left: 0,
      right: 0,
      zIndex: 50,
    },
    column: {
      width: FIGURE_WIDTH,
      alignItems: 'center',
    },
    figureButton: {
      width: FIGURE_WIDTH,
      height: FIGURE_HEIGHT,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    figure: {
      width: FIGURE_WIDTH,
      height: FIGURE_HEIGHT,
    },
    shadow: {
      width: FIGURE_WIDTH * 0.52,
      height: 5,
      borderRadius: 3,
      marginTop: -2,
      backgroundColor: colors.glow,
    },
    bubble: {
      position: 'absolute',
      left: 0,
      bottom: FIGURE_HEIGHT + 12,
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
