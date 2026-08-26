import { AppIconChoice } from '../store/types';

// The logo used everywhere identity is represented as an icon rather than a
// full figure (home hero, loading screen, app-lock screen, etc.) — the same
// head-merges-into-a-question-mark linework as the real app icon and the
// choose-icon screen, not the plain suit-and-tie bust these used to point to.
// Each has its own aspect: the choice-icon art wasn't drawn to a shared
// canvas the way the avatar poses were. 'smile' is the same linework with a
// drawn-on smirk composited onto the jaw/mouth area — same white line style
// and glow as the rest of the mark, not a separate face. 'mystery' has no
// expression variants (it's an abstract "?" glyph, not a profile with a
// mouth), so it only ever resolves to its one neutral image.
const MARKS = {
  male: {
    neutral: { source: require('../../assets/icon-choice-male.png'), aspect: 368 / 633 },
    smile: { source: require('../../assets/icon-choice-male-smile.png'), aspect: 368 / 633 },
  },
  'male-mohawk': {
    neutral: { source: require('../../assets/icon-choice-male-mohawk.png'), aspect: 236 / 307 },
  },
  female: {
    neutral: { source: require('../../assets/icon-choice-female.png'), aspect: 362 / 716 },
    smile: { source: require('../../assets/icon-choice-female-smile.png'), aspect: 292 / 481 },
  },
  'female-curly': {
    neutral: { source: require('../../assets/icon-choice-female-curly.png'), aspect: 229 / 309 },
  },
  mystery: {
    neutral: { source: require('../../assets/identity-mark-mystery.png'), aspect: 290 / 480 },
  },
} as const;

// 'wink' has no art yet (no drawn eyes to wink with) — a call site can still
// ask for it, it'll just fall back to neutral until that art exists.
export type MarkExpression = 'neutral' | 'smile' | 'wink';

const WORDMARK = require('../../assets/wordmark.png');

export function markSource(icon: AppIconChoice | undefined, expression: MarkExpression = 'neutral') {
  const variants = MARKS[icon ?? 'male'];
  return (variants as Partial<Record<MarkExpression, { source: number; aspect: number }>>)[expression] ?? variants.neutral;
}

export function wordmarkSource() {
  return WORDMARK;
}
