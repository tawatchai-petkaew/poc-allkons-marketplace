/**
 * Border Radius Tokens — Allkons Design System
 * Source: Figma "Allkons DS1" — Border radius page
 * Base unit: 4px mini unit
 */

export const borderRadius = {
  none:  '0px',
  sm:    '4px',   // 1 unit — tags, chips, badges
  md:    '8px',   // 2 units — inputs, buttons, cards (default)
  lg:    '12px',  // 3 units — modals, popovers
  xl:    '16px',  // 4 units — panels, drawers
  '2xl': '24px',  // 6 units — cards with heavy rounding
  full:  '9999px', // pills, avatars
} as const;

export type BorderRadiusKey = keyof typeof borderRadius;
