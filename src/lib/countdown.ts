import { Goal } from '../store/types';

const DAY_MS = 86400000;

export type Countdown = {
  /** Whole days remaining; negative once the target date has passed. */
  daysLeft: number;
  /** 0-1 share of the run elapsed, clamped. 0 at the start, 1 at the deadline. */
  elapsedFraction: number;
  expired: boolean;
  valid: boolean;
  label: string;
};

export function goalCountdown(goal: Goal, now: Date = new Date()): Countdown {
  const target = new Date(`${goal.targetDate}T23:59:59`);
  const created = new Date(goal.createdAt);

  if (isNaN(target.getTime())) {
    return { daysLeft: 0, elapsedFraction: 0, expired: false, valid: false, label: 'NO TARGET DATE' };
  }

  const daysLeft = Math.ceil((target.getTime() - now.getTime()) / DAY_MS);
  const expired = target.getTime() <= now.getTime();

  const start = isNaN(created.getTime()) ? now.getTime() : created.getTime();
  const span = target.getTime() - start;
  const elapsed = now.getTime() - start;
  const elapsedFraction = span <= 0 ? 1 : Math.min(1, Math.max(0, elapsed / span));

  let label: string;
  if (expired) label = 'TARGET DATE PASSED';
  else if (daysLeft === 1) label = '1 DAY LEFT';
  else label = `${daysLeft} DAYS LEFT`;

  return { daysLeft, elapsedFraction, expired, valid: true, label };
}
