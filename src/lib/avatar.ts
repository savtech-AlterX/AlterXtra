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
  mystery: require('../../assets/identity-mark-mystery.png'),
} as const;

// The mascot's one-time "here's Alter-Xtra" sequence: it leans, then walks
// over and holds this pose. Female-only for now — male versions don't exist
// yet, so poseSource() falls back to the plain standing figure for male
// rather than a missing pose, which is a smaller visual gap than a crash or
// a broken image.
export type MascotPose = 'lean' | 'reveal';

const POSES: Partial<Record<AppIconChoice, Record<MascotPose, { source: number; aspect: number }>>> = {
  female: {
    lean: { source: require('../../assets/avatar-female-lean.png'), aspect: 1290 / 485 },
    reveal: { source: require('../../assets/avatar-female-reveal.png'), aspect: 1405 / 555 },
  },
};

// A real 4-frame side-profile walk cycle (stride / pass / stride / pass),
// plus the matching side-profile standing pose. All five share one canvas —
// extracted from a single generated sheet and normalised so the feet land on
// the same baseline and the hips sit at the same x, which is what stops the
// figure jittering as the frames advance.
//
// Before this, the mascot slid the front-facing standing figure sideways,
// which is why it read as gliding rather than walking.
const WALK_ASPECT = 617 / 272;

const WALK_CYCLES: Partial<Record<AppIconChoice, { stand: number; frames: number[] }>> = {
  female: {
    stand: require('../../assets/avatar-female-side.png'),
    frames: [
      require('../../assets/avatar-female-walk-1.png'),
      require('../../assets/avatar-female-walk-2.png'),
      require('../../assets/avatar-female-walk-3.png'),
      require('../../assets/avatar-female-walk-4.png'),
    ],
  },
};

// The current Alter-Xtra premium reveal: seated in a chair, winds up and
// throws a paper airplane that flies off and bursts — replacing the older
// lean/walk/reveal sequence above, which is left in place rather than
// deleted (only swapped which one beginAlterXtraPresent in
// MascotCompanion actually runs) since this is the current choice, not
// necessarily the final one. Extracted from reference collages the same
// way the walk-cycle frames were: alpha-threshold + connected-component
// isolation, not hand-drawn.
export type PresentPose = 'seated' | 'windup' | 'throw';

const PRESENT_POSES: Record<'male' | 'female', Record<PresentPose, { source: number; aspect: number }>> = {
  male: {
    seated: { source: require('../../assets/avatar-male-seated.png'), aspect: 118 / 116 },
    windup: { source: require('../../assets/avatar-male-windup.png'), aspect: 127 / 116 },
    throw: { source: require('../../assets/avatar-male-throw.png'), aspect: 130 / 116 },
  },
  female: {
    seated: { source: require('../../assets/avatar-female-seated.png'), aspect: 118 / 114 },
    windup: { source: require('../../assets/avatar-female-windup.png'), aspect: 119 / 114 },
    throw: { source: require('../../assets/avatar-female-throw.png'), aspect: 118 / 114 },
  },
};

const PAPER_PLANE = require('../../assets/paper-plane.png');
export const PAPER_PLANE_ASPECT = 37 / 39;

export function presentPoseSource(icon: AppIconChoice | undefined, pose: PresentPose) {
  return PRESENT_POSES[figureKey(icon)][pose];
}

export function paperPlaneSource() {
  return PAPER_PLANE;
}

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
  // Unlike figureKey (which collapses 'mystery' to the male body for the
  // full-figure mascot, since 'mystery' isn't a real avatar to walk around
  // as), the mark has its own dedicated art — a question-mark glyph, not a
  // fallback face — so it's looked up directly rather than through figureKey.
  return MARKS[icon === 'female' ? 'female' : icon === 'mystery' ? 'mystery' : 'male'];
}

export function wordmarkSource() {
  return WORDMARK;
}

// Returns null when this icon has no art for that pose yet — callers fall
// back to the plain standing figure rather than rendering nothing.
export function poseSource(icon: AppIconChoice | undefined, pose: MascotPose) {
  return POSES[figureKey(icon)]?.[pose] ?? null;
}

/**
 * The side-profile walk cycle for this icon, or null if it has none yet
 * (male, currently) — callers fall back to sliding the standing figure.
 * `frame` wraps, so callers can pass a monotonically increasing counter.
 */
export function walkFrameSource(icon: AppIconChoice | undefined, frame: number) {
  const cycle = WALK_CYCLES[figureKey(icon)];
  if (!cycle) return null;
  const frames = cycle.frames;
  return { source: frames[((frame % frames.length) + frames.length) % frames.length], aspect: WALK_ASPECT };
}

export function sideStandSource(icon: AppIconChoice | undefined) {
  const cycle = WALK_CYCLES[figureKey(icon)];
  return cycle ? { source: cycle.stand, aspect: WALK_ASPECT } : null;
}

// Both avatar images are 370x1180 — the female figure is padded onto the same
// canvas as the male so one ratio covers both without distortion.
export const AVATAR_ASPECT = 1180 / 370;
