import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Switch, Text, View } from 'react-native';
import { GlowButton } from '../../src/components/GlowButton';
import { GlowCard } from '../../src/components/GlowCard';
import { HudScreen } from '../../src/components/HudScreen';
import { exportBackup, importBackup } from '../../src/lib/backup';
import { useAppData } from '../../src/store/AppDataContext';
import { useSettings } from '../../src/store/SettingsContext';
import { colors } from '../../src/theme/colors';
import { glowShadow, iconGlow, typography } from '../../src/theme/typography';

export default function Settings() {
  const router = useRouter();
  const { data, resetAll, restoreAll } = useAppData();
  const { settings, setAppLockEnabled } = useSettings();
  const [backupBusy, setBackupBusy] = useState(false);

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

const styles = StyleSheet.create({
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
