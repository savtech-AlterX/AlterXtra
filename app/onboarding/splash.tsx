import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { GlowButton } from '../../src/components/GlowButton';
import { HudScreen } from '../../src/components/HudScreen';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

export default function Splash() {
  const router = useRouter();

  return (
    <HudScreen scroll={false}>
      <View style={styles.center}>
        <Image
          source={require('../../assets/identity-mark.png')}
          style={styles.mark}
          resizeMode="contain"
        />
        <Image source={require('../../assets/wordmark.png')} style={styles.wordmark} resizeMode="contain" />
        <Text style={styles.subtitle}>IDENTITY TRANSFORMATION</Text>
      </View>

      <GlowButton label="BEGIN" onPress={() => router.push('/onboarding/icon')} />
    </HudScreen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  mark: {
    width: 130,
    height: 220,
  },
  wordmark: {
    width: 230,
    height: 45,
    marginTop: 10,
  },
  subtitle: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    color: colors.glowStrong,
    letterSpacing: 3,
    marginTop: -8,
  },
});
