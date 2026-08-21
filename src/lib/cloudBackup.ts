import { Platform } from 'react-native';
import { CloudStorage, CloudStorageProvider } from 'react-native-cloud-storage';
import { AppData } from '../store/types';
import { buildBackup, validateBackup, BackupFile } from './backup';

// The default scope for both providers is CloudStorageScope.AppData — the
// iCloud app-private ubiquity container and Google Drive's appDataFolder,
// neither of which shows up in the user's visible Files/Drive UI. Left
// unspecified deliberately: this is a backup, not a document the user is
// meant to browse to.
const BACKUP_FILE_PATH = '/alterx-backup.json';

export type CloudProvider = 'icloud' | 'googledrive';

function toLibraryProvider(provider: CloudProvider): CloudStorageProvider {
  return provider === 'icloud' ? CloudStorageProvider.ICloud : CloudStorageProvider.GoogleDrive;
}

// iCloud only exists on iOS. Google Drive's native implementation covers iOS
// and Android; web only gets react-native-cloud-storage's limited text-file
// support, and this app's web build is a preview target, not a real
// install, so it's left out here too.
export function isProviderSupported(provider: CloudProvider): boolean {
  if (provider === 'icloud') return Platform.OS === 'ios';
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export async function isCloudAvailable(provider: CloudProvider): Promise<boolean> {
  if (!isProviderSupported(provider)) return false;
  try {
    CloudStorage.setProvider(toLibraryProvider(provider));
    return await CloudStorage.isCloudAvailable();
  } catch {
    return false;
  }
}

export async function backupToCloud(
  provider: CloudProvider,
  data: AppData,
  accessToken?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (provider === 'googledrive' && !accessToken) {
    return { ok: false, error: 'Not signed in to Google Drive.' };
  }
  try {
    CloudStorage.setProvider(toLibraryProvider(provider));
    if (accessToken) CloudStorage.setProviderOptions({ accessToken });
    const json = JSON.stringify(buildBackup(data));
    await CloudStorage.writeFile(BACKUP_FILE_PATH, json);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Cloud backup failed.' };
  }
}

export type CloudRestoreResult =
  | { ok: true; backup: BackupFile }
  | { ok: false; reason: 'not-found' }
  | { ok: false; reason: 'error'; error: string };

export async function restoreFromCloud(provider: CloudProvider, accessToken?: string): Promise<CloudRestoreResult> {
  if (provider === 'googledrive' && !accessToken) {
    return { ok: false, reason: 'error', error: 'Not signed in to Google Drive.' };
  }
  try {
    CloudStorage.setProvider(toLibraryProvider(provider));
    if (accessToken) CloudStorage.setProviderOptions({ accessToken });
    const exists = await CloudStorage.exists(BACKUP_FILE_PATH);
    if (!exists) return { ok: false, reason: 'not-found' };
    const json = await CloudStorage.readFile(BACKUP_FILE_PATH);
    const parsed: unknown = JSON.parse(json);
    const result = validateBackup(parsed);
    if (!result.ok) {
      return { ok: false, reason: 'error', error: result.reason === 'error' ? result.error : 'Invalid backup.' };
    }
    return { ok: true, backup: result.backup };
  } catch (e) {
    return { ok: false, reason: 'error', error: e instanceof Error ? e.message : 'Cloud restore failed.' };
  }
}
