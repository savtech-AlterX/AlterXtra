import { FREE_GOAL_LIMIT, FREE_HABIT_LIMIT, FREE_IDENTITY_LIMIT,
  FREE_LIMITED_BELIEFS_LIMIT, goalLimitReached, habitLimitReached, hasAlterXtra,
  identityLimitReached, isThemeFree, limitedBeliefsLimitReached,
  setAlterXtraPreview, setPurchasedAlterXtra } from '../entitlements';

const runtime = global as typeof globalThis & { __DEV__: boolean };
const originalDev = runtime.__DEV__;
afterEach(() => {
  runtime.__DEV__ = originalDev;
  setPurchasedAlterXtra(false);
  setAlterXtraPreview(false);
});

it('a verified purchase unlocks all content limits and paid themes, and revocation restores limits', () => {
  runtime.__DEV__ = false;
  const checks = () => [goalLimitReached(FREE_GOAL_LIMIT), habitLimitReached(FREE_HABIT_LIMIT),
    identityLimitReached(FREE_IDENTITY_LIMIT), limitedBeliefsLimitReached(FREE_LIMITED_BELIEFS_LIMIT)];
  setPurchasedAlterXtra(false);
  expect(checks()).toEqual([true, true, true, true]);
  expect(isThemeFree('purple')).toBe(false);
  setPurchasedAlterXtra(true);
  expect(checks()).toEqual([false, false, false, false]);
  expect(isThemeFree('purple')).toBe(true);
  setPurchasedAlterXtra(false);
  expect(checks()).toEqual([true, true, true, true]);
});

it('a saved preview setting cannot unlock premium in a release build', () => {
  runtime.__DEV__ = false;
  setAlterXtraPreview(true);
  expect(hasAlterXtra()).toBe(false);
  expect(isThemeFree('blue')).toBe(true);
  expect(isThemeFree('navy')).toBe(true);
  expect(isThemeFree('purple')).toBe(false);
});
