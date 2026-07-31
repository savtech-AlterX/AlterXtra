import { Platform } from 'react-native';
import { AppData } from '../store/types';
import { SCHEMA_VERSION } from '../store/migrations';

export type BackupFile = {
  app: 'AlterX';
  schemaVersion: number;
  exportedAt: string;
  data: AppData;
};

function buildBackup(data: AppData): BackupFile {
  return { app: 'AlterX', schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), data };
}

function fileName() {
  const date = new Date().toISOString().slice(0, 10);
  return `alterx-backup-${date}.json`;
}

export async function exportBackup(data: AppData): Promise<{ ok: true } | { ok: false; error: string }> {
  const backup = buildBackup(data);
  const json = JSON.stringify(backup, null, 2);

  if (Platform.OS === 'web') {
    try {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Export failed' };
    }
  }

  try {
    const FileSystem = await import('expo-file-system');
    const Sharing = await import('expo-sharing');
    const file = new FileSystem.File(FileSystem.Paths.cache, fileName());
    if (file.exists) file.delete();
    file.create();
    file.write(json);

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Save your AlterX backup',
      });
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Export failed' };
  }
}

export type ImportResult =
  | { ok: true; backup: BackupFile }
  | { ok: false; reason: 'cancelled' }
  | { ok: false; reason: 'error'; error: string };

export async function importBackup(): Promise<ImportResult> {
  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) {
          resolve({ ok: false, reason: 'cancelled' });
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parsed = JSON.parse(String(reader.result));
            resolve(validateBackup(parsed));
          } catch {
            resolve({ ok: false, reason: 'error', error: 'That file is not a valid AlterX backup.' });
          }
        };
        reader.onerror = () => resolve({ ok: false, reason: 'error', error: 'Could not read that file.' });
        reader.readAsText(file);
      };
      input.click();
    });
  }

  try {
    const DocumentPicker = await import('expo-document-picker');
    const FileSystem = await import('expo-file-system');
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.[0]) return { ok: false, reason: 'cancelled' };
    const file = new FileSystem.File(result.assets[0].uri);
    const text = await file.text();
    const parsed = JSON.parse(text);
    return validateBackup(parsed);
  } catch (e) {
    return { ok: false, reason: 'error', error: e instanceof Error ? e.message : 'Import failed' };
  }
}

export function validateBackup(parsed: unknown): ImportResult {
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    (parsed as any).app !== 'AlterX' ||
    typeof (parsed as any).schemaVersion !== 'number' ||
    typeof (parsed as any).data !== 'object'
  ) {
    return { ok: false, reason: 'error', error: 'That file is not a valid AlterX backup.' };
  }
  return { ok: true, backup: parsed as BackupFile };
}
