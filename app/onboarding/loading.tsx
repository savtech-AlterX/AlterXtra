import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { HudScreen } from '../../src/components/HudScreen';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

export default function Loading() {
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 1400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => router.replace('/(tabs)'), 1600);
    return () => clearTimeout(timer);
  }, []);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <HudScreen scroll={false}>
      <View style={styles.center}>
        <Image
          source={require('../../assets/identity-mark.png')}
          style={styles.mark}
          resizeMode="contain"
        />
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, { width }]} />
        </View>
        <Text style={styles.label}>REPROGRAMMING IDENTITY...</Text>
      </View>
    </HudScreen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  mark: {
    width: 100,
    height: 170,
    opacity: 0.6,
  },
  barTrack: {
    width: '70%',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.panelSolid,
    borderWidth: 1,
    borderColor: colors.borderDim,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.glow,
  },
  label: {
    fontFamily: typography.label.fontFamily,
    fontSize: 12,
    color: colors.glow,
    letterSpacing: 3,
  },
});
