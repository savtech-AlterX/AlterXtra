// Colors sampled directly from the reference design (pixel-picked from the
// provided screenshots), then deepened to navy per explicit request rather
// than staying pure black.
export const colors = {
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
  textMuted: '#4d6b85',

  // Sampled from the "build your reality" tagline in the reference.
  accentTeal: '#72ddf2',
  danger: '#ff4d5e',
  success: '#3fe08a',
  warning: '#ffb648',

  overlay: 'rgba(0, 0, 0, 0.65)',
} as const;
