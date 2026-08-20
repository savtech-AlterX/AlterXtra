import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet } from 'react-native';
import { useWinFlashRegistration } from '../store/WinFlashContext';
import { useAppTheme } from '../theme/useAppTheme';

const FLASH_IN_MS = 120;
const FLASH_HOLD_MS = 180;
const FLASH_OUT_MS = 500;

/**
 * A quick glow pulse around the screen edge, mounted once at the root so it
 * can flash on top of whatever screen is currently active. Idle at opacity 0
 * and non-interactive — this never blocks touches, it just borrows the
 * screen for a third of a second to say "that counted."
 */
export function WinFlashOverlay() {
  const { colors } = useAppTheme();
  const flashRef = useWinFlashRegistration();
  const opacity = useRef(new Animated.Value(0)).current;
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.().then((enabled) => {
      reducedMotionRef.current = enabled;
    });
  }, []);

  useEffect(() => {
    flashRef.current = () => {
      if (reducedMotionRef.current) {
        // A plain held glow rather than an animated pulse respects the same
        // intent without the motion.
        opacity.setValue(1);
        setTimeout(() => opacity.setValue(0), FLASH_IN_MS + FLASH_HOLD_MS + FLASH_OUT_MS);
        return;
      }
      opacity.stopAnimation();
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: FLASH_IN_MS, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.delay(FLASH_HOLD_MS),
        Animated.timing(opacity, { toValue: 0, duration: FLASH_OUT_MS, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]).start();
    };
    return () => {
      flashRef.current = null;
    };
  }, [flashRef, opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        styles.frame,
        {
          opacity,
          borderColor: colors.glow,
          shadowColor: colors.glow,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  frame: {
    borderWidth: 3,
    shadowOpacity: 0.9,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
    zIndex: 999,
  },
});
