/**
 * Typography Tokens — Allkons Design System
 * Source: Figma "Allkons DS1" — Typography page
 * Font: Noto Sans Thai Looped (primary), Kanit (secondary)
 */

export const fontFamily = {
  primary: '"Noto Sans Thai Looped", sans-serif',
  secondary: '"Kanit", sans-serif',
} as const;

export const fontWeight = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/**
 * Font sizes in px — mapped to rem for web
 */
export const fontSize = {
  'context-menu': { px: 10, rem: '0.625rem' },  // Context Menu / Error
  'error':        { px: 10, rem: '0.625rem' },
  'xs':           { px: 12, rem: '0.75rem' },   // Extra small
  'sm':           { px: 14, rem: '0.875rem' },  // Small / Label
  'md':           { px: 16, rem: '1rem' },      // Middle / Button Middle
  'lg':           { px: 18, rem: '1.125rem' },  // Big / Button Big
  'h6':           { px: 16, rem: '1rem' },
  'h5':           { px: 20, rem: '1.25rem' },
  'h4':           { px: 24, rem: '1.5rem' },
  'h3':           { px: 28, rem: '1.75rem' },
  'h2':           { px: 32, rem: '2rem' },
  'h1':           { px: 40, rem: '2.5rem' },
  'd6':           { px: 36, rem: '2.25rem' },
  'd5':           { px: 44, rem: '2.75rem' },
  'd4':           { px: 48, rem: '3rem' },
  'd3':           { px: 56, rem: '3.5rem' },
  'd2':           { px: 64, rem: '4rem' },
  'd1':           { px: 72, rem: '4.5rem' },
} as const;

/**
 * Line heights in px
 */
export const lineHeight = {
  'context-menu': 10,
  'error':        10,
  'xs':           16,
  'sm':           20,
  'md':           24,
  'lg':           24,
  'h6':           24,
  'h5':           26,
  'h4':           28,
  'h3':           32,
  'h2':           44,
  'h1':           48,
  'd6':           48,
  'd5':           52,
  'd4':           56,
  'd3':           64,
  'd2':           76,
  'd1':           86,
} as const;

/**
 * Complete text styles — from Figma
 */
export const textStyles = {
  // Display
  'display-d1': { fontSize: 72, lineHeight: 86, fontWeight: fontWeight.bold },
  'display-d2': { fontSize: 64, lineHeight: 76, fontWeight: fontWeight.bold },
  'display-d3': { fontSize: 56, lineHeight: 64, fontWeight: fontWeight.bold },
  'display-d4': { fontSize: 48, lineHeight: 56, fontWeight: fontWeight.bold },
  'display-d5': { fontSize: 44, lineHeight: 52, fontWeight: fontWeight.bold },
  'display-d6': { fontSize: 36, lineHeight: 48, fontWeight: fontWeight.bold },

  // Heading
  'heading-h1': { fontSize: 40, lineHeight: 48, fontWeight: fontWeight.bold },
  'heading-h2': { fontSize: 32, lineHeight: 44, fontWeight: fontWeight.bold },
  'heading-h3': { fontSize: 28, lineHeight: 32, fontWeight: fontWeight.bold },
  'heading-h4': { fontSize: 24, lineHeight: 28, fontWeight: fontWeight.bold },
  'heading-h5': { fontSize: 20, lineHeight: 26, fontWeight: fontWeight.bold },
  'heading-h6': { fontSize: 16, lineHeight: 24, fontWeight: fontWeight.bold },

  // Page / Section
  'page-title':  { fontSize: 24, lineHeight: 28, fontWeight: fontWeight.bold },
  'subtitle':    { fontSize: 14, lineHeight: 20, fontWeight: fontWeight.regular },

  // Big (18px)
  'big-regular':     { fontSize: 18, lineHeight: 24, fontWeight: fontWeight.regular },
  'big-medium':      { fontSize: 18, lineHeight: 24, fontWeight: fontWeight.medium },
  'big-semibold':    { fontSize: 18, lineHeight: 24, fontWeight: fontWeight.bold },
  'big-strikethrough': { fontSize: 18, lineHeight: 24, fontWeight: fontWeight.regular },

  // Middle (16px)
  'middle-regular':  { fontSize: 16, lineHeight: 24, fontWeight: fontWeight.regular },
  'middle-medium':   { fontSize: 16, lineHeight: 24, fontWeight: fontWeight.medium },
  'middle-semibold': { fontSize: 16, lineHeight: 24, fontWeight: fontWeight.semibold },
  'middle-strike':   { fontSize: 16, lineHeight: 24, fontWeight: fontWeight.regular },

  // Small (14px)
  'small-regular':   { fontSize: 14, lineHeight: 20, fontWeight: fontWeight.regular },
  'small-medium':    { fontSize: 14, lineHeight: 20, fontWeight: fontWeight.medium },
  'small-semibold':  { fontSize: 14, lineHeight: 20, fontWeight: fontWeight.semibold },
  'small-strike':    { fontSize: 14, lineHeight: 20, fontWeight: fontWeight.regular },

  // Extra small (12px)
  'xs-regular':  { fontSize: 12, lineHeight: 16, fontWeight: fontWeight.regular },
  'xs-medium':   { fontSize: 12, lineHeight: 16, fontWeight: fontWeight.medium },
  'xs-semibold': { fontSize: 12, lineHeight: 16, fontWeight: fontWeight.semibold },
  'xs-strike':   { fontSize: 12, lineHeight: 16, fontWeight: fontWeight.regular },
  'all-caps':    { fontSize: 12, lineHeight: 16, fontWeight: fontWeight.regular, letterSpacing: '0.08em' },

  // Button
  'button-big':    { fontSize: 18, lineHeight: 24, fontWeight: fontWeight.semibold },
  'button-middle': { fontSize: 16, lineHeight: 24, fontWeight: fontWeight.semibold },
  'button-small':  { fontSize: 14, lineHeight: 24, fontWeight: fontWeight.semibold },

  // Label / Input
  'label-input-middle': { fontSize: 16, lineHeight: 24, fontWeight: fontWeight.regular },
  'label-input-small':  { fontSize: 14, lineHeight: 20, fontWeight: fontWeight.regular },
  'label-list':         { fontSize: 14, lineHeight: 20, fontWeight: fontWeight.regular },
  'label-selection':    { fontSize: 16, lineHeight: 24, fontWeight: fontWeight.regular },
  'clickable-label':    { fontSize: 14, lineHeight: 20, fontWeight: fontWeight.bold },
  'value-list':         { fontSize: 14, lineHeight: 20, fontWeight: fontWeight.bold },

  // Link
  'link-big':    { fontSize: 18, lineHeight: 24, fontWeight: fontWeight.light },
  'link-middle': { fontSize: 16, lineHeight: 24, fontWeight: fontWeight.light },
  'link-small':  { fontSize: 14, lineHeight: 24, fontWeight: fontWeight.light },

  // Special
  'placeholder':    { fontSize: 16, lineHeight: 24, fontWeight: fontWeight.regular },
  'context-menu':   { fontSize: 10, lineHeight: 10, fontWeight: fontWeight.regular },
  'error-msg':      { fontSize: 10, lineHeight: 10, fontWeight: fontWeight.regular, letterSpacing: '0.4px' },
} as const;

export type TextStyleKey = keyof typeof textStyles;
