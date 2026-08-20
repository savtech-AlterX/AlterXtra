import { AppData } from '../store/types';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Days since the user last did anything that counts as "showing up" — the
 * same activity definition growth.ts's activeStreakDays uses (a completed
 * identity session, a habit check-in, a log entry, or a journal entry), just
 * measured as a gap instead of a streak.
 *
 * Falls back to identity.createdAt when there's no activity at all yet, so a
 * user who onboarded an hour ago reads as "0 days silent," not stranded with
 * no baseline. Returns null only when there's truly nothing to measure from
 * (no identity yet).
 */
export function daysSinceLastActivity(data: AppData, now: Date = new Date()): number | null {
  let latest: number | null = null;
  const consider = (iso: string) => {
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return;
    if (latest === null || t > latest) latest = t;
  };

  data.identitySessions.forEach((s) => {
    if (s.endedAt) consider(s.endedAt);
  });
  data.habitCheckIns.forEach((c) => consider(c.createdAt));
  data.logEntries.forEach((e) => consider(e.createdAt));
  data.journalEntries.forEach((e) => consider(e.createdAt));

  if (latest === null) {
    if (!data.identity?.createdAt) return null;
    const created = new Date(data.identity.createdAt).getTime();
    if (Number.isNaN(created)) return null;
    latest = created;
  }

  return Math.max(0, Math.floor((now.getTime() - latest) / DAY_MS));
}
