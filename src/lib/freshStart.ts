/**
 * The "fresh start effect" (Dai, Milkman & Riis, 2014): people are measurably
 * more motivated to pursue a goal right after a temporal landmark — the
 * start of a week, a month, a year — because it reads as a new chapter
 * disconnected from a lapsed streak. Real landmarks, not an arbitrary reset,
 * are what carry that weight; a Tuesday doesn't.
 */
export type FreshStartKind = 'week' | 'month' | null;

export function freshStartKind(now: Date = new Date()): FreshStartKind {
  if (now.getDate() === 1) return 'month';
  if (now.getDay() === 1) return 'week'; // Monday
  return null;
}
