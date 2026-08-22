import { FutureSelfVideo, LogEntry } from '../store/types';

export function logEntriesSince(logEntries: LogEntry[], sinceIso: string): number {
  const since = new Date(sinceIso).getTime();
  if (Number.isNaN(since)) return 0;
  return logEntries.filter((e) => new Date(e.createdAt).getTime() >= since).length;
}

/**
 * Two unlock modes. 'consistency' pays off showing up, not the calendar: the
 * video stays sealed until the user has logged N Log Book entries since
 * recording it, however long that takes — a date is a countdown you can only
 * wait out, this is a countdown you have to earn.
 *
 * 'date' (or no lockMode, for videos recorded before this existed) keeps the
 * original behavior, with the same fail-open guard as before: a malformed
 * date never permanently locks a recording out of reach.
 */
export function isFutureSelfUnlocked(video: FutureSelfVideo, logEntries: LogEntry[]): boolean {
  if (video.lockMode === 'consistency') {
    return logEntriesSince(logEntries, video.createdAt) >= (video.unlockAfterLogEntries ?? 1);
  }
  const t = new Date(`${video.answerDate}T00:00:00`).getTime();
  if (Number.isNaN(t)) return true;
  return t <= Date.now();
}
