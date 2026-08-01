import { HabitCheckIn } from '../store/types';

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export function checkInsFor(checkIns: HabitCheckIn[], habitId: string) {
  return checkIns.filter((c) => c.habitId === habitId);
}

export function hasCheckedInToday(checkIns: HabitCheckIn[], habitId: string, now: Date = new Date()): boolean {
  return checkInsFor(checkIns, habitId).some((c) => isSameDay(new Date(c.createdAt), now));
}

export function successRate(checkIns: HabitCheckIn[], habitId: string): { followed: number; total: number } {
  const mine = checkInsFor(checkIns, habitId);
  return { followed: mine.filter((c) => c.followedThrough).length, total: mine.length };
}
