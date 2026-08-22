import { AppData, Goal, HabitCheckIn, IdentitySession, JournalEntry } from '../store/types';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30 * DAY_MS;
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

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export type HeatmapCell = { date: string | null; level: number; beforeStart: boolean };

// A GitHub-contributions-style grid: one column per week, oldest to newest,
// each column 7 cells Sunday->Saturday. Padded to whole weeks at both ends
// (blank cells before the first Sunday, blank cells after today) so every
// column is a real calendar week, not a ragged partial one.
function computeHeatmap(activityCounts: Map<string, number>, startDate: Date | null, now: Date): HeatmapCell[][] {
  const rangeStart = new Date(now.getTime() - 363 * DAY_MS);
  const gridStart = new Date(rangeStart);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  const gridEnd = new Date(now);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  const startOfStartDate = startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) : null;

  const weeks: HeatmapCell[][] = [];
  let cursor = new Date(gridStart);
  while (cursor.getTime() <= gridEnd.getTime()) {
    const week: HeatmapCell[] = [];
    for (let d = 0; d < 7; d++) {
      if (cursor.getTime() > now.getTime()) {
        week.push({ date: null, level: 0, beforeStart: false });
      } else {
        const key = dateKeyOf(cursor);
        const count = activityCounts.get(key) ?? 0;
        const beforeStart = startOfStartDate ? cursor.getTime() < startOfStartDate.getTime() : false;
        week.push({ date: key, level: Math.min(4, count), beforeStart });
      }
      cursor = new Date(cursor.getTime() + DAY_MS);
    }
    weeks.push(week);
  }
  return weeks;
}

// Rule-based "digest": a handful of real, computed patterns rather than
// generic copy — each insight only appears once there's enough of a sample
// to say something honest about it.
function computeInsights(data: AppData, now: Date): string[] {
  const insights: string[] = [];

  const byWeekday = new Map<number, { aligned: number; total: number }>();
  data.logEntries.forEach((e) => {
    const t = new Date(e.createdAt);
    if (Number.isNaN(t.getTime())) return;
    const bucket = byWeekday.get(t.getDay()) ?? { aligned: 0, total: 0 };
    bucket.total += 1;
    if (e.aligned) bucket.aligned += 1;
    byWeekday.set(t.getDay(), bucket);
  });
  let bestWeekday: { wd: number; rate: number } | null = null;
  byWeekday.forEach((v, wd) => {
    if (v.total < 3) return;
    const rate = v.aligned / v.total;
    if (!bestWeekday || rate > bestWeekday.rate) bestWeekday = { wd, rate };
  });
  if (bestWeekday !== null && (bestWeekday as { wd: number; rate: number }).rate >= 0.6) {
    const b = bestWeekday as { wd: number; rate: number };
    insights.push(`You're most consistent on ${WEEKDAY_NAMES[b.wd]}s — ${Math.round(b.rate * 100)}% aligned.`);
  }

  const journalDayKeys = new Set(
    data.journalEntries.map((e) => dateKey(e.createdAt)).filter((k): k is string => k !== null)
  );
  const journalSplit = splitByDayMembership(data.logEntries, journalDayKeys);
  if (journalSplit) {
    const diff = Math.round((journalSplit.inRate - journalSplit.outRate) * 100);
    if (diff >= 10) {
      insights.push(`You're ${diff}% more likely to log an aligned day when you've also journaled that day.`);
    }
  }

  const sessionDayKeys = new Set(
    data.identitySessions
      .filter((s) => s.endedAt)
      .map((s) => dateKey(s.endedAt as string))
      .filter((k): k is string => k !== null)
  );
  const sessionSplit = splitByDayMembership(data.logEntries, sessionDayKeys);
  if (sessionSplit) {
    const diff = Math.round((sessionSplit.inRate - sessionSplit.outRate) * 100);
    if (diff >= 10) {
      insights.push(`Days you run an identity session, you're ${diff}% more likely to log aligned.`);
    }
  }

  const hours = data.identitySessions
    .map((s) => new Date(s.startedAt).getHours())
    .filter((h) => !Number.isNaN(h));
  if (hours.length >= 5) {
    const morning = hours.filter((h) => h >= 5 && h < 12).length;
    const afternoon = hours.filter((h) => h >= 12 && h < 17).length;
    const evening = hours.length - morning - afternoon;
    const max = Math.max(morning, afternoon, evening);
    if (max / hours.length >= 0.5) {
      const label = max === morning ? 'the morning' : max === afternoon ? 'the afternoon' : 'the evening';
      insights.push(`Most of your identity sessions happen in ${label}.`);
    }
  }

  return insights.slice(0, 4);
}

// Compares the log-entry alignment rate on days a marker event happened
// (`memberKeys`) vs days it didn't — null if either side doesn't have enough
// samples to say anything meaningful.
function splitByDayMembership(entries: AppData['logEntries'], memberKeys: Set<string>) {
  let inAligned = 0, inTotal = 0, outAligned = 0, outTotal = 0;
  entries.forEach((e) => {
    const key = dateKey(e.createdAt);
    if (!key) return;
    if (memberKeys.has(key)) {
      inTotal += 1;
      if (e.aligned) inAligned += 1;
    } else {
      outTotal += 1;
      if (e.aligned) outAligned += 1;
    }
  });
  if (inTotal < 5 || outTotal < 5) return null;
  return { inRate: inAligned / inTotal, outRate: outAligned / outTotal };
}

