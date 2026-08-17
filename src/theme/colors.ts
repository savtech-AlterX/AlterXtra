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

function rgba(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/**
 * The neon themes all share the same ground: pure black, as sampled from the
 * reference screens (#000000 page, #00040c card interiors). Only the accent
 * changes. Every accent clears WCAG AA against that ground.
 */
function neon(glow: string, glowStrong: string, accent: string): Palette {
  return {
    background: '#000000',
    backgroundElevated: '#000000',
    // Genuinely black, not a dark navy — card/panel definition is meant to
    // come entirely from the glowing border and shadow, not a lighter fill.
    // (The previous rgba(8,12,20,...) read as a visible blue tint on a real
    // device, confirmed against a screenshot, even though it looks almost
    // black in isolation.)
    panel: 'rgba(0, 0, 0, 0.82)',
    panelSolid: '#000000',

    glow,
    glowStrong,
    glowDim: rgba(glow, 0.35),
    border: rgba(glow, 0.5),
    borderDim: rgba(glow, 0.22),

    textPrimary: '#f1f2f3',
    textSecondary: '#8fa3b8',
    textMuted: '#6b7a8c',

    accentTeal: accent,
    danger: '#ff4d5e',
    success: '#3fe08a',
    warning: '#ffb648',

    overlay: 'rgba(0, 0, 0, 0.72)',
  };
}

// The free default: a calmer, desaturated steel-navy — distinct from the
// vivid electric "blue" below, which is one of the six accent themes.
// #5d84b8 clears WCAG AA against black at 5.46:1.
const navy = neon('#5d84b8', '#9db8dc', '#4a7db0');

// Accent trio per theme, matching the six rings on the premium reference.
// Blue is anchored on the real app screens (#0881d7 strokes, #4ea3f2 cores)
// rather than the small swatch ring, which reads more indigo than the UI does.
const blue = neon('#3da8f5', '#88cbfc', '#26cced');
const purple = neon('#a164f7', '#c49cfc', '#c74cf0');
const pink = neon('#f65aae', '#fc9ccf', '#f0426e');
const green = neon('#3eea86', '#7efcb2', '#1dedb9');
const amber = neon('#f7b23b', '#fcd188', '#ed6f26');
const white = neon('#c7cfdb', '#f2f5fa', '#99a6ba');

// Sampled pixel-for-pixel from the vintage reference: a neutral near-black
// ground (#131313) with warm cream ink (#d5cec4). No neon here, so the halos
// are dialled right down rather than tinted.
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

export const palettes = { navy, blue, purple, pink, green, amber, white, vintage } as const;
export type ThemeName = keyof typeof palettes;

// 'blue' ships as the default — sampled directly against the original
// reference screens (glow core measured at ~#55b8e8-#60accd from a clean
// card-border crop), and it already lands almost exactly there. 'navy' used
// to be the default as a deliberately desaturated "free" look, but that
// muted rendering is what made the shipped app read pale and washed out
// next to the reference; it stays in the picker as one of the eight, just
// no longer what a fresh install opens to.
export const DEFAULT_THEME: ThemeName = 'blue';

// Default palette. Static importers (there should be none outside the theme
// module) still resolve to the shipping default.
export const colors = blue;
