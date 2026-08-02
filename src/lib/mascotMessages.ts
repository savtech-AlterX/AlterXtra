import { GrowthStats } from './growth';

const STATIC_LINES = [
  "You're not who you were.",
  'Every rep counts.',
  'Discipline is a form of self-respect.',
  'Small moves, big shifts.',
  'You showed up. That\'s the whole game.',
  'Identity is built one decision at a time.',
];

export function buildMascotMessagePool(stats: GrowthStats): string[] {
  const pool: string[] = [...STATIC_LINES];

  if (stats.daysSinceStart !== null) {
    pool.push(`${stats.daysSinceStart} day${stats.daysSinceStart === 1 ? '' : 's'} into your reprogramming.`);
  }
  if (stats.beliefsRewired > 0) {
    pool.push(`You've rewired ${stats.beliefsRewired} limited belief${stats.beliefsRewired === 1 ? '' : 's'}.`);
  }
  if (stats.habitsReprogrammed > 0) {
    pool.push(`${stats.habitsReprogrammed} habit${stats.habitsReprogrammed === 1 ? '' : 's'} reprogrammed and counting.`);
  }
  if (stats.goalsTotal > 0) {
    pool.push(`${stats.goalsCompleted}/${stats.goalsTotal} goals complete.`);
  }
  if (stats.alignment.thisWeek.total > 0) {
    pool.push(`${stats.alignment.thisWeek.aligned}/${stats.alignment.thisWeek.total} aligned this week.`);
  }
  if (stats.habitFollowThrough.total > 0) {
    pool.push(`${stats.habitFollowThrough.followed}/${stats.habitFollowThrough.total} check-ins followed through.`);
  }
  if (stats.futureSelf.videosSealed > 0) {
    pool.push(`${stats.futureSelf.videosSealed} message${stats.futureSelf.videosSealed === 1 ? '' : 's'} sealed to your future self.`);
  }

  return pool;
}

export function pickMascotMessage(pool: string[], rand: () => number = Math.random): string {
  if (pool.length === 0) return 'Keep going.';
  const index = Math.floor(rand() * pool.length);
  return pool[index];
}
