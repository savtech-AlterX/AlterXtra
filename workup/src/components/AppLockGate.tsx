import * as LocalAuthentication from 'expo-local-authentication';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../data/SettingsContext';
import { colors } from '../theme/colors';

export function AppLockGate({ children }: { children: React.ReactNode }) {
  const { settings, isLoading: settingsLoading } = useSettings();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const attemptUnlock = useCallback(async () => {
    if (Platform.OS === 'web') {
      setIsUnlocked(true);
      return;
    }
    setIsChecking(true);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        // Nothing to authenticate against on this device — don't lock the user out.
        setIsUnlocked(true);
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Workup',
      });
      setIsUnlocked(result.success);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    if (settingsLoading) return;
    if (!settings.appLockEnabled) {
      setIsUnlocked(true);
      return;
    }
    attemptUnlock();
  }, [settingsLoading, settings.appLockEnabled, attemptUnlock]);

  if (settingsLoading) return null;

  if (!settings.appLockEnabled || isUnlocked) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workup is locked</Text>
      <Text style={styles.subtitle}>Authenticate to view your progress photos.</Text>
      <Pressable style={styles.button} onPress={attemptUnlock} disabled={isChecking}>
        <Text style={styles.buttonText}>{isChecking ? 'Checking…' : 'Unlock'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: colors.background,
    fontWeight: '700',
  },
});
