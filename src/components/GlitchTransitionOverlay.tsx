import { usePathname } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

// A brief RGB-fringe flicker that fires whenever the route changes, so
// moving between screens reads as a digital glitch-cut rather than a plain
// fade. Purely a cosmetic overlay — it never touches the actual navigation
// transition, so it's safe on both native (native-stack) and web.
const BARS = [
  { color: 'rgba(63, 169, 255, 0.55)', top: '18%', height: 3, offset: 16, delay: 0 },
  { color: 'rgba(255, 46, 136, 0.45)', top: '38%', height: 4, offset: -22, delay: 30 },
  { color: 'rgba(46, 255, 194, 0.4)', top: '58%', height: 2, offset: 12, delay: 55 },
  { color: 'rgba(255, 255, 255, 0.3)', top: '74%', height: 3, offset: -14, delay: 15 },
] as const;

function GlitchBar({ color, top, height, offset, delay, trigger }: (typeof BARS)[number] & { trigger: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger === 0) return;
    anim.setValue(0);
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(anim, { toValue: 1, duration: 45, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [trigger]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, offset] });

  return (
    <Animated.View
      style={[
        styles.bar,
        { top, height, backgroundColor: color, opacity: anim, transform: [{ translateX }] },
      ]}
    />
  );
}

export function GlitchTransitionOverlay() {
  const pathname = usePathname();
  const isFirst = useRef(true);
  const trigger = useRef(0);
  const [, forceRender] = React.useReducer((n) => n + 1, 0);
  const flash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    trigger.current += 1;
    forceRender();
    flash.setValue(0);
    Animated.sequence([
      Animated.timing(flash, { toValue: 0.14, duration: 20, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(flash, { toValue: 0, duration: 110, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [pathname]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.flash, { opacity: flash }]} />
      {BARS.map((bar, i) => (
        <GlitchBar key={i} {...bar} trigger={trigger.current} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  flash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
  },
});
