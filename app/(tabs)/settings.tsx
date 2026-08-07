import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Switch, Text, View } from 'react-native';
import { GlowButton } from '../../src/components/GlowButton';
import { GlowCard } from '../../src/components/GlowCard';
import { CloseToHome } from '../../src/components/CloseToHome';
import { HudScreen } from '../../src/components/HudScreen';
import { exportBackup, importBackup } from '../../src/lib/backup';
import { disableDailyReminder, enableDailyReminder } from '../../src/lib/notifications';
import { useAppData } from '../../src/store/AppDataContext';
import { useSettings } from '../../src/store/SettingsContext';
import { useThemeControls } from '../../src/theme/ThemeContext';
import { useAppTheme, useThemedStyles } from '../../src/theme/useAppTheme';
import type { AppTheme } from '../../src/theme/useAppTheme';

function formatTime(hour: number, minute: number) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, '0')} ${period}`;
}

export default function Settings() {
  const { colors, typography, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { data, resetAll, restoreAll } = useAppData();
  const { settings, setAppLockEnabled, setDailyReminder, setMascotEnabled, setShowGoalBarOnHome, resetSettings } =
    useSettings();
  const { resetTheme } = useThemeControls();
  const [backupBusy, setBackupBusy] = useState(false);
  const [reminderBusy, setReminderBusy] = useState(false);

  async function handleReminderToggle(enabled: boolean) {
    setReminderBusy(true);
    if (enabled) {
      const result = await enableDailyReminder(settings.dailyReminderHour, settings.dailyReminderMinute);
      if (result.ok) {
        setDailyReminder({ dailyReminderEnabled: true });
      } else {
        Alert.alert('Could not enable reminder', result.reason);
      }
    } else {
      await disableDailyReminder();
      setDailyReminder({ dailyReminderEnabled: false });
    }
    setReminderBusy(false);
  }

  async function adjustReminderTime(deltaMinutes: number) {
    const total = (settings.dailyReminderHour * 60 + settings.dailyReminderMinute + deltaMinutes + 24 * 60) % (24 * 60);
    const hour = Math.floor(total / 60);
    const minute = total % 60;
    setDailyReminder({ dailyReminderHour: hour, dailyReminderMinute: minute });
    if (settings.dailyReminderEnabled) {
      await enableDailyReminder(hour, minute);
    }
  }

  async function handleExport() {
    setBackupBusy(true);
    const result = await exportBackup(data);
    setBackupBusy(false);
    if (!result.ok) {
      Alert.alert('Export failed', result.error);
    }
  }

  async function handleImport() {
    setBackupBusy(true);
    const result = await importBackup();
    setBackupBusy(false);
    if (!result.ok) {
      if (result.reason === 'error') Alert.alert('Import failed', result.error);
      return;
    }
    Alert.alert(
      'Restore backup?',
      'This replaces your journal, beliefs, habits, goals, and notes on this device with the contents of the backup file. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: () => restoreAll(result.backup.data, result.backup.schemaVersion),
        },
      ]
    );
  }

  function doReset() {
    resetAll();
    resetSettings();
    resetTheme();
    router.replace('/onboarding/icon');
  }

  function confirmReset() {
    // React Native Web's Alert.alert is a documented no-op — it never calls
    // any button's onPress, so this button silently did nothing in any web
    // preview. window.confirm is the web equivalent of the same prompt.
    if (Platform.OS === 'web') {
      if (window.confirm('Reset AlterX: this clears your identity, diary, goals, and log book on this device. This cannot be undone.')) {
        doReset();
      }
      return;
    }
    Alert.alert(
      'Reset AlterX',
      'This clears your identity, diary, goals, and log book on this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: doReset,
        },
      ]
    );
  }

  return (
    <HudScreen>
      <View style={styles.titleRow}>
        <CloseToHome />
        <Text style={typography.screenTitle}>SETTINGS</Text>
      </View>

      <GlowCard style={styles.card}>
        <Text style={typography.label}>CURRENT IDENTITY</Text>
        <Text style={styles.value}>{data.identity?.archetype ?? '—'}</Text>
      </GlowCard>

      <GlowButton
        label="CHANGE IDENTITY"
        variant="outline"
        icon={<Ionicons name="swap-horizontal" size={16} color={colors.glow} style={iconGlow} />}
        onPress={() => router.push('/onboarding/identity')}
      />

      {Platform.OS !== 'web' && (
        <GlowCard style={styles.lockCard}>
          <View style={styles.lockText}>
            <Text style={typography.label}>APP LOCK</Text>
            <Text style={styles.lockDesc}>
              Require Face ID / Touch ID / passcode to open AlterX. Your content is personal — this keeps it
              private if someone else picks up your phone.
            </Text>
          </View>
          <Switch
            value={settings.appLockEnabled}
            onValueChange={setAppLockEnabled}
            trackColor={{ false: colors.borderDim, true: colors.glow }}
            thumbColor={colors.textPrimary}
          />
        </GlowCard>
      )}

      {Platform.OS !== 'web' && (
        <GlowCard style={styles.card}>
          <View style={styles.lockCard}>
            <View style={styles.lockText}>
              <Text style={typography.label}>DAILY REMINDER</Text>
              <Text style={styles.lockDesc}>
                One gentle nudge a day to check in — log a habit, review a goal, or write to your future self.
              </Text>
            </View>
            <Switch
              value={settings.dailyReminderEnabled}
              onValueChange={handleReminderToggle}
              disabled={reminderBusy}
              trackColor={{ false: colors.borderDim, true: colors.glow }}
              thumbColor={colors.textPrimary}
            />
          </View>
          {settings.dailyReminderEnabled && (
            <View style={styles.timeRow}>
              <Text style={styles.timeValue}>{formatTime(settings.dailyReminderHour, settings.dailyReminderMinute)}</Text>
              <View style={styles.timeSteppers}>
                <Ionicons
                  name="chevron-back"
                  size={18}
                  color={colors.glow}
                  style={iconGlow}
                  onPress={() => adjustReminderTime(-15)}
                  accessibilityRole="button"
                  accessibilityLabel="15 minutes earlier"
                />
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.glow}
                  style={iconGlow}
                  onPress={() => adjustReminderTime(15)}
                  accessibilityRole="button"
                  accessibilityLabel="15 minutes later"
                />
              </View>
            </View>
          )}
        </GlowCard>
      )}

      <GlowCard style={styles.card}>
        <View style={styles.lockCard}>
          <View style={styles.lockText}>
            <Text style={typography.label}>COMPANION</Text>
            <Text style={styles.lockDesc}>
              A figurine that walks around the screen. Tap it for a stat or a nudge.
            </Text>
          </View>
          <Switch
            value={settings.mascotEnabled}
            onValueChange={setMascotEnabled}
            trackColor={{ false: colors.borderDim, true: colors.glow }}
            thumbColor={colors.textPrimary}
          />
        </View>
      </GlowCard>

      <GlowCard style={styles.lockCard}>
        <View style={styles.lockText}>
          <Text style={typography.label}>GOAL BAR ON HOME</Text>
          <Text style={styles.lockDesc}>
            Show your primary objective's live countdown bar on the home screen.
          </Text>
        </View>
        <Switch
          value={settings.showGoalBarOnHome}
          onValueChange={setShowGoalBarOnHome}
          trackColor={{ false: colors.borderDim, true: colors.glow }}
          thumbColor={colors.textPrimary}
        />
      </GlowCard>

      <GlowCard style={styles.card}>
        <Text style={typography.label}>BACKUP</Text>
        <Text style={styles.lockDesc}>
          Save your journal, beliefs, habits, goals, and notes to a file so a lost or upgraded phone doesn't
          erase them. Photos and videos stay device-only and aren't included yet.
        </Text>
      </GlowCard>

      <GlowButton
        label={backupBusy ? 'WORKING...' : 'EXPORT BACKUP'}
        variant="outline"
        icon={<Ionicons name="download-outline" size={16} color={colors.glow} style={iconGlow} />}
        onPress={handleExport}
        disabled={backupBusy}
      />

      <GlowButton
        label={backupBusy ? 'WORKING...' : 'IMPORT BACKUP'}
        variant="outline"
        icon={<Ionicons name="cloud-upload-outline" size={16} color={colors.glow} style={iconGlow} />}
        onPress={handleImport}
        disabled={backupBusy}
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

const makeStyles = ({ colors, typography, glowShadow, iconGlow }: AppTheme) =>
  StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  card: {
    gap: 6,
  },
  lockCard: {
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockText: {
    flex: 1,
    gap: 4,
  },
  lockDesc: {
    fontFamily: typography.bodyMuted.fontFamily,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderDim,
  },
  timeValue: {
    fontFamily: typography.cardTitle.fontFamily,
    fontSize: 16,
    color: colors.textPrimary,
    ...glowShadow,
  },
  timeSteppers: {
    flexDirection: 'row',
    gap: 18,
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
