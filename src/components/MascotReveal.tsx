import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Modal, Pressable, StyleSheet, Text } from 'react-native';
import { AppIconChoice } from '../store/types';
import { framesForIcon } from '../lib/mascotCharacters';
import { useAppTheme } from '../theme/useAppTheme';

const FRAME_HOLD_MS = 550;
const FADE_MS = 150;
// However long the full sequence should legitimately take (7 frames at
// hold+fade each), well past it, force onDone — a stalled timer chain
// shouldn't strand the Alter-Xtra panel behind a frozen reveal forever.
const WATCHDOG_MS = (FRAME_HOLD_MS + FADE_MS) * 7 + 2000;

type Props = {
  icon: AppIconChoice;
  onDone: () => void;
};

/**
 * A one-time, full-screen still sequence leading into the Alter-Xtra panel —
 * the current placeholder art is opaque photo compositions, not transparent
 * cutouts, so this plays full-screen rather than as a floating corner
 * companion (the shape the pre-removal mascot used).
 *
 * `contain`, not `cover`: the source panels are nearly square, cropped from
 * a phone screenshot, and a tall device screen is nowhere near that aspect
 * ratio. `cover` was force-cropping and scaling them up ~3.5x to fill the
 * screen — which is what read as "too close to the camera" and blurry.
 * `contain` shows the whole frame at a much smaller ~1.4x scale-up,
 * letterboxed on the app's own black rather than an aggressive crop.
 */
export function MascotReveal({ icon, onDone }: Props) {
  const { colors, typography } = useAppTheme();
  const frames = framesForIcon(icon);
  const [index, setIndex] = useState(0);
  const [reduceMotionChecked, setReduceMotionChecked] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (cancelled) return;
        if (enabled) {
          // A crossfading full-screen sequence is exactly what Reduce Motion
          // asks apps to skip — go straight to the panel it leads into.
          finish();
        } else {
          setReduceMotionChecked(true);
        }
      })
      .catch(() => !cancelled && setReduceMotionChecked(true));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!reduceMotionChecked || frames.length === 0) return;
    AccessibilityInfo.announceForAccessibility?.('Playing an animated intro for Alter-Xtra');
    const watchdog = setTimeout(finish, WATCHDOG_MS);
    return () => clearTimeout(watchdog);
    // Only ever needs to arm once the reduce-motion check has cleared — not
    // re-armed per frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotionChecked]);

  useEffect(() => {
    if (!reduceMotionChecked || frames.length === 0) return;
    if (index >= frames.length) {
      finish();
      return;
    }
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: FADE_MS, useNativeDriver: true }).start(() => {
        opacity.setValue(1);
        setIndex((i) => i + 1);
      });
    }, FRAME_HOLD_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotionChecked, index]);

  if (!reduceMotionChecked || frames.length === 0 || index >= frames.length) return null;

  return (
    <Modal visible transparent={false} animationType="fade" statusBarTranslucent>
      <Pressable
        style={styles.fill}
        onPress={finish}
        accessibilityRole="button"
        accessibilityLabel="Skip intro"
      >
        <Animated.Image
          source={frames[index]}
          style={[styles.fill, { opacity }]}
          resizeMode="contain"
          accessible={false}
        />
        <Text style={[styles.skipHint, typography.label, { color: colors.textMuted }]}>TAP TO SKIP</Text>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  skipHint: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    fontSize: 11,
    letterSpacing: 1.5,
  },
});
