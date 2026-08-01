import { AppData, Goal, JournalEntry } from '../store/types';

const DAY_MS = 24 * 60 * 60 * 1000;

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
  };
}
