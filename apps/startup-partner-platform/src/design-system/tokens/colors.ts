/**
 * Color Tokens — Allkons Design System
 * Source: Figma "Allkons DS1" — Color system page
 */

export const colors = {
  // ─── Primary (Brand Green) ────────────────────────────────────────────────
  primary: {
    DEFAULT: '#00AF43',
    p20: '#008C36',
    p40: '#33BF69',
    p60: '#99DFB4',
    p80: '#CCEFD9',
    p90: '#E5F7EC',
    dark: '#006928',
    hover: '#E5F7EC',
  },

  // ─── Success ──────────────────────────────────────────────────────────────
  success: {
    DEFAULT: '#1EB950',
    p20: '#16873A',
    p60: '#97DFAE',
    p80: '#ACE5BE',
    p90: '#E8F8ED',
    darker: '#11662C',
  },

  // ─── Warning ──────────────────────────────────────────────────────────────
  warning: {
    DEFAULT: '#FFAB08',
    p20: '#CC8906',
    p60: '#FFDD9C',
    p80: '#FFEECE',
    p90: '#FFF7E6',
    darker: '#996705',
    subtle: '#FFF3E6',
  },

  // ─── Error ────────────────────────────────────────────────────────────────
  error: {
    DEFAULT: '#DA2110',
    p20: '#AE1A0C',
    p60: '#F0A69F',
    p80: '#F7D2CF',
    p90: '#FBE8E7',
    dark: '#AE1A0C',
    hover: '#FBE8E7',
  },

  // ─── Info ─────────────────────────────────────────────────────────────────
  info: {
    DEFAULT: '#65B2E8',
    p60: '#C1E0F5',
    p80: '#E0EFFA',
    p90: '#EFF7FC',
    darker: '#3C6A8B',
  },

  // ─── Neutral ──────────────────────────────────────────────────────────────
  neutral: {
    '00': '#090B0D',   // neutral-90
    20: '#242A34',     // neutral-60
    40: '#37404F',     // neutral-40
    60: '#5B6A83',
    p60: '#9DA6B5',
    p80: '#DEE1E6',
    p90: '#EFF0F3',
    p95: '#F7F8F9',
  },

  // ─── Text ─────────────────────────────────────────────────────────────────
  text: {
    primary: '#12151A',
    secondary: '#37404F',
    tertiary: '#495569',
    quaternary: '#5B6A83',
    quinary: '#7C889C',
    placeholder: '#9DA6B5',
    disabled: '#BDC3CD',
    brand: '#008C36',
  },

  // ─── Background ───────────────────────────────────────────────────────────
  background: {
    primary: '#FFFFFF',
    secondary: '#F7F8F9',
    tertiary: '#DEE1E6',
    hover: '#F7F8F9',
  },

  // ─── Border ───────────────────────────────────────────────────────────────
  border: {
    primary: '#DEE1E6',
    secondary: '#BDC3CD',
    brand: '#99DFB4',
    brandLight: '#33BF69',
  },

  // ─── Brand (Blue) ─────────────────────────────────────────────────────────
  brand: {
    DEFAULT: '#477AB3',
    p20: '#477AB3',
    p60: '#B5CAE1',
    p90: '#F3F8FD',
    darker: '#183E60',
  },

  // ─── Lavender Purple ──────────────────────────────────────────────────────
  lavender: {
    DEFAULT: '#A3A2DD',
    p20: '#8282B1',
    p60: '#DADAF1',
    p90: '#F6F6FC',
  },

  // ─── Dark Orange ──────────────────────────────────────────────────────────
  darkOrange: {
    DEFAULT: '#E44218',
    p20: '#E96846',
    p90: '#FCECE8',
  },

  // ─── Static ───────────────────────────────────────────────────────────────
  white: '#FFFFFF',
  black: '#000000',
  disabled: '#DEE1E6',
} as const;

export type ColorKey = keyof typeof colors;
