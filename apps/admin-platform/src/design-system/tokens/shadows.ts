/**
 * Shadow & Effect Tokens — Allkons Design System
 * Source: Figma "Allkons DS1" — Shadow page
 */

export const shadows = {
  // ─── Drop Shadows ─────────────────────────────────────────────────────────
  sm:   '0px 1px 3px 0px rgba(36,42,52,0.10)',
  md:   '0px 4px 8px 0px rgba(36,42,52,0.10)',
  lg:   '0px 6px 12px 0px rgba(36,42,52,0.10)',
  xl:   '0px 8px 24px 0px rgba(36,42,52,0.10)',
  '2xl': '0px 12px 36px 0px rgba(36,42,52,0.11)',
  '3xl': '0px 8px 32px 0px rgba(0,0,0,0.02)',
  none:  'none',
} as const;

/**
 * Focus ring box-shadows — used for interactive states
 */
export const focusRings = {
  // Brand
  'brand-default': '0 0 0 3px #CCEFD9',
  'brand-dark':    '0 0 0 0.5px #FFFFFF, 0 0 0 3px #99DFB4',
  'brand-darker':  '0 0 0 0.5px #FFFFFF, 0 0 0 2px #008C36',

  // Status
  success:  '0 0 0 3px #D4F2DE',
  warning:  '0 0 0 3px #FFEECE',
  error:    '0 0 0 3px #F7D2CF',
  info:     '0 0 0 3px #E0EFFA',
  neutral:  '0 0 0 3px #DEE1E6',
} as const;

/**
 * Blur effects
 */
export const blurs = {
  sm: 'blur(24px)',
  lg: 'blur(48px)',
} as const;

export type ShadowKey = keyof typeof shadows;
export type FocusRingKey = keyof typeof focusRings;
