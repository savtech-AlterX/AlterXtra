import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ProgressEntry } from '../types';

const STORAGE_KEY = 'workup:entries';

export async function loadEntries(): Promise<ProgressEntry[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ProgressEntry[];
  } catch {
    return [];
  }
}

export async function saveEntries(entries: ProgressEntry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
