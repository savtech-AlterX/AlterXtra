import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useAppData } from '../store/AppDataContext';
import { MascotColor, useSettings } from '../store/SettingsContext';
import { computeGrowthStats } from '../lib/growth';
import { buildMascotMessagePool, pickMascotMessage } from '../lib/mascotMessages';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const FIGURE_WIDTH = 64;
const FIGURE_HEIGHT = FIGURE_WIDTH * 1.67;
const MOVE_INTERVAL_MS = 5500;
const MOVE_DURATION_MS = 3600;
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

  const startX = width / 2 - FIGURE_WIDTH / 2;
  const startY = height * 0.62;
  const position = useRef(new Animated.ValueXY({ x: startX, y: startY })).current;
  const bob = useRef(new Animated.Value(0)).current;
  const [facingLeft, setFacingLeft] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const messageTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastX = useRef(startX);

  const visible = isLoaded && settings.mascotEnabled && !!data.identity;

  // Wander within the lower two-thirds of the screen so it stays mostly clear of headers/hero cards.
  useEffect(() => {
    if (!visible) return;
    const sideMargin = 16;
    const topMargin = height * 0.4;
    const bottomMargin = 170;

    function wander() {
      const targetX = sideMargin + Math.random() * Math.max(1, width - FIGURE_WIDTH - sideMargin * 2);
      const targetY = topMargin + Math.random() * Math.max(1, height - FIGURE_HEIGHT - topMargin - bottomMargin);
      setFacingLeft(targetX < lastX.current);
      lastX.current = targetX;
      Animated.timing(position, {
        toValue: { x: targetX, y: targetY },
        duration: MOVE_DURATION_MS,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start();
    }

    wander();
    const interval = setInterval(wander, MOVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [visible, width, height, position]);

  // Continuous walking bob.
  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: -6, duration: 260, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(bob, { toValue: 0, duration: 260, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
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

  const tint = COLOR_MAP[settings.mascotColor];
  const source = data.identity?.icon === 'female' ? require('../../assets/identity-mark-female.png') : require('../../assets/identity-mark.png');

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          transform: [...position.getTranslateTransform(), { translateY: bob }],
        },
      ]}
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
          source={source}
          style={[
            styles.figure,
            { tintColor: tint, transform: [{ scaleX: facingLeft ? -1 : 1 }] },
          ]}
          resizeMode="contain"
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
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
    shadowColor: colors.glow,
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  bubble: {
    position: 'absolute',
    left: 0,
    bottom: FIGURE_HEIGHT + 10,
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
