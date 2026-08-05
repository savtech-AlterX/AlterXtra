import { AppIconChoice } from '../store/types';
import { ThemeName } from '../theme/colors';

// require() needs static paths, so every theme variant is listed explicitly.
// The non-navy files are luminance-preserving recolours of the originals, so
// the line detail survives instead of flattening into a silhouette.
const AVATARS = {
  male: {
    navy: require('../../assets/avatar-male.png'),
    vintage: require('../../assets/avatar-male.vintage.png'),
    mono: require('../../assets/avatar-male.mono.png'),
  },
  female: {
    navy: require('../../assets/avatar-female.png'),
    vintage: require('../../assets/avatar-female.vintage.png'),
    mono: require('../../assets/avatar-female.mono.png'),
  },
} as const;

const MARKS = {
  male: {
    navy: require('../../assets/identity-mark.png'),
    vintage: require('../../assets/identity-mark.vintage.png'),
    mono: require('../../assets/identity-mark.mono.png'),
  },
  female: {
    navy: require('../../assets/identity-mark-female.png'),
    vintage: require('../../assets/identity-mark-female.vintage.png'),
    mono: require('../../assets/identity-mark-female.mono.png'),
  },
} as const;

const WORDMARKS = {
  navy: require('../../assets/wordmark.png'),
  vintage: require('../../assets/wordmark.vintage.png'),
  mono: require('../../assets/wordmark.mono.png'),
} as const;

// 'mystery' has no artwork of its own yet, so it falls back to the male figure.
const figureKey = (icon: AppIconChoice | undefined) => (icon === 'female' ? 'female' : 'male');

export function avatarSource(icon: AppIconChoice | undefined, theme: ThemeName = 'navy') {
  return AVATARS[figureKey(icon)][theme];
}

export function markSource(icon: AppIconChoice | undefined, theme: ThemeName = 'navy') {
  return MARKS[figureKey(icon)][theme];
}

export function wordmarkSource(theme: ThemeName = 'navy') {
  return WORDMARKS[theme];
}

// Both avatar images are ~170x336, so one ratio covers each without distortion.
export const AVATAR_ASPECT = 1.97;
