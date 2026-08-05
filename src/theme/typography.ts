import { colors, Palette } from './colors';

// Two voices, deliberately different jobs.
//
// TITLES + LABELS -> "LCD" (Samuel Reynolds, 1997/99). A segmented-display
// face: all-caps in feel, wide letterspacing, unmistakably HUD. This is the
// brand. Its licence grants use "for typesetting, screen presentation, and
// other normal typographic purposes with no restriction."
//
// BODY -> Chakra Petch (SIL Open Font License, free for commercial use). It
// replaced Spaceline, which was licensed for personal use only — unusable in
// an app that's being sold — and whose lowercase letters are drawn as
// capitals, so every sentence read as a block of shouting with no word-shape.
// Chakra Petch keeps the squared-off technical flavour but has real lowercase
// with proper ascenders and descenders, so paragraphs are actually readable.
//
// The rule: if you READ it, it's Chakra Petch. If you SCAN it, it's LCD.
export const fonts = {
  title: 'LCD-Bold',
  titleMedium: 'LCD2-Bold',
  titleRegular: 'LCD2-Bold',
  body: 'ChakraPetch-Regular',
  bodyMedium: 'ChakraPetch-Medium',
  bodyBold: 'ChakraPetch-SemiBold',
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

/**
 * The one place the type scale lives. Sizes and line heights are paired
 * deliberately — body copy without a line height set is the other half of why
 * the old text was hard to read.
 *
 * Note the glow is applied ONLY to the scanning voice. Glow on running text
 * smears the letterforms and costs legibility for no benefit.
 */
function buildTypography(c: Palette) {
  const glow = {
    textShadowColor: c.glowDim,
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 0 },
  } as const;

  return {
    // --- scanning voice: LCD, spaced, glowing ---
    wordmark: {
      fontFamily: fonts.title,
      color: c.textPrimary,
      letterSpacing: 6,
      ...glow,
    },
    screenTitle: {
      fontFamily: fonts.title,
      fontSize: 22,
      color: c.textPrimary,
      letterSpacing: 3,
      ...glow,
    },
    cardTitle: {
      fontFamily: fonts.titleMedium,
      fontSize: 18,
      color: c.textPrimary,
      letterSpacing: 2,
      ...glow,
    },
    label: {
      fontFamily: fonts.titleRegular,
      fontSize: 12,
      color: c.glow,
      letterSpacing: 2,
    },
    buttonLabel: {
      fontFamily: fonts.titleMedium,
      fontSize: 14,
      letterSpacing: 2,
      color: c.textPrimary,
    },

    // --- reading voice: Chakra Petch, no glow, real line height ---
    body: {
      fontFamily: fonts.body,
      fontSize: 15,
      lineHeight: 22,
      color: c.textPrimary,
    },
    bodyStrong: {
      fontFamily: fonts.bodyBold,
      fontSize: 15,
      lineHeight: 22,
      color: c.textPrimary,
    },
    bodyMuted: {
      fontFamily: fonts.body,
      fontSize: 14,
      lineHeight: 20,
      color: c.textSecondary,
    },
    caption: {
      fontFamily: fonts.body,
      fontSize: 12,
      lineHeight: 17,
      color: c.textMuted,
    },
  } as const;
}

export const typography = buildTypography(colors);

// Theme-aware variants. The static export above stays for the default palette;
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

export const makeTypography = (c: Palette) => buildTypography(c);
