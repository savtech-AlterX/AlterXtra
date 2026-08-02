import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useAppData } from '../store/AppDataContext';
import { MascotColor, useSettings } from '../store/SettingsContext';
import { computeGrowthStats } from '../lib/growth';
import { buildMascotMessagePool, pickMascotMessage } from '../lib/mascotMessages';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const SIZE = 56;
const MOVE_INTERVAL_MS = 6000;
const BLINK_INTERVAL_MS = 3200;
const MESSAGE_VISIBLE_MS = 4000;

const COLOR_MAP: Record<MascotColor, string> = {
  blue: colors.glow,
  teal: colors.accentTeal,
  amber: colors.warning,
};

export function MascotCompanion() {
  const { data } = useAppData();
  const { settings, isLoaded } = useSettings();
  const { width, height } = useWindowDimensions();

  const position = useRef(new Animated.ValueXY({ x: width / 2 - SIZE / 2, y: height / 2 - SIZE / 2 })).current;
  const blink = useRef(new Animated.Value(1)).current;
  const [message, setMessage] = useState<string | null>(null);
  const messageTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visible = isLoaded && settings.mascotEnabled && !!data.identity;

  // Wander to a new random point within a safe zone every MOVE_INTERVAL_MS.
  useEffect(() => {
    if (!visible) return;
    const topMargin = 90;
    const bottomMargin = 180;
    const sideMargin = 16;

    function wander() {
      const targetX = sideMargin + Math.random() * Math.max(1, width - SIZE - sideMargin * 2);
      const targetY = topMargin + Math.random() * Math.max(1, height - SIZE - topMargin - bottomMargin);
      Animated.timing(position, {
        toValue: { x: targetX, y: targetY },
        duration: 3200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start();
    }

    wander();
    const interval = setInterval(wander, MOVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [visible, width, height, position]);

  // Idle blink.
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(blink, { toValue: 0.15, duration: 90, useNativeDriver: false }),
        Animated.timing(blink, { toValue: 1, duration: 90, useNativeDriver: false }),
      ]).start();
    }, BLINK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [visible, blink]);

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

  const tint = COLOR_MAP[settings.mascotColor];

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrapper, { transform: position.getTranslateTransform() }]}
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
        style={[styles.face, { borderColor: tint, shadowColor: tint }]}
      >
        <View style={styles.eyesRow}>
          <Animated.View style={[styles.eye, { backgroundColor: tint, transform: [{ scaleY: blink }] }]} />
          <Animated.View style={[styles.eye, { backgroundColor: tint, transform: [{ scaleY: blink }] }]} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SIZE,
    alignItems: 'center',
    zIndex: 50,
  },
  face: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1.5,
    backgroundColor: colors.panelSolid,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  eyesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  eye: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  bubble: {
    position: 'absolute',
    bottom: SIZE + 10,
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