function followThroughRate(checkIns: HabitCheckIn[], from: Date, to: Date) {
  const inRange = checkIns.filter((c) => {
    const t = new Date(c.createdAt).getTime();
    return t >= from.getTime() && t < to.getTime();
  });
  const followed = inRange.filter((c) => c.followedThrough).length;
  return { followed, total: inRange.length };
}

// Distinct calendar days with any logged activity in the `windowDays`-day
// window ending on (and including) `to`, and the same for the equal-length
// window immediately before it — walked day-by-day like computeStreakDays,
// not via millisecond range math, so the day containing `to` is never
// silently dropped by a boundary that lands exactly on it.
function activeDayCounts(activeDayKeys: Set<string>, to: Date, windowDays: number) {
  let thisWindow = 0;
  let lastWindow = 0;
  let cursor = to;
  for (let i = 0; i < windowDays; i++) {
    if (activeDayKeys.has(dateKeyOf(cursor))) thisWindow++;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  for (let i = 0; i < windowDays; i++) {
    if (activeDayKeys.has(dateKeyOf(cursor))) lastWindow++;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return { thisWindow, lastWindow };
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
  // A year-long GitHub-contributions-style grid, oldest week first, for the
  // long-range "have I actually kept this up" view the 8-week trend can't
  // show. Days before identity.createdAt are flagged so the UI can render
  // them as "not started yet" rather than "missed."
  activityHeatmap: HeatmapCell[][];
  // Rule-based pattern callouts (best weekday, journaling/session vs
  // alignment correlation, time-of-day tendency) — each only appears once
  // there's a real sample to back it, so this can be an empty array.
  insights: string[];
  // The user against their own 30-day-ago self, not against other users —
  // three independent signals (showing up at all, staying aligned, following
  // through on habits) rather than one blended score, since someone can move
  // on one without the others.
  momentum: {
    activeDaysThisMonth: number;
    activeDaysLastMonth: number;
    alignmentThisMonth: { aligned: number; total: number };
    alignmentLastMonth: { aligned: number; total: number };
    followThroughThisMonth: { followed: number; total: number };
    followThroughLastMonth: { followed: number; total: number };
  };
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
  const monthStart = new Date(now.getTime() - MONTH_MS);
  const twoMonthsStart = new Date(now.getTime() - 2 * MONTH_MS);

  const journalSorted = [...data.journalEntries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const journalThenNow = computeJournalThenNow(journalSorted, now);

  const activeDayKeys = new Set<string>();
  const activityCounts = new Map<string, number>();
  const addKey = (iso: string) => {
    const key = dateKey(iso);
    if (!key) return;
    activeDayKeys.add(key);
    activityCounts.set(key, (activityCounts.get(key) ?? 0) + 1);
  };
  data.identitySessions.forEach((s) => {
    if (s.endedAt) addKey(s.endedAt);
  });
  data.habitCheckIns.forEach((c) => addKey(c.createdAt));
  data.logEntries.forEach((e) => addKey(e.createdAt));
  data.journalEntries.forEach((e) => addKey(e.createdAt));

  const momentumActiveDays = activeDayCounts(activeDayKeys, now, 30);

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
    activityHeatmap: computeHeatmap(activityCounts, data.identity?.createdAt ? new Date(data.identity.createdAt) : null, now),
    insights: computeInsights(data, now),
    momentum: {
      activeDaysThisMonth: momentumActiveDays.thisWindow,
      activeDaysLastMonth: momentumActiveDays.lastWindow,
      alignmentThisMonth: alignmentRate(data.logEntries, monthStart, now),
      alignmentLastMonth: alignmentRate(data.logEntries, twoMonthsStart, monthStart),
      followThroughThisMonth: followThroughRate(data.habitCheckIns, monthStart, now),
      followThroughLastMonth: followThroughRate(data.habitCheckIns, twoMonthsStart, monthStart),
    },
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

// Plain text rather than a rendered image — there's no image-capture native
// module in this project, and every other export in the app (backup) already
// shares as a file/text through the OS share sheet, so this follows the same
// pattern instead of adding a new native dependency for one feature.
export function buildShareReport(data: AppData, stats: GrowthStats): string {
  const lines: string[] = [];
  const archetype = data.identity?.archetype;
  lines.push('MY ALTERX GROWTH REPORT');
  if (stats.daysSinceStart !== null) {
    lines.push(`${stats.daysSinceStart} days into becoming ${archetype ?? 'who I want to be'}.`);
  }
  lines.push('');
  lines.push(`🔥 ${stats.activeStreakDays}-day active streak (best: ${stats.bestStreakDays})`);
  lines.push(`💡 ${stats.beliefsRewired} beliefs rewired`);
  lines.push(`🔁 ${stats.habitsReprogrammed} habits reprogrammed`);
  lines.push(`🚩 ${stats.goalsCompleted}/${stats.goalsTotal} goals completed`);
  lines.push(`🛠️ ${stats.correctionsWritten} corrections written`);
  if (stats.alignment.thisWeek.total > 0) {
    const pct = Math.round((stats.alignment.thisWeek.aligned / stats.alignment.thisWeek.total) * 100);
    lines.push(`📈 ${pct}% aligned this week`);
  }
  if (stats.insights.length > 0) {
    lines.push('');
    lines.push(stats.insights[0]);
  }
  lines.push('');
  lines.push('— via AlterX');
  return lines.join('\n');
}
