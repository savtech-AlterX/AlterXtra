import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'workup:settings';

export type Settings = {
  appLockEnabled: boolean;
  remindersEnabled: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  appLockEnabled: false,
  remindersEnabled: true,
};

export async function loadSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
