// Alter-Xtra isn't purchasable yet (see the disclaimer on app/alter-xtra.tsx),
// so there's no real entitlement state to read — every install is on the
// free plan. This becomes a real check against purchase/restore state once
// Alter-Xtra actually goes on sale; nothing else in this file should need to
// change when it does.
export function hasAlterXtra(): boolean {
  return false;
}

// Free plan limit on how many habits can be reprogrammed at once (see
// app/habit-reprogramming.tsx) — Alter-Xtra removes it entirely.
export const FREE_HABIT_LIMIT = 4;

export function habitLimitReached(habitCount: number): boolean {
  return !hasAlterXtra() && habitCount >= FREE_HABIT_LIMIT;
}
