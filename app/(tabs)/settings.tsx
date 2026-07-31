import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { GlowButton } from '../../src/components/GlowButton';
import { GlowCard } from '../../src/components/GlowCard';
import { HudScreen } from '../../src/components/HudScreen';
import { useAppData } from '../../src/store/AppDataContext';
import { colors } from '../../src/theme/colors';
import { glowShadow, iconGlow, typography } from '../../src/theme/typography';

export default function Settings() {
  const router = useRouter();
  const { data, resetAll } = useAppData();

  function confirmReset() {
    Alert.alert(
      'Reset AlterX',
      'This clears your identity, diary, goals, and log book on this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetAll();
            router.replace('/onboarding/icon');
          },
        },
      ]
    );
  }

  return (
    <HudScreen>
      <Text style={typography.screenTitle}>SETTINGS</Text>

      <GlowCard style={styles.card}>
        <Text style={typography.label}>CURRENT IDENTITY</Text>
        <Text style={styles.value}>{data.identity?.archetype ?? '—'}</Text>
      </GlowCard>

      <GlowCard style={styles.card}>
        <Text style={typography.label}>APP ICON MARK</Text>
        <Text style={styles.value}>{data.identity?.icon ?? '—'}</Text>
      </GlowCard>

      <GlowButton
        label="CHANGE IDENTITY"
        variant="outline"
        icon={<Ionicons name="swap-horizontal" size={16} color={colors.glow} style={iconGlow} />}
        onPress={() => router.push('/onboarding/identity')}
      />

      <GlowButton
        label="PRIVACY POLICY"
        variant="outline"
        icon={<Ionicons name="shield-checkmark-outline" size={16} color={colors.glow} style={iconGlow} />}
        onPress={() => router.push('/privacy-policy')}
      />

      <GlowButton
        label="RESET ALL DATA"
        variant="outline"
        icon={<Ionicons name="trash" size={16} color={colors.danger} />}
        style={styles.dangerButton}
        onPress={confirmReset}
      />
    </HudScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 6,
  },
  value: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 16,
    color: colors.textPrimary,
    ...glowShadow,
  },
  dangerButton: {
    borderColor: colors.danger,
  },
});
