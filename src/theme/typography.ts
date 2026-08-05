import { colors, Palette } from './colors';

export const fonts = {
  heading: 'ChakraPetch-SemiBold',
  headingMedium: 'ChakraPetch-Medium',
  body: 'ChakraPetch-Regular',
  bodyMedium: 'ChakraPetch-Medium',
  bodyBold: 'ChakraPetch-SemiBold',
};

/** The one place the type scale lives. Sizes and line heights are paired deliberately. */
function buildTypography(c: Palette) {
  return {
    screenTitle: {
      fontFamily: fonts.heading,
      fontSize: 22,
      lineHeight: 28,
      color: c.textPrimary,
    },
    cardTitle: {
      fontFamily: fonts.headingMedium,
      fontSize: 16,
      lineHeight: 21,
      color: c.textPrimary,
    },
    label: {
      fontFamily: fonts.headingMedium,
      fontSize: 12,
      letterSpacing: 1,
      color: c.textSecondary,
    },
    buttonLabel: {
      fontFamily: fonts.headingMedium,
      fontSize: 15,
      letterSpacing: 0.5,
      color: c.onPrimary,
    },
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

// Theme-aware variant. The static export above stays for the default palette;
// this lets components rebuild the same tokens against the active theme.
export const makeTypography = (c: Palette) => buildTypography(c);

export const makeCardShadow = (c: Palette) =>
  ({
    shadowColor: c.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  }) as const;
