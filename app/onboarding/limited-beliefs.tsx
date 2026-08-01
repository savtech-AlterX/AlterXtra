import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { GlowButton } from '../../src/components/GlowButton';
import { HudScreen } from '../../src/components/HudScreen';
import { LimitedBeliefFields } from '../../src/components/LimitedBeliefFields';
import { StackHeader } from '../../src/components/StackHeader';
import { useAppData } from '../../src/store/AppDataContext';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { AppIconChoice } from '../../src/store/types';

export default function LimitedBeliefsOnboarding() {
  const router = useRouter();
  const { icon, name, email } = useLocalSearchParams<{
    icon: AppIconChoice;
    name: string;
    email: string;
  }>();
  const { addLimitedBelief } = useAppData();
  const [belief, setBelief] = useState('');
  const [origin, setOrigin] = useState('');
  const [replacement, setReplacement] = useState('');

  const canContinue = belief.trim().length > 0 && replacement.trim().length > 0;

  function proceed() {
    if (belief.trim() || origin.trim() || replacement.trim()) {
      addLimitedBelief(belief.trim(), origin.trim(), replacement.trim());
    }
    router.push({
      pathname: '/onboarding/identity',
      params: { icon: icon ?? 'mystery', name, email },
    });
  }

  function skip() {
    router.push({
      pathname: '/onboarding/identity',
      params: { icon: icon ?? 'mystery', name, email },
    });
  }

  return (
    <HudScreen>
      <StackHeader title="LIMITED BELIEFS" />
      <Text style={styles.subtitle}>
        Identify the false beliefs that have held you back and replace them with truth.
      </Text>

      <LimitedBeliefFields
        belief={belief}
        onBeliefChange={setBelief}
        origin={origin}
        onOriginChange={setOrigin}
        replacement={replacement}
        onReplacementChange={setReplacement}
      />

      <GlowButton label="CONTINUE" disabled={!canContinue} onPress={proceed} style={styles.spacer} />
      <GlowButton label="SKIP FOR NOW — I'LL ADD THIS LATER" variant="outline" onPress={skip} />
    </HudScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontFamily: typography.body.fontFamily,
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: -8,
  },
  spacer: {
    marginTop: 4,
  },
});
