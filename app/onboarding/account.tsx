import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlowButton } from '../../src/components/GlowButton';
import { HudScreen } from '../../src/components/HudScreen';
import { HudTextInput } from '../../src/components/HudTextInput';
import { StackHeader } from '../../src/components/StackHeader';
import { colors } from '../../src/theme/colors';
import { iconGlow, typography } from '../../src/theme/typography';
import { AppIconChoice } from '../../src/store/types';

export default function CreateAccount() {
  const router = useRouter();
  const { icon } = useLocalSearchParams<{ icon: AppIconChoice }>();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailConfirm, setEmailConfirm] = useState('');
  const [notARobot, setNotARobot] = useState(false);

  const canContinue =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length > 0 &&
    emailConfirm.trim() === email.trim() &&
    notARobot;

  function proceed() {
    router.push({
      pathname: '/onboarding/limited-beliefs',
      params: { icon: icon ?? 'mystery', name: fullName.trim(), email: email.trim() },
    });
  }

  return (
    <HudScreen>
      <StackHeader title="" />
      <Text style={typography.screenTitle}>CREATE YOUR{'\n'}ACCOUNT</Text>
      <Text style={styles.subtitle}>Your transformation starts here.</Text>

      <Text style={typography.label}>FULL NAME</Text>
      <HudTextInput placeholder="Your name" value={fullName} onChangeText={setFullName} />

      <Text style={[typography.label, styles.spacer]}>EMAIL</Text>
      <HudTextInput
        placeholder="your@email.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={[typography.label, styles.spacer]}>PASSWORD</Text>
      <HudTextInput placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />

      <Text style={[typography.label, styles.spacer]}>EMAIL CONFIRMATION</Text>
      <HudTextInput
        placeholder="Confirm your email"
        value={emailConfirm}
        onChangeText={setEmailConfirm}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Pressable style={styles.checkboxRow} onPress={() => setNotARobot((v) => !v)}>
        <View style={[styles.checkbox, notARobot && styles.checkboxChecked]}>
          {notARobot && <Ionicons name="checkmark" size={16} color={colors.background} style={iconGlow} />}
        </View>
        <Text style={styles.checkboxLabel}>I confirm I am not a robot</Text>
      </Pressable>

      <GlowButton label="CONTINUE" disabled={!canContinue} onPress={proceed} style={styles.spacer} />
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
    marginTop: 6,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.glow,
    borderColor: colors.glow,
  },
  checkboxLabel: {
    fontFamily: typography.body.fontFamily,
    color: colors.textPrimary,
    fontSize: 14,
  },
});
