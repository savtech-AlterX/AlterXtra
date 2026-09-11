import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, View } from 'react-native';
import { AppIconChoice } from '../store/types';
import { framesForIcon } from '../lib/mascotCharacters';

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
 */
export function MascotReveal({ icon, onDone }: Props) {
  const frames = framesForIcon(icon);
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  useEffect(() => {
    if (frames.length === 0) {
      finish();
      return;
    }
    const watchdog = setTimeout(finish, WATCHDOG_MS);
    return () => clearTimeout(watchdog);
    // Only ever needs to arm once per mount — not re-armed per frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
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
  }, [index]);

  if (frames.length === 0 || index >= frames.length) return null;

  return (
    <Modal visible transparent={false} animationType="fade" statusBarTranslucent>
      <View style={styles.fill}>
        <Animated.Image
          source={frames[index]}
          style={[styles.fill, { opacity }]}
          resizeMode="cover"
          accessible={false}
        />
      </View>
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
});
