import { ThemeName } from '../theme/colors';

import { useSyncExternalStore } from 'react';

let previewEnabled = false;
let purchased = false;
const listeners = new Set<() => void>();

export function setAlterXtraPreview(enabled: boolean) {
  // Preview must never unlock a TestFlight or production install.
  previewEnabled = __DEV__ && enabled;
}

export function setPurchasedAlterXtra(owned: boolean) {
  if (purchased === owned) return;
  purchased = owned;
  listeners.forEach(listener => listener());
}

export function hasAlterXtra(): boolean {
  return purchased || previewEnabled;
}

export function useAlterXtra(): boolean {
  return useSyncExternalStore(listener => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, hasAlterXtra, () => false);
}

// Free-plan content limits — Alter-Xtra removes every one of these entirely.
export const FREE_HABIT_LIMIT = 4;
export const FREE_GOAL_LIMIT = 3;
export const FREE_LIMITED_BELIEFS_LIMIT = 2;
export const FREE_IDENTITY_LIMIT = 1;

export function habitLimitReached(habitCount: number): boolean {
  return !hasAlterXtra() && habitCount >= FREE_HABIT_LIMIT;
}

export function goalLimitReached(goalCount: number): boolean {
  return !hasAlterXtra() && goalCount >= FREE_GOAL_LIMIT;
}

export function limitedBeliefsLimitReached(limitedBeliefsCount: number): boolean {
  return !hasAlterXtra() && limitedBeliefsCount >= FREE_LIMITED_BELIEFS_LIMIT;
}

export function identityLimitReached(identityCount: number): boolean {
  return !hasAlterXtra() && identityCount >= FREE_IDENTITY_LIMIT;
}

// Blue is the app default and Navy its closest dark neighbor — the two
// anchor looks stay free; the other six neon variants are the "every theme"
// Alter-Xtra already promises in the store listing.
export const FREE_THEMES: ThemeName[] = ['blue', 'navy'];

export function isThemeFree(theme: ThemeName): boolean {
  return hasAlterXtra() || FREE_THEMES.includes(theme);
}
