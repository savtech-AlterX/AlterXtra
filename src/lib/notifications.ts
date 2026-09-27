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
  // Must match the filename bundled via the expo-notifications config
  // plugin's `sounds` array in app.json.
  const sound = 'notification.wav';

  if (days.length === 7) {
    await Notifications.scheduleNotificationAsync({
      content: { title: REMINDER_TITLE, body: REMINDER_BODY, sound },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
    });
  } else {
    await Promise.all(
      days.map((weekday) =>
        Notifications.scheduleNotificationAsync({
          content: { title: REMINDER_TITLE, body: REMINDER_BODY, sound },
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

const COMEBACK_IDENTIFIER = 'alterx-comeback-reminder';
const COMEBACK_DELAY_SECONDS = 2 * 24 * 60 * 60;
const COMEBACK_TITLE = 'AlterX';
const COMEBACK_BODY = "Haven't seen you in a couple of days — your identity work is still waiting. Come back and keep going.";

// A Duolingo-style "come back" nudge: re-armed on every app open so it keeps
// getting pushed 2 days into the future, and only actually fires once the
// user goes quiet for that long. Scheduling with the same identifier
// replaces any pending one, so this never stacks duplicates. Silently does
// nothing if notification permission was never granted — this shouldn't be
// the thing that prompts for it; the daily-reminder settings toggle already
// owns that ask.
export async function armComebackReminder(): Promise<void> {
  if (Platform.OS === 'web') return;
  const Notifications = await import('expo-notifications');
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  await Notifications.scheduleNotificationAsync({
    identifier: COMEBACK_IDENTIFIER,
    content: { title: COMEBACK_TITLE, body: COMEBACK_BODY },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: COMEBACK_DELAY_SECONDS, repeats: false },
  });
}
