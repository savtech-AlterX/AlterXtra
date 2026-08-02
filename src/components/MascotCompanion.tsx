import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData } from '../store/AppDataContext';
import { MascotColor, useSettings } from '../store/SettingsContext';
import { computeGrowthStats } from '../lib/growth';
import { buildMascotMessagePool, pickMascotMessage } from '../lib/mascotMessages';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const SIZE = 56;
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
  const insets = useSafeAreaInsets();

  const blink = useRef(new Animated.Value(1)).current;
  const [message, setMessage] = useState<string | null>(null);
  const messageTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visible = isLoaded && settings.mascotEnabled && !!data.identity;

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
    <View pointerEvents="box-none" style={[styles.wrapper, { left: 16, bottom: insets.bottom + 100 }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    width: SIZE,
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
    left: 0,
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
