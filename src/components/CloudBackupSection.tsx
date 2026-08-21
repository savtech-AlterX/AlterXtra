import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Text } from 'react-native';
import { GlowButton } from './GlowButton';
import { GlowCard } from './GlowCard';
import type { BackupFile } from '../lib/backup';
import { backupToCloud, isCloudAvailable, isProviderSupported, restoreFromCloud } from '../lib/cloudBackup';
import { confirmDestructive } from '../lib/confirm';
import { useGoogleDriveAuth } from '../lib/googleDriveAuth';
import { useAppData } from '../store/AppDataContext';
import { useAppTheme, useThemedStyles } from '../theme/useAppTheme';
import type { AppTheme } from '../theme/useAppTheme';

/**
 * On-demand backup to iCloud (iOS) and Google Drive (iOS + Android),
 * separate from the file-based export/import above it. The difference that
 * matters: this restores on a fresh install, not just a device that's still
 * around to pull a device backup from.
 */
export function CloudBackupSection() {
  const { colors, iconGlow } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { data, restoreAll } = useAppData();

  const iCloudSupported = isProviderSupported('icloud');
  const driveSupported = isProviderSupported('googledrive');

  const [iCloudBusy, setICloudBusy] = useState(false);
  const [iCloudReady, setICloudReady] = useState(false);
  const [driveBusy, setDriveBusy] = useState(false);
  const [driveAction, setDriveAction] = useState<null | 'backup' | 'restore'>(null);
  // Always called, even on platforms with nothing to sign into below — Platform.OS
  // is fixed for the life of the app, so which branches actually render never
  // changes between renders, but the hook call itself must stay unconditional.
  const drive = useGoogleDriveAuth();

  useEffect(() => {
    if (!iCloudSupported) return;
    isCloudAvailable('icloud').then(setICloudReady);
  }, [iCloudSupported]);

  function confirmRestore(backup: BackupFile) {
    confirmDestructive(
      'Restore backup?',
      'This replaces your journal, beliefs, habits, goals, and notes on this device with the cloud backup. This cannot be undone.',
      'Restore',
      () => restoreAll(backup.data, backup.schemaVersion)
    );
  }

  async function handleICloudBackup() {
    setICloudBusy(true);
    const result = await backupToCloud('icloud', data);
    setICloudBusy(false);
    if (!result.ok) Alert.alert('iCloud backup failed', result.error);
    else Alert.alert('Backed up', 'Your data is saved to iCloud.');
  }

  async function handleICloudRestore() {
    setICloudBusy(true);
    const result = await restoreFromCloud('icloud');
    setICloudBusy(false);
    if (!result.ok) {
      if (result.reason === 'not-found') {
        Alert.alert('No iCloud backup found', "You haven't backed up to iCloud from this identity yet.");
      } else {
        Alert.alert('iCloud restore failed', result.error);
      }
      return;
    }
    confirmRestore(result.backup);
  }

  async function runDriveBackup(token: string) {
    setDriveBusy(true);
    const result = await backupToCloud('googledrive', data, token);
    setDriveBusy(false);
    if (!result.ok) Alert.alert('Google Drive backup failed', result.error);
    else Alert.alert('Backed up', 'Your data is saved to Google Drive.');
  }

  async function runDriveRestore(token: string) {
    setDriveBusy(true);
    const result = await restoreFromCloud('googledrive', token);
    setDriveBusy(false);
    if (!result.ok) {
      if (result.reason === 'not-found') {
        Alert.alert('No Google Drive backup found', "You haven't backed up to Google Drive from this identity yet.");
      } else {
        Alert.alert('Google Drive restore failed', result.error);
      }
      return;
    }
    confirmRestore(result.backup);
  }

  // Signing in is a user-gesture-triggered redirect that resolves
  // asynchronously — this continues into whichever action was requested
  // once the token actually arrives, instead of making the user tap twice.
  useEffect(() => {
    if (!drive.accessToken || !driveAction) return;
    const action = driveAction;
    setDriveAction(null);
    if (action === 'backup') runDriveBackup(drive.accessToken);
    else runDriveRestore(drive.accessToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drive.accessToken]);

  function startDriveBackup() {
    if (drive.accessToken) runDriveBackup(drive.accessToken);
    else {
      setDriveAction('backup');
      drive.signIn();
    }
  }

  function startDriveRestore() {
    if (drive.accessToken) runDriveRestore(drive.accessToken);
    else {
      setDriveAction('restore');
      drive.signIn();
    }
  }

  if (!iCloudSupported && !driveSupported) return null;

  return (
    <>
      <GlowCard style={styles.card}>
        <Text style={styles.label}>CLOUD BACKUP</Text>
        <Text style={styles.desc}>
          Back up on demand to iCloud or Google Drive so a fresh install can restore everything, not just a
          device that's still around to pull its own backup from.
        </Text>
      </GlowCard>

      {iCloudSupported && (
        <>
          <GlowButton
            label={iCloudBusy ? 'WORKING...' : 'BACK UP TO ICLOUD'}
            variant="outline"
            icon={<Ionicons name="cloud-upload-outline" size={16} color={colors.glow} style={iconGlow} />}
            onPress={handleICloudBackup}
            disabled={iCloudBusy || !iCloudReady}
          />
          <GlowButton
            label={iCloudBusy ? 'WORKING...' : 'RESTORE FROM ICLOUD'}
            variant="outline"
            icon={<Ionicons name="cloud-download-outline" size={16} color={colors.glow} style={iconGlow} />}
            onPress={handleICloudRestore}
            disabled={iCloudBusy || !iCloudReady}
          />
          {!iCloudReady && (
            <Text style={styles.hint}>iCloud isn't available right now — check that you're signed in to iCloud.</Text>
          )}
        </>
      )}

      {driveSupported &&
        (drive.available ? (
          <>
            <GlowButton
              label={driveBusy ? 'WORKING...' : drive.accessToken ? 'BACK UP TO GOOGLE DRIVE' : 'SIGN IN & BACK UP TO DRIVE'}
              variant="outline"
              icon={<Ionicons name="cloud-upload-outline" size={16} color={colors.glow} style={iconGlow} />}
              onPress={startDriveBackup}
              disabled={driveBusy || drive.exchanging}
            />
            <GlowButton
              label={driveBusy ? 'WORKING...' : drive.accessToken ? 'RESTORE FROM GOOGLE DRIVE' : 'SIGN IN & RESTORE FROM DRIVE'}
              variant="outline"
              icon={<Ionicons name="cloud-download-outline" size={16} color={colors.glow} style={iconGlow} />}
              onPress={startDriveRestore}
              disabled={driveBusy || drive.exchanging}
            />
            {!!drive.error && <Text style={[styles.hint, { color: colors.danger }]}>{drive.error}</Text>}
          </>
        ) : (
          <Text style={styles.hint}>Google Drive backup isn't set up yet.</Text>
        ))}
    </>
  );
}

const makeStyles = ({ colors, typography }: AppTheme) => ({
  card: {
    gap: 6,
  },
  label: {
    fontFamily: typography.label.fontFamily,
    fontSize: 12,
    color: colors.glow,
    letterSpacing: 2,
  },
  desc: {
    fontFamily: typography.bodyMuted.fontFamily,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  hint: {
    fontFamily: typography.bodyMuted.fontFamily,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
    marginTop: -6,
  },
});
