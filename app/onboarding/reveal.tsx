import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { HudScreen } from '../../src/components/HudScreen';
import { useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

const MASCOT = require('../../assets/coming-soon-mascot.png');
const MASCOT_ASPECT = 865 / 490;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FLY_MS = 4200;
const BOB_MS = 900;

// A one-time flourish after onboarding finishes: a plane tows a banner
// across the screen — the Scarface "the world is yours" plane beat, on
// brand (glowing HUD blue on black, not a literal blue-sky recreation).
export default function Reveal() {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const flyAcross = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(flyAcross, {
      toValue: 1,
      duration: FLY_MS,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: BOB_MS, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: BOB_MS, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    const timer = setTimeout(() => router.replace('/(tabs)'), FLY_MS + 400);
    return () => clearTimeout(timer);
  }, []);

  // Start just off the right edge, end just far enough past the left edge to
  // fully clear the rig's own width (~260: plane + tether + banner) — not a
  // full screen-width further, which left the second half of the animation
  // sitting on empty black after the rig had already exited.
  const translateX = flyAcross.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_WIDTH + 40, -300],
  });
  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });

  return (
    <HudScreen scroll={false} style={styles.screen}>
      <View style={styles.flightArea}>
        <Animated.View style={[styles.rig, { transform: [{ translateX }, { translateY }] }]}>
          <Ionicons name="airplane" size={30} color="#eaf6ff" style={styles.plane} />
          <View style={styles.tether} />
          <View style={styles.banner}>
            <Text style={styles.bannerText}>OUTER WORLD{'\n'}FOLLOWS{'\n'}INNER WORLD</Text>
          </View>
        </Animated.View>
      </View>
      <Image source={MASCOT} style={styles.mascot} resizeMode="contain" />
    </HudScreen>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
  },
  flightArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mascot: {
    width: 170,
    aspectRatio: MASCOT_ASPECT,
    marginBottom: 16,
  },
  rig: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plane: {
    textShadowColor: '#eaf6ff',
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
    transform: [{ rotate: '180deg' }],
  },
  tether: {
    width: 36,
    height: 1,
    backgroundColor: colors.borderDim,
  },
  banner: {
    width: 190,
    borderWidth: 1.5,
    borderColor: colors.glowStrong,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.panelSolid,
    shadowColor: colors.glow,
    shadowOpacity: 0.8,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  bannerText: {
    fontFamily: typography.screenTitle.fontFamily,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 2,
    textAlign: 'center',
    color: colors.textPrimary,
    ...glowShadow,
  },
});
