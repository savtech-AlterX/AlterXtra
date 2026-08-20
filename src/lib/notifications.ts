import { Platform } from 'react-native';

const REMINDER_TITLE = 'AlterX';
const REMINDER_BODY = "Take a minute to check in — log a habit, review a goal, or write to your future self.";

const ALL_WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];

export async function enableDailyReminder(
  hour: number,
  minute: number,
  days: number[] = ALL_WEEKDAYS
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (Platform.OS === 'web') return { ok: false, reason: 'Reminders are only available in the mobile app.' };
  if (days.length === 0) return { ok: false, reason: 'Pick at least one day.' };

  const Notifications = await import('expo-notifications');
  const { status: existing } = await Notifications.getPermissionsAsync();
  let granted = existing === 'granted';
  if (!granted) {
    const { status } = await Notifications.requestPermissionsAsync();
    granted = status === 'granted';
  }
  if (!granted) return { ok: false, reason: 'Notification permission was not granted.' };

  await Notifications.cancelAllScheduledNotificationsAsync();

  // A daily trigger only fires exactly once every 24h from a single rule, so
  // every day selected still needs its own weekly trigger — except the
  // all-7-days case, where the plain DAILY trigger is equivalent and cheaper.
  if (days.length === 7) {
    await Notifications.scheduleNotificationAsync({
      content: { title: REMINDER_TITLE, body: REMINDER_BODY },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
    });
  } else {
    await Promise.all(
      days.map((weekday) =>
        Notifications.scheduleNotificationAsync({
          content: { title: REMINDER_TITLE, body: REMINDER_BODY },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday, hour, minute },
        })
      )
    );
  }
  return { ok: true };
}

export async function disableDailyReminder(): Promise<void> {
  if (Platform.OS === 'web') return;
  const Notifications = await import('expo-notifications');
  await Notifications.cancelAllScheduledNotificationsAsync();
}
