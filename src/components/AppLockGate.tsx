import * as LocalAuthentication from 'expo-local-authentication';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../store/SettingsContext';
import { confirmDestructive } from '../lib/confirm';
import { GlowButton } from './GlowButton';
import { IdentityMarkRing } from './IdentityMarkRing';
import { useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

// Grace period before the lock re-arms after leaving the app.
const RELOCK_AFTER_MS = 5 * 60 * 1000;

// After this many failed/broken attempts, offer a way out. Face ID/Touch ID
// can go from "working" to "erroring on every call" after an OS update or an
// enrollment change — with no fallback, that used to strand the user behind
// the lock screen permanently, unable to even reach Settings to turn it off.
const ESCAPE_HATCH_AFTER_ATTEMPTS = 2;

export function AppLockGate({ children }: { children: React.ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  const { settings, isLoaded, setAppLockEnabled } = useSettings();
  const [unlocked, setUnlocked] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
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
      if (result.success) {
        setUnlocked(true);
      } else {
        setFailedAttempts((n) => n + 1);
      }
    } catch {
      // A broken authenticator (hardware error, enrollment mid-change) throws
      // rather than resolving unsuccessfully — still counts as a failed
      // attempt so the escape hatch appears instead of retrying forever.
      setFailedAttempts((n) => n + 1);
    } finally {
      setAuthenticating(false);
    }
  }, []);

  function disableLock() {
    confirmDestructive(
      'Turn Off App Lock',
      "You'll be able to open AlterX without authenticating until you turn it back on in Settings.",
      'Turn Off',
      () => {
        setAppLockEnabled(false);
        setFailedAttempts(0);
        setUnlocked(true);
      }
    );
  }

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
      {failedAttempts >= ESCAPE_HATCH_AFTER_ATTEMPTS && (
        <Pressable onPress={disableLock} hitSlop={8} style={styles.escapeHatch}>
          <Text style={styles.escapeHatchText}>Can't authenticate? Turn off App Lock</Text>
        </Pressable>
      )}
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
    lineHeight: 20,
    color: colors.textSecondary,
  },
  button: {
    marginTop: 12,
    width: 200,
  },
  escapeHatch: {
    marginTop: 20,
  },
  escapeHatchText: {
    fontFamily: typography.bodyMuted.fontFamily,
    fontSize: 12,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
