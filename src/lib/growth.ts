import { AppData, Goal, IdentitySession, JournalEntry } from '../store/types';

const DAY_MS = 24 * 60 * 60 * 1000;

function dateKey(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

// Consecutive days (ending today) with at least one completed session.
// Today doesn't break the streak just for being incomplete — it simply
// doesn't count yet, so the streak carries over from yesterday until the
// day actually ends without a session.
function computeSessionStreakDays(sessions: IdentitySession[], now: Date): number {
  const completedDays = new Set(sessions.filter((s) => s.endedAt).map((s) => dateKey(s.endedAt as string)));
  let cursor = now;
  if (!completedDays.has(dateKey(cursor.toISOString()))) {
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  let streak = 0;
  while (completedDays.has(dateKey(cursor.toISOString()))) {
    streak++;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return streak;
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
  beliefsRewired: number;
  habitsReprogrammed: number;
  goalsCompleted: number;
  goalsTotal: number;
  alignment: {
    thisWeek: { aligned: number; total: number };
    lastWeek: { aligned: number; total: number };
  };
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
  };
};

export function computeGrowthStats(data: AppData, now: Date = new Date()): GrowthStats {
  const daysSinceStart = data.identity?.createdAt
    ? Math.max(0, Math.floor((now.getTime() - new Date(data.identity.createdAt).getTime()) / DAY_MS))
    : null;

  const weekStart = new Date(now.getTime() - 7 * DAY_MS);
  const twoWeeksStart = new Date(now.getTime() - 14 * DAY_MS);

  const journalSorted = [...data.journalEntries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const journalThenNow =
    journalSorted.length >= 2
      ? { then: journalSorted[0], now: journalSorted[journalSorted.length - 1] }
      : null;

  return {
    daysSinceStart,
    beliefsRewired: data.limitedBeliefs.length,
    habitsReprogrammed: data.habitReprograms.length,
    goalsCompleted: data.goals.filter(isGoalComplete).length,
    goalsTotal: data.goals.length,
    alignment: {
      thisWeek: alignmentRate(data.logEntries, weekStart, now),
      lastWeek: alignmentRate(data.logEntries, twoWeeksStart, weekStart),
    },
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
  return {
    active: sessions.find((s) => s.endedAt === null) ?? null,
    totalSessions: completed.length,
    totalSeconds,
    todaySessions: completed.filter((s) => dateKey(s.endedAt as string) === dateKey(now.toISOString())).length,
    currentStreakDays: computeSessionStreakDays(sessions, now),
  };
}
