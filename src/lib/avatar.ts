import { AppIconChoice } from '../store/types';

// Full-body avatar art, keyed off the identity mark chosen during onboarding.
// 'mystery' has no distinct avatar yet, so it falls back to the male figure.
export function avatarSource(icon: AppIconChoice | undefined) {
  return icon === 'female'
    ? require('../../assets/avatar-female.png')
    : require('../../assets/avatar-male.png');
}

// Both source images are ~170x336, so one ratio covers each without distortion.
export const AVATAR_ASPECT = 1.97;
