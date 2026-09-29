import { AppIconChoice } from '../store/types';

// Real photo-based avatars (Queen Savannah's own reference renders), one per
// icon choice — square, self-contained circular glow art, not tintable line
// work like the previous set. 'mystery' keeps its abstract "?" glyph.
const MARKS = {
  // All 5 marks, including 'mystery', are now real pre-rendered glow art —
  // tint would flatten their actual color/blur gradient to one flat color,
  // so none of them opt into it.
  male: { source: require('../../assets/icon-choice-male.png'), aspect: 1, tint: false },
  'male-mohawk': { source: require('../../assets/icon-choice-male-mohawk.png'), aspect: 1, tint: false },
  female: { source: require('../../assets/icon-choice-female.png'), aspect: 1, tint: false },
  'female-curly': { source: require('../../assets/icon-choice-female-curly.png'), aspect: 1, tint: false },
  mystery: { source: require('../../assets/identity-mark-mystery.png'), aspect: 193 / 302, tint: false },
} as const;

const WORDMARK = require('../../assets/wordmark.png');

export function markSource(icon: AppIconChoice | undefined) {
  // Falls back to 'male' for any icon value that isn't a real MARKS key —
  // not just undefined. A value can reach here that predates a later rename
  // of the choice-icon options (persisted in an existing identity or
  // onboarding draft from before the rename), and MARKS[icon] would then be
  // undefined, crashing every screen that renders the identity mark (home
  // hero, splash, app-lock) on the next line's access.
  return MARKS[icon as keyof typeof MARKS] ?? MARKS.male;
}

export function wordmarkSource() {
  return WORDMARK;
}
