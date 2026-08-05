import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

export default function Welcome() {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();

  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.iconRing}>
          <Ionicons name="leaf" size={44} color={styles.icon.color} />
        </View>
        <Text style={styles.title}>Regrown</Text>
        <Text style={styles.tagline}>
          Real before-and-afters of people cleaning up, restoring habitats, and moving the planet forward —
          share your own and see what's working.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button label="Create account" onPress={() => router.push('/(auth)/sign-up')} />
        <Button label="Sign in" variant="secondary" onPress={() => router.push('/(auth)/sign-in')} />
      </View>
    </Screen>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) =>
  StyleSheet.create({
    content: { flex: 1, justifyContent: 'space-between', paddingVertical: 40 },
    hero: { alignItems: 'center', gap: 16, marginTop: 40 },
    iconRing: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: colors.primaryDim,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: { color: colors.primaryStrong },
    title: { ...typography.screenTitle, fontSize: 30 },
    tagline: { ...typography.bodyMuted, textAlign: 'center', paddingHorizontal: 12 },
    actions: { gap: 12 },
  });
