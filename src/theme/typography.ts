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
