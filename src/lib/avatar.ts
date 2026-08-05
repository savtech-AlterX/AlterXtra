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

const WORDMARK = require('../../assets/wordmark.png');

// 'mystery' has no artwork of its own yet, so it falls back to the male figure.
const figureKey = (icon: AppIconChoice | undefined) => (icon === 'female' ? 'female' : 'male');

export function avatarSource(icon: AppIconChoice | undefined) {
  return AVATARS[figureKey(icon)];
}

export function markSource(icon: AppIconChoice | undefined) {
  return MARKS[figureKey(icon)];
}

export function wordmarkSource() {
  return WORDMARK;
}

// Both avatar images are ~170x336, so one ratio covers each without distortion.
export const AVATAR_ASPECT = 1.97;
