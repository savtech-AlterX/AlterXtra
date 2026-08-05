import { colors, Palette } from './colors';

// Titles -> the actual "LCD" font (Samuel Reynolds, freeware, segmented
// display face). LCD2 has wider gaps between segments, more legible at
// smaller sizes; plain LCD reads better large. Both are uppercase-only.
// Body text -> the actual "Spaceline" font (Din Studio, free for personal
// use — a commercial license is needed if this app is published/sold).
export const fonts = {
  title: 'LCD-Bold',
  titleMedium: 'LCD2-Bold',
  titleRegular: 'LCD2-Bold',
  body: 'Spaceline-Regular',
  bodyBold: 'Spaceline-Regular',
  bodyLight: 'Spaceline-Regular',
};

// Shared neon-glow halo, reused on titles and icons throughout the app.
export const glowShadow = {
  textShadowColor: colors.glowDim,
  textShadowRadius: 12,
  textShadowOffset: { width: 0, height: 0 },
} as const;

// Pass to any @expo/vector-icons component's `style` prop for the same glow halo.
export const iconGlow = {
  textShadowColor: colors.glowDim,
  textShadowRadius: 10,
  textShadowOffset: { width: 0, height: 0 },
} as const;

export const typography = {
  wordmark: {
    fontFamily: fonts.title,
    color: colors.textPrimary,
    letterSpacing: 6,
    ...glowShadow,
  },
  screenTitle: {
    fontFamily: fonts.title,
    fontSize: 22,
    color: colors.textPrimary,
    letterSpacing: 3,
    ...glowShadow,
  },
  cardTitle: {
    fontFamily: fonts.titleMedium,
    fontSize: 18,
    color: colors.textPrimary,
    letterSpacing: 2,
    ...glowShadow,
  },
  label: {
    fontFamily: fonts.titleRegular,
    fontSize: 12,
    color: colors.glow,
    letterSpacing: 2,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textPrimary,
  },
  bodyMuted: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  buttonLabel: {
    fontFamily: fonts.titleMedium,
    fontSize: 14,
    letterSpacing: 2,
    color: colors.textPrimary,
  },
} as const;

// Theme-aware variants. The static exports above stay for the default palette;
// these let components rebuild the same tokens against the active theme.
export const makeGlowShadow = (c: Palette) =>
  ({
    textShadowColor: c.glowDim,
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 0 },
  }) as const;

export const makeIconGlow = (c: Palette) =>
  ({
    textShadowColor: c.glowDim,
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
  }) as const;

export const makeTypography = (c: Palette) => {
  const glow = makeGlowShadow(c);
  return {
    wordmark: { fontFamily: fonts.title, color: c.textPrimary, letterSpacing: 6, ...glow },
    screenTitle: { fontFamily: fonts.title, fontSize: 22, color: c.textPrimary, letterSpacing: 3, ...glow },
    cardTitle: { fontFamily: fonts.titleMedium, fontSize: 18, color: c.textPrimary, letterSpacing: 2, ...glow },
    label: { fontFamily: fonts.titleRegular, fontSize: 12, color: c.glow, letterSpacing: 2 },
    body: { fontFamily: fonts.body, fontSize: 16, color: c.textPrimary },
    bodyMuted: { fontFamily: fonts.body, fontSize: 14, color: c.textSecondary },
    buttonLabel: { fontFamily: fonts.titleMedium, fontSize: 14, letterSpacing: 2, color: c.textPrimary },
  } as const;
};
