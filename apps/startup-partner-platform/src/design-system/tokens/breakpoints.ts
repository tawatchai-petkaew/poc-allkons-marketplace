/**
 * Breakpoint Tokens — Allkons Design System
 * Source: Figma "Allkons DS1" — Grid system page
 * Follows Ant Design breakpoints (main) + Tailwind (utility)
 */

export const breakpoints = {
  xs:  '320px',   // Extra Small
  sm:  '576px',   // Small (Ant Design) / 640px Tailwind
  md:  '768px',   // Medium
  lg:  '1024px',  // Large
  xl:  '1280px',  // Extra Large
  '2xl': '1536px', // 2X Large
} as const;

export type BreakpointKey = keyof typeof breakpoints;
