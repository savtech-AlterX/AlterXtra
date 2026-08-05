import * as LocalAuthentication from 'expo-local-authentication';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform, StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../store/SettingsContext';
import { GlowButton } from './GlowButton';
import { IdentityMarkRing } from './IdentityMarkRing';
import { useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

// Grace period before the lock re-arms after leaving the app.
const RELOCK_AFTER_MS = 5 * 60 * 1000;

export function AppLockGate({ children }: { children: React.ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  const { settings, isLoaded } = useSettings();
  const [unlocked, setUnlocked] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const appState = useRef(AppState.currentState);
  const backgroundedAt = useRef<number | null>(null);

  const lockEnabled = settings.appLockEnabled && Platform.OS !== 'web';

  const attemptUnlock = useCallback(async () => {
    setAuthenticating(true);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        // No biometrics/passcode set up on this device — don't strand the user.
        setUnlocked(true);
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock AlterX',
        disableDeviceFallback: false,
      });
      if (result.success) setUnlocked(true);
    } finally {
      setAuthenticating(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (lockEnabled && !unlocked) attemptUnlock();
    // Only re-run when lock becomes enabled/loaded, not on every unlocked change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, lockEnabled]);

  // Re-lock only after the app has been away for a while. Flicking out to
  // check a message and coming straight back shouldn't demand Face ID again.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current === 'active' && next.match(/inactive|background/)) {
        backgroundedAt.current = Date.now();
      }
      if (next === 'active' && appState.current.match(/inactive|background/) && lockEnabled) {
        const away = Date.now() - (backgroundedAt.current ?? 0);
        if (away > RELOCK_AFTER_MS) setUnlocked(false);
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [lockEnabled]);

  if (!isLoaded) return null;
  if (!lockEnabled || unlocked) return <>{children}</>;

  return (
    <View style={styles.container}>
      <IdentityMarkRing size={90} />
      <Text style={styles.title}>ALTERX LOCKED</Text>
      <Text style={styles.subtitle}>Authenticate to continue</Text>
      <GlowButton
        label={authenticating ? 'AUTHENTICATING...' : 'UNLOCK'}
        onPress={attemptUnlock}
        disabled={authenticating}
        style={styles.button}
      />
    </View>
  );
}

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 24,
  },
  title: {
    fontFamily: typography.screenTitle.fontFamily,
    fontSize: 22,
    color: colors.textPrimary,
    letterSpacing: 2,
    ...glowShadow,
    marginTop: 12,
  },
  subtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
  },
  button: {
    marginTop: 12,
    width: 200,
  },
});
