export type Palette = {
  mode: 'light' | 'dark';
  background: string;
  backgroundElevated: string;
  card: string;
  cardBorder: string;
  border: string;
  borderDim: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  onPrimary: string;
  primary: string;
  primaryStrong: string;
  primaryDim: string;
  secondary: string;
  accent: string;
  danger: string;
  success: string;
  warning: string;
  overlay: string;
  shadow: string;
};

function rgba(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

// A living, growing-things palette: leaf green as the primary action colour,
// warm earth as a secondary accent, and sky blue as a tertiary highlight —
// meant to read as "outdoors" rather than "app chrome."
const leaf = '#2f9e5c';
const leafStrong = '#1f7a44';
const earth = '#c98a4b';
const sky = '#3aa0c9';

export const light: Palette = {
  mode: 'light',
  background: '#f6f8f4',
  backgroundElevated: '#ffffff',
  card: '#ffffff',
  cardBorder: '#e4e9df',
  border: '#dfe6d9',
  borderDim: '#eceef0',
  textPrimary: '#16261a',
  textSecondary: '#4c5c4f',
  textMuted: '#83907f',
  onPrimary: '#ffffff',
  primary: leaf,
  primaryStrong: leafStrong,
  primaryDim: rgba(leaf, 0.12),
  secondary: earth,
  accent: sky,
  danger: '#d84f4f',
  success: leaf,
  warning: '#c98a2c',
  overlay: 'rgba(15, 25, 17, 0.5)',
  shadow: 'rgba(20, 35, 22, 0.12)',
};

export const dark: Palette = {
  mode: 'dark',
  background: '#0d1410',
  backgroundElevated: '#131c15',
  card: '#182219',
  cardBorder: '#26362a',
  border: '#2c3e30',
  borderDim: '#1c2820',
  textPrimary: '#eef3ea',
  textSecondary: '#aebbaa',
  textMuted: '#78876f',
  onPrimary: '#08150c',
  primary: '#4cc180',
  primaryStrong: '#6fd69a',
  primaryDim: 'rgba(76, 193, 128, 0.16)',
  secondary: '#e3a262',
  accent: '#5fbcdf',
  danger: '#e77373',
  success: '#4cc180',
  warning: '#e0ab5a',
  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: 'rgba(0, 0, 0, 0.4)',
};

export const palettes = { light, dark } as const;
export type ThemeName = keyof typeof palettes;

export const DEFAULT_THEME: ThemeName = 'light';

// Default palette. Static importers (there should be none outside the theme
// module) still resolve to the shipping default.
export const colors = light;
