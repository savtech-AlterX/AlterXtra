import { AppIconChoice } from '../store/types';

// The artwork's alpha channel carries the whole picture — line detail and glow
// falloff both live there — so a tintColor recolours it to any theme without
// losing detail. That means one asset per figure rather than one per theme.
const AVATARS = {
  male: require('../../assets/avatar-male.png'),
  female: require('../../assets/avatar-female.png'),
} as const;

const MARKS = {
  male: require('../../assets/identity-mark.png'),
  female: require('../../assets/identity-mark-female.png'),
} as const;

// Smile plays on icon selection, wink plays on the loading screen — both
// need real drawn art, since the current marks are pure outline with no
// facial detail to manipulate (checked pixel-for-pixel, not assumed).
// Metro needs require() targets to exist at bundle time, so these can't be
// wired to real files until the art exists; every expression currently
// resolves back to MARKS until then. Once the four images land, add them
// here and each call site below starts working immediately with no other
// changes.
export type MarkExpression = 'neutral' | 'smile' | 'wink';

const WORDMARK = require('../../assets/wordmark.png');

// 'mystery' has no artwork of its own yet, so it falls back to the male figure.
const figureKey = (icon: AppIconChoice | undefined) => (icon === 'female' ? 'female' : 'male');

export function avatarSource(icon: AppIconChoice | undefined) {
  return AVATARS[figureKey(icon)];
}

export function markSource(icon: AppIconChoice | undefined, expression: MarkExpression = 'neutral') {
  // TODO: once identity-mark(-female)-smile.png and -wink.png exist, require
  // them here and return by [figureKey(icon)][expression] instead of always
  // falling through to the neutral mark.
  void expression;
  return MARKS[figureKey(icon)];
}

export function wordmarkSource() {
  return WORDMARK;
}

// Both avatar images are ~170x336, so one ratio covers each without distortion.
export const AVATAR_ASPECT = 1.97;
