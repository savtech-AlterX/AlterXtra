export type Palette = {
  background: string;
  backgroundElevated: string;
  panel: string;
  panelSolid: string;
  glow: string;
  glowStrong: string;
  glowDim: string;
  border: string;
  borderDim: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentTeal: string;
  danger: string;
  success: string;
  warning: string;
  overlay: string;
};

// Colors sampled directly from the reference design (pixel-picked from the
// provided screenshots), then deepened to navy per explicit request rather
// than staying pure black.
const navy: Palette = {
  background: '#03050f',
  backgroundElevated: '#060a1a',
  panel: 'rgba(6, 12, 28, 0.7)',
  panelSolid: '#050912',

  glow: '#3fa9ff',
  glowStrong: '#63c2ff',
  glowDim: 'rgba(63, 169, 255, 0.35)',
  border: 'rgba(63, 169, 255, 0.55)',
  borderDim: 'rgba(63, 169, 255, 0.25)',

  textPrimary: '#eaf4ff',
  textSecondary: '#7fa8c9',
  // Lightened from the original #4d6b85 (3.6:1) to clear WCAG AA's 4.5:1
  // body-text contrast minimum against the navy background, same hue.
  textMuted: '#5a7d9b',

  // Sampled from the "build your reality" tagline in the reference.
  accentTeal: '#72ddf2',
  danger: '#ff4d5e',
  success: '#3fe08a',
  warning: '#ffb648',

  overlay: 'rgba(0, 0, 0, 0.65)',
};

// Sampled pixel-for-pixel from the vintage reference: a neutral near-black
// ground (#131313) with warm cream ink (#d5cec4). There is no neon here, so
// the "glow" role is carried by the cream itself and the halos are dialled
// right down rather than tinted.
const vintage: Palette = {
  background: '#131313',
  backgroundElevated: '#1b1a18',
  panel: 'rgba(30, 28, 25, 0.72)',
  panelSolid: '#191817',

  glow: '#d5cec4',
  glowStrong: '#ece5da',
  glowDim: 'rgba(213, 206, 196, 0.18)',
  border: 'rgba(213, 206, 196, 0.42)',
  borderDim: 'rgba(213, 206, 196, 0.18)',

  textPrimary: '#ece7dd',
  textSecondary: '#a89f93',
  // Raised from the literal sample so body text clears WCAG AA on #131313.
  textMuted: '#8a8175',

  accentTeal: '#c8bda8',
  danger: '#c2564b',
  success: '#8a9a6b',
  warning: '#c99a4e',

  overlay: 'rgba(0, 0, 0, 0.7)',
};

// Sampled from the black-and-white reference: near-black card (#0e0e0f) with
// pure white ink (#fcfbfc). Stark and flat by design — no glow at all.
const mono: Palette = {
  background: '#0e0e0f',
  backgroundElevated: '#161617',
  panel: 'rgba(24, 24, 26, 0.72)',
  panelSolid: '#141415',

  glow: '#fcfbfc',
  glowStrong: '#ffffff',
  glowDim: 'rgba(252, 251, 252, 0.14)',
  border: 'rgba(252, 251, 252, 0.38)',
  borderDim: 'rgba(252, 251, 252, 0.16)',

  textPrimary: '#fcfbfc',
  textSecondary: '#a8a8aa',
  textMuted: '#7e7e81',

  accentTeal: '#d4d4d6',
  danger: '#e0574f',
  success: '#9fb89f',
  warning: '#d6b464',

  overlay: 'rgba(0, 0, 0, 0.75)',
};

export const palettes = { navy, vintage, mono } as const;
export type ThemeName = keyof typeof palettes;

// Default palette. Existing imports of `colors` keep working unchanged.
export const colors = navy;
