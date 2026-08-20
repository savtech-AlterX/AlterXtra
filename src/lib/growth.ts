import { AppData, Goal, IdentitySession, JournalEntry } from '../store/types';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
// Journal comparison rolls forward with a 30-day window rather than staying
// pinned to the very first entry forever — see journalThenNow below.
const THEN_NOW_WINDOW_MS = 30 * DAY_MS;

// Stored timestamps can in principle be malformed (corrupt AsyncStorage,
// bad migration) — null lets callers skip those entries instead of the
// whole growth screen crashing on one bad record.
function dateKey(iso: string): string | null {
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return null;
  return t.toISOString().slice(0, 10);
}

// For a Date we already constructed ourselves (always valid), so callers
// don't have to null-check keys derived from `now` or a walking cursor.
function dateKeyOf(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Consecutive days (ending today) present in `activeDayKeys`. Today doesn't
// break the streak just for being incomplete — it simply doesn't count yet,
// so the streak carries over from yesterday until the day actually ends
// without any activity.
function computeStreakDays(activeDayKeys: Set<string>, now: Date): number {
  let cursor = now;
  if (!activeDayKeys.has(dateKeyOf(cursor))) {
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  let streak = 0;
  while (activeDayKeys.has(dateKeyOf(cursor))) {
    streak++;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return streak;
}

// Longest run of consecutive calendar days anywhere in `activeDayKeys`, not
// just the one ending today — a broken current streak shouldn't erase the
// record the user actually set.
function computeLongestStreak(activeDayKeys: Set<string>): number {
  if (activeDayKeys.size === 0) return 0;
  const sortedTimes = Array.from(activeDayKeys)
    .map((k) => new Date(`${k}T00:00:00.000Z`).getTime())
    .sort((a, b) => a - b);
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sortedTimes.length; i++) {
    current = sortedTimes[i] - sortedTimes[i - 1] === DAY_MS ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
}

function isGoalComplete(goal: Goal) {
  return goal.steps.length > 0 && goal.steps.every((s) => s.done);
}

function alignmentRate(entries: AppData['logEntries'], from: Date, to: Date) {
  const inRange = entries.filter((e) => {
    const t = new Date(e.createdAt).getTime();
    return t >= from.getTime() && t < to.getTime();
  });
  const aligned = inRange.filter((e) => e.aligned).length;
  return { aligned, total: inRange.length };
}

export type GrowthStats = {
  daysSinceStart: number | null;
  // Consecutive days ending today with any logged activity — a session,
  // habit check-in, log entry, or journal entry. Unlike daysSinceStart this
  // actually reflects engagement, not just account age.
  activeStreakDays: number;
  // The longest streak ever reached, current or not — shown alongside
  // activeStreakDays so a broken streak still reads as a record kept, not a
  // loss.
  bestStreakDays: number;
  beliefsRewired: number;
  habitsReprogrammed: number;
  goalsCompleted: number;
  goalsTotal: number;
  // Every log entry with a correction actually written, aligned or not —
  // the constructive output of a "miss," reframed as its own count rather
  // than folded into a negative "missed target" tally.
  correctionsWritten: number;
  // Counts from the last 7 days, for the "+N this week" badges on the stat
  // grid. Goals has no completion timestamp in the data model, so there's
  // no equivalent delta for goalsCompleted.
  recentAdds: {
    beliefs: number;
    habits: number;
    futureSelfUnlocked: number;
  };
  alignment: {
    thisWeek: { aligned: number; total: number };
    lastWeek: { aligned: number; total: number };
  };
  // Alignment rate for each of the last 8 weeks, oldest first, for the trend
  // sparkline. The final entry always equals `alignment.thisWeek`. rate is
  // 0 for weeks with no entries — total distinguishes "no data" from "0%".
  weeklyTrend: { weekStart: string; aligned: number; total: number; rate: number }[];
  journalThenNow: { then: JournalEntry; now: JournalEntry } | null;
  futureSelf: {
    letters: number;
    videosSealed: number;
    videosUnlocked: number;
  };
  habitFollowThrough: { followed: number; total: number };
  identitySession: {
    active: IdentitySession | null;
    totalSessions: number;
    totalSeconds: number;
    todaySessions: number;
    currentStreakDays: number;
    bestStreakDays: number;
  };
};

export function computeGrowthStats(data: AppData, now: Date = new Date()): GrowthStats {
  const daysSinceStart = data.identity?.createdAt
    ? Math.max(0, Math.floor((now.getTime() - new Date(data.identity.createdAt).getTime()) / DAY_MS))
    : null;

  const weekStart = new Date(now.getTime() - WEEK_MS);
  const twoWeeksStart = new Date(now.getTime() - 2 * WEEK_MS);

  const journalSorted = [...data.journalEntries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const journalThenNow = computeJournalThenNow(journalSorted, now);

  const activeDayKeys = new Set<string>();
  const addKey = (iso: string) => {
    const key = dateKey(iso);
    if (key) activeDayKeys.add(key);
  };
  data.identitySessions.forEach((s) => {
    if (s.endedAt) addKey(s.endedAt);
  });
  data.habitCheckIns.forEach((c) => addKey(c.createdAt));
  data.logEntries.forEach((e) => addKey(e.createdAt));
  data.journalEntries.forEach((e) => addKey(e.createdAt));

  const weeklyTrend = Array.from({ length: 8 }, (_, i) => {
    const weeksAgo = 7 - i; // 7 = oldest week, 0 = this week
    const to = new Date(now.getTime() - weeksAgo * WEEK_MS);
    const from = new Date(to.getTime() - WEEK_MS);
    const { aligned, total } = alignmentRate(data.logEntries, from, to);
    const rate = total === 0 ? 0 : Math.round((aligned / total) * 100);
    return { weekStart: from.toISOString(), aligned, total, rate };
  });

  return {
    daysSinceStart,
    activeStreakDays: computeStreakDays(activeDayKeys, now),
    bestStreakDays: computeLongestStreak(activeDayKeys),
    beliefsRewired: data.limitedBeliefs.length,
    habitsReprogrammed: data.habitReprograms.length,
    goalsCompleted: data.goals.filter(isGoalComplete).length,
    goalsTotal: data.goals.length,
    correctionsWritten: data.logEntries.filter((e) => e.correction && e.correction.trim().length > 0).length,
    recentAdds: {
      beliefs: data.limitedBeliefs.filter((b) => new Date(b.createdAt).getTime() >= weekStart.getTime()).length,
      habits: data.habitReprograms.filter((h) => new Date(h.createdAt).getTime() >= weekStart.getTime()).length,
      futureSelfUnlocked: data.futureSelfVideos.filter((v) => {
        const t = new Date(v.answerDate).getTime();
        return t >= weekStart.getTime() && t <= now.getTime();
      }).length,
    },
    alignment: {
      thisWeek: alignmentRate(data.logEntries, weekStart, now),
      lastWeek: alignmentRate(data.logEntries, twoWeeksStart, weekStart),
    },
    weeklyTrend,
    journalThenNow,
    futureSelf: {
      letters: data.futureSelfLetters.length,
      videosSealed: data.futureSelfVideos.length,
      videosUnlocked: data.futureSelfVideos.filter((v) => new Date(v.answerDate).getTime() <= now.getTime()).length,
    },
    habitFollowThrough: {
      followed: data.habitCheckIns.filter((c) => c.followedThrough).length,
      total: data.habitCheckIns.length,
    },
    identitySession: computeIdentitySessionStats(data.identitySessions, now),
  };
}

// "Then" is the entry closest to (but not after) 30 days before "now",
// rolling forward as journaling continues. Someone without 30 days of
// history yet still gets a comparison — it just falls back to their very
// first entry, the same as before this was made rolling.
function computeJournalThenNow(journalSorted: JournalEntry[], now: Date): GrowthStats['journalThenNow'] {
  if (journalSorted.length < 2) return null;
  const nowEntry = journalSorted[journalSorted.length - 1];
  const cutoff = new Date(nowEntry.createdAt).getTime() - THEN_NOW_WINDOW_MS;
  const older = journalSorted.filter((e) => e.id !== nowEntry.id && new Date(e.createdAt).getTime() <= cutoff);
  const thenEntry = older.length > 0 ? older[older.length - 1] : journalSorted[0];
  if (thenEntry.id === nowEntry.id) return null;
  return { then: thenEntry, now: nowEntry };
}

export function formatDurationShort(totalSeconds: number): string {
  const seconds = Math.round(totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

function computeIdentitySessionStats(sessions: AppData['identitySessions'], now: Date) {
  const completed = sessions.filter((s) => s.endedAt !== null);
  const totalSeconds = completed.reduce((sum, s) => {
    const seconds = (new Date(s.endedAt as string).getTime() - new Date(s.startedAt).getTime()) / 1000;
    return sum + Math.max(0, seconds);
  }, 0);
  const sessionDayKeys = new Set(
    completed.map((s) => dateKey(s.endedAt as string)).filter((k): k is string => k !== null)
  );
  return {
    active: sessions.find((s) => s.endedAt === null) ?? null,
    totalSessions: completed.length,
    totalSeconds,
    todaySessions: completed.filter((s) => dateKey(s.endedAt as string) === dateKeyOf(now)).length,
    currentStreakDays: computeStreakDays(sessionDayKeys, now),
    bestStreakDays: computeLongestStreak(sessionDayKeys),
  };
}
