import type { ProgressEntry } from '../types';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Counts consecutive 7-day windows (most recent first) that contain at least
// one entry, stopping at the first gap. A photo logged this week or last
// week still counts as an unbroken streak.
export function computeWeeklyStreak(entries: ProgressEntry[], now: Date = new Date()): number {
  if (entries.length === 0) return 0;

  const times = entries.map((entry) => new Date(entry.date).getTime()).sort((a, b) => b - a);
  const nowMs = now.getTime();

  let streak = 0;
  let windowEnd = nowMs;
  let index = 0;

  while (true) {
    const windowStart = windowEnd - WEEK_MS;
    let foundInWindow = false;
    while (index < times.length && times[index] > windowStart) {
      if (times[index] <= windowEnd) foundInWindow = true;
      index++;
    }
    if (!foundInWindow) break;
    streak++;
    windowEnd = windowStart;
  }

  return streak;
}
