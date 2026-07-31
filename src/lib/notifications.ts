import { Platform } from 'react-native';

const REMINDER_TITLE = 'AlterX';
const REMINDER_BODY = "Take a minute to check in — log a habit, review a goal, or write to your future self.";

export async function enableDailyReminder(hour: number, minute: number): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (Platform.OS === 'web') return { ok: false, reason: 'Reminders are only available in the mobile app.' };

  const Notifications = await import('expo-notifications');
  const { status: existing } = await Notifications.getPermissionsAsync();
  let granted = existing === 'granted';
  if (!granted) {
    const { status } = await Notifications.requestPermissionsAsync();
    granted = status === 'granted';
  }
  if (!granted) return { ok: false, reason: 'Notification permission was not granted.' };

  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: { title: REMINDER_TITLE, body: REMINDER_BODY },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
  });
  return { ok: true };
}

export async function disableDailyReminder(): Promise<void> {
  if (Platform.OS === 'web') return;
  const Notifications = await import('expo-notifications');
  await Notifications.cancelAllScheduledNotificationsAsync();
}
