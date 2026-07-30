import { colors } from './colors';

// "LCD" titles -> Orbitron (blocky, geometric, HUD-style display font).
// Body / "Spaceline" text -> Rajdhani (clean sci-fi-adjacent sans, highly legible).
export const fonts = {
  title: 'Orbitron_700Bold',
  titleMedium: 'Orbitron_600SemiBold',
  titleRegular: 'Orbitron_500Medium',
  body: 'Rajdhani_500Medium',
  bodyBold: 'Rajdhani_700Bold',
  bodyLight: 'Rajdhani_400Regular',
};

export const typography = {
  wordmark: {
    fontFamily: fonts.title,
    color: colors.textPrimary,
    letterSpacing: 6,
  },
  screenTitle: {
    fontFamily: fonts.title,
    fontSize: 22,
    color: colors.textPrimary,
    letterSpacing: 3,
    textShadowColor: colors.glowDim,
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 0 },
  },
  cardTitle: {
    fontFamily: fonts.titleMedium,
    fontSize: 18,
    color: colors.textPrimary,
    letterSpacing: 2,
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
