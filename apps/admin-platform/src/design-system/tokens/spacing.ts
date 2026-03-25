/**
 * Spacing Tokens — Allkons Design System
 * Source: Figma "Allkons DS1" — Spacing page
 * Base unit: 4px mini unit
 */

export const spacing = {
  0:   '0px',
  1:   '4px',    // 1 unit
  2:   '8px',    // 2 units
  3:   '12px',   // 3 units
  4:   '16px',   // 4 units
  5:   '20px',   // 5 units
  6:   '24px',   // 6 units
  7:   '28px',   // 7 units
  8:   '32px',   // 8 units
  9:   '36px',   // 9 units
  10:  '40px',   // 10 units
  12:  '48px',   // 12 units
  14:  '56px',   // 14 units
  16:  '64px',   // 16 units
  20:  '80px',   // 20 units
  24:  '96px',   // 24 units
  30:  '120px',  // 30 units
  40:  '160px',  // 40 units
} as const;

/**
 * Semantic spacing aliases
 */
export const spacingAlias = {
  // Component internal
  'component-xs':  spacing[1],   // 4px — icon padding, tight gaps
  'component-sm':  spacing[2],   // 8px — small padding
  'component-md':  spacing[3],   // 12px — default component padding
  'component-lg':  spacing[4],   // 16px — large component padding
  'component-xl':  spacing[6],   // 24px — extra large padding

  // Layout
  'section-sm':    spacing[6],   // 24px
  'section-md':    spacing[8],   // 32px
  'section-lg':    spacing[12],  // 48px
  'section-xl':    spacing[16],  // 64px
  'section-2xl':   spacing[24],  // 96px
} as const;

export type SpacingKey = keyof typeof spacing;
