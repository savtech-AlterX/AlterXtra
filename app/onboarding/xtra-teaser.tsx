import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';

const TEASER = require('../../assets/xtra-teaser.jpg');
const SHOW_MS = 2500;

// A brief flash of the AlterXtra feature-preview teaser between the loading
// screen and the plane-banner reveal — full-bleed, non-interactive, gone
// before there's time to tap anything on it.
export default function XtraTeaser() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/onboarding/reveal'), SHOW_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.screen}>
      <Image source={TEASER} style={styles.image} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
