import { ThemeName } from '../theme/colors';

// Alter-Xtra isn't purchasable yet (see the disclaimer on app/alter-xtra.tsx),
// so there's no real entitlement state to read — every install is on the
// free plan. This becomes a real check against purchase/restore state once
// Alter-Xtra actually goes on sale; nothing else in this file should need to
// change when it does.
export function hasAlterXtra(): boolean {
  return false;
}

// Free-plan content limits — Alter-Xtra removes every one of these entirely.
export const FREE_HABIT_LIMIT = 4;
export const FREE_GOAL_LIMIT = 3;
export const FREE_LETTER_LIMIT = 2;
export const FREE_VIDEO_LIMIT = 1;

export function habitLimitReached(habitCount: number): boolean {
  return !hasAlterXtra() && habitCount >= FREE_HABIT_LIMIT;
}

export function goalLimitReached(goalCount: number): boolean {
  return !hasAlterXtra() && goalCount >= FREE_GOAL_LIMIT;
}

export function letterLimitReached(letterCount: number): boolean {
  return !hasAlterXtra() && letterCount >= FREE_LETTER_LIMIT;
}

export function videoLimitReached(videoCount: number): boolean {
  return !hasAlterXtra() && videoCount >= FREE_VIDEO_LIMIT;
}

// Blue is the app default and Navy its closest dark neighbor — the two
// anchor looks stay free; the other six neon variants are the "every theme"
// Alter-Xtra already promises in the store listing.
export const FREE_THEMES: ThemeName[] = ['blue', 'navy'];

export function isThemeFree(theme: ThemeName): boolean {
  return hasAlterXtra() || FREE_THEMES.includes(theme);
}
