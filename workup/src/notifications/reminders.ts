import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { MUSCLE_GROUP_LABELS } from '../constants/muscleGroups';
import type { MuscleGroup } from '../types';

const SCHEDULED_IDS_KEY = 'workup:reminder-ids';
const REMINDER_AFTER_DAYS = 14;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function loadScheduledIds(): Promise<Partial<Record<MuscleGroup, string>>> {
  const raw = await AsyncStorage.getItem(SCHEDULED_IDS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveScheduledIds(ids: Partial<Record<MuscleGroup, string>>): Promise<void> {
  await AsyncStorage.setItem(SCHEDULED_IDS_KEY, JSON.stringify(ids));
}

export async function requestReminderPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Re-schedules the "come back and log this muscle group" reminder for
// `group`, replacing any previously scheduled one so they never stack.
export async function scheduleGroupReminder(group: MuscleGroup): Promise<void> {
  if (Platform.OS === 'web') return;

  const granted = await requestReminderPermission();
  if (!granted) return;

  const scheduledIds = await loadScheduledIds();
  const existingId = scheduledIds[group];
  if (existingId) {
    await Notifications.cancelScheduledNotificationAsync(existingId).catch(() => {});
  }

  const label = MUSCLE_GROUP_LABELS[group];
  const newId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time for a check-in',
      body: `It's been ${REMINDER_AFTER_DAYS} days since your last ${label.toLowerCase()} photo.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: REMINDER_AFTER_DAYS * 24 * 60 * 60,
    },
  });

  scheduledIds[group] = newId;
  await saveScheduledIds(scheduledIds);
}

export async function cancelAllReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
  await saveScheduledIds({});
}
