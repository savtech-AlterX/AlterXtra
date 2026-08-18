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
// necessarily the final one.
//
// This is a real multi-frame arm-throw cycle (38 frames male, 37 female),
// not a handful of static held poses — the source collages were shot as
// ~100-frame sequences specifically so the motion would read as fluid human
// movement. An earlier version of this sampled roughly one frame per 10
// (e.g. 41, 51, 61) and held each for hundreds of ms; the frames in between
// carry real, visible in-between motion that sampling was throwing away,
// which is exactly why it read as jumpy rather than fluid. This uses every
// extracted frame from windup through the arm's full extension. It stops
// there rather than continuing into the frames where the plane is already
// visible in flight, since the plane's flight and growth are animated
// separately in MascotCompanion — carrying it through in these frames too
// would show it twice. Frames extracted the same way the walk cycle was:
// alpha-threshold + connected-component isolation, not hand-drawn. Male and
// female have different frame counts because the source material's usable
// arm-motion range before the plane enters frame differed by one row —
// callers index by icon's own array length, not a fixed count.
const THROW_CYCLES: Record<'male' | 'female', { source: number; aspect: number }[]> = {
  male: [
    { source: require('../../assets/avatar-male-seated.png'), aspect: 118 / 116 },
    { source: require('../../assets/avatar-male-motion-00.png'), aspect: 127 / 116 },
    { source: require('../../assets/avatar-male-motion-01.png'), aspect: 127 / 113 },
    { source: require('../../assets/avatar-male-motion-02.png'), aspect: 127 / 113 },
    { source: require('../../assets/avatar-male-motion-03.png'), aspect: 127 / 113 },
    { source: require('../../assets/avatar-male-motion-04.png'), aspect: 127 / 113 },
    { source: require('../../assets/avatar-male-motion-05.png'), aspect: 127 / 113 },
    { source: require('../../assets/avatar-male-motion-06.png'), aspect: 127 / 113 },
    { source: require('../../assets/avatar-male-motion-07.png'), aspect: 127 / 113 },
    { source: require('../../assets/avatar-male-motion-08.png'), aspect: 127 / 117 },
    { source: require('../../assets/avatar-male-motion-09.png'), aspect: 130 / 116 },
    { source: require('../../assets/avatar-male-motion-10.png'), aspect: 130 / 113 },
    { source: require('../../assets/avatar-male-motion-11.png'), aspect: 130 / 113 },
    { source: require('../../assets/avatar-male-motion-12.png'), aspect: 130 / 113 },
    { source: require('../../assets/avatar-male-motion-13.png'), aspect: 130 / 113 },
    { source: require('../../assets/avatar-male-motion-14.png'), aspect: 130 / 113 },
    { source: require('../../assets/avatar-male-motion-15.png'), aspect: 130 / 113 },
    { source: require('../../assets/avatar-male-motion-16.png'), aspect: 130 / 113 },
    { source: require('../../assets/avatar-male-motion-17.png'), aspect: 130 / 117 },
    { source: require('../../assets/avatar-male-motion-18.png'), aspect: 128 / 116 },
    { source: require('../../assets/avatar-male-motion-19.png'), aspect: 128 / 113 },
    { source: require('../../assets/avatar-male-motion-20.png'), aspect: 128 / 113 },
    { source: require('../../assets/avatar-male-motion-21.png'), aspect: 128 / 113 },
    { source: require('../../assets/avatar-male-motion-22.png'), aspect: 128 / 113 },
    { source: require('../../assets/avatar-male-motion-23.png'), aspect: 128 / 113 },
    { source: require('../../assets/avatar-male-motion-24.png'), aspect: 128 / 113 },
    { source: require('../../assets/avatar-male-motion-25.png'), aspect: 128 / 113 },
    { source: require('../../assets/avatar-male-motion-26.png'), aspect: 128 / 117 },
    { source: require('../../assets/avatar-male-motion-27.png'), aspect: 128 / 116 },
    { source: require('../../assets/avatar-male-motion-28.png'), aspect: 128 / 113 },
    { source: require('../../assets/avatar-male-motion-29.png'), aspect: 128 / 113 },
    { source: require('../../assets/avatar-male-motion-30.png'), aspect: 128 / 113 },
    { source: require('../../assets/avatar-male-motion-31.png'), aspect: 128 / 113 },
    { source: require('../../assets/avatar-male-motion-32.png'), aspect: 128 / 113 },
    { source: require('../../assets/avatar-male-motion-33.png'), aspect: 128 / 113 },
    { source: require('../../assets/avatar-male-motion-34.png'), aspect: 128 / 113 },
    { source: require('../../assets/avatar-male-motion-35.png'), aspect: 128 / 117 },
    { source: require('../../assets/avatar-male-settle.png'), aspect: 128 / 116 },
  ],
  female: [
    { source: require('../../assets/avatar-female-seated.png'), aspect: 224 / 256 },
    { source: require('../../assets/avatar-female-motion-00.png'), aspect: 119 / 114 },
    { source: require('../../assets/avatar-female-motion-01.png'), aspect: 119 / 110 },
    { source: require('../../assets/avatar-female-motion-02.png'), aspect: 119 / 108 },
    { source: require('../../assets/avatar-female-motion-03.png'), aspect: 119 / 107 },
    { source: require('../../assets/avatar-female-motion-04.png'), aspect: 119 / 107 },
    { source: require('../../assets/avatar-female-motion-05.png'), aspect: 119 / 108 },
    { source: require('../../assets/avatar-female-motion-06.png'), aspect: 119 / 107 },
    { source: require('../../assets/avatar-female-motion-07.png'), aspect: 119 / 108 },
    { source: require('../../assets/avatar-female-motion-08.png'), aspect: 119 / 107 },
    { source: require('../../assets/avatar-female-motion-09.png'), aspect: 118 / 114 },
    { source: require('../../assets/avatar-female-motion-10.png'), aspect: 118 / 110 },
    { source: require('../../assets/avatar-female-motion-11.png'), aspect: 118 / 108 },
    { source: require('../../assets/avatar-female-motion-12.png'), aspect: 118 / 107 },
    { source: require('../../assets/avatar-female-motion-13.png'), aspect: 118 / 107 },
    { source: require('../../assets/avatar-female-motion-14.png'), aspect: 118 / 108 },
    { source: require('../../assets/avatar-female-motion-15.png'), aspect: 118 / 107 },
    { source: require('../../assets/avatar-female-motion-16.png'), aspect: 118 / 108 },
    { source: require('../../assets/avatar-female-motion-17.png'), aspect: 118 / 107 },
    { source: require('../../assets/avatar-female-motion-18.png'), aspect: 118 / 114 },
    { source: require('../../assets/avatar-female-motion-19.png'), aspect: 118 / 110 },
    { source: require('../../assets/avatar-female-motion-20.png'), aspect: 118 / 108 },
    { source: require('../../assets/avatar-female-motion-21.png'), aspect: 118 / 107 },
    { source: require('../../assets/avatar-female-motion-22.png'), aspect: 118 / 107 },
    { source: require('../../assets/avatar-female-motion-23.png'), aspect: 118 / 108 },
    { source: require('../../assets/avatar-female-motion-24.png'), aspect: 118 / 107 },
    { source: require('../../assets/avatar-female-motion-25.png'), aspect: 118 / 108 },
    { source: require('../../assets/avatar-female-motion-26.png'), aspect: 118 / 107 },
    { source: require('../../assets/avatar-female-motion-27.png'), aspect: 119 / 114 },
    { source: require('../../assets/avatar-female-motion-28.png'), aspect: 119 / 110 },
    { source: require('../../assets/avatar-female-motion-29.png'), aspect: 119 / 108 },
    { source: require('../../assets/avatar-female-motion-30.png'), aspect: 119 / 107 },
    { source: require('../../assets/avatar-female-motion-31.png'), aspect: 119 / 107 },
    { source: require('../../assets/avatar-female-motion-32.png'), aspect: 119 / 108 },
    { source: require('../../assets/avatar-female-motion-33.png'), aspect: 119 / 107 },
    { source: require('../../assets/avatar-female-motion-34.png'), aspect: 119 / 108 },
    { source: require('../../assets/avatar-female-motion-35.png'), aspect: 119 / 107 },
  ],
};

const PAPER_PLANE = require('../../assets/paper-plane.png');
export const PAPER_PLANE_ASPECT = 37 / 39;

export function throwCycleLength(icon: AppIconChoice | undefined) {
  return THROW_CYCLES[figureKey(icon)].length;
}

// `frame` clamps rather than wraps — the last frame (arm settled/following
// through) is meant to hold once reached, not loop back to seated.
export function presentFrameSource(icon: AppIconChoice | undefined, frame: number) {
  const cycle = THROW_CYCLES[figureKey(icon)];
  return cycle[Math.max(0, Math.min(frame, cycle.length - 1))];
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
