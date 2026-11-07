import type { Goal } from '../store/types';

/** A goal is complete once it has at least one step and every step is checked off. */
export function isGoalComplete(goal: Goal): boolean {
  return goal.steps.length > 0 && goal.steps.every((step) => step.done);
}
