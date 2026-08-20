import { LogEntry } from '../store/types';

export const DISSONANCE_THRESHOLD = 3;

// logEntries is stored newest-first (each add prepends), so counting from
// the start gives the current run of misaligned days, not misaligned days
// anywhere in history.
export function consecutiveMisalignedStreak(logEntries: LogEntry[]): number {
  let streak = 0;
  for (const entry of logEntries) {
    if (entry.aligned) break;
    streak++;
  }
  return streak;
}
