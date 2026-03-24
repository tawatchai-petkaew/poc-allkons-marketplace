import type { Config } from 'tailwindcss';
import { primitive } from './src/design-system/tokens/primitives';
import { brand, errorColor, neutralColor, status, text, background, border, neutral } from './src/design-system/tokens/alias';

/**
 * Tailwind CSS Config — Allkons Design System
 * Source: Figma "Allkons DS1" (nvIkFt5uZvU9R7uGJginT2)
 *
 * Token Architecture:
 *   Layer 1 — primitive  → src/design-system/tokens/primitives.ts
 *   Layer 2 — alias      → src/design-system/tokens/alias.ts
 *   Layer 3 — component  → buttonTokens in alias.ts / Ant Design theme
 *
 * Tailwind uses Layer 2 (alias) — no hex values here.
 */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand (Primary Green) ──────────────────────────────────────────
        primary: {
          DEFAULT:  brand.default,
          hover:    brand.hover,          // #008C36 — filled hover bg ✓
          active:   brand.active,
          subtle:   brand.subtle,         // #E5F7EC — outlined/ghost hover bg ✓
          text:     brand.text,           // #008C36
          'text-hover': brand.textHover,  // #006928
          border:   brand.border,
          'border-hover': brand.borderHover,
          'focus-ring': brand.focusRing,
          disabled: brand.bgDisabled,
        },

        // ── Error (Red) ────────────────────────────────────────────────────
        error: {
          DEFAULT:  errorColor.default,
          hover:    errorColor.hover,
          subtle:   errorColor.subtle,
          border:   errorColor.border,
          'border-hover': errorColor.borderHover,
          text:     errorColor.text,
          'text-hover': errorColor.textHover,
          'focus-ring': errorColor.focusRing,
        },

        // ── Neutral ────────────────────────────────────────────────────────
        neutral: {
          text:     neutralColor.text,
          'text-hover': neutralColor.textHover,
          'text-strong': neutralColor.textStrong,
          border:   neutralColor.border,
          'border-hover': neutralColor.borderHover,
          bg:       neutralColor.bg,
          'bg-hover': neutralColor.bgHover,
          disabled: neutralColor.bgDisabled,
          'focus-ring': neutralColor.focusRing,
          // Scale (for direct use)
          // Keys are remapped so Tailwind classes match what button.variants.ts expects:
          //   neutral-20 = #242A34, neutral-p60 = #BDC3CD (disabled text), etc.
          '00':  neutral['90'],   // #090B0D
          '10':  neutral['70'],   // #1B2027
          '20':  neutral['60'],   // #242A34 — button default text ✓
          '40':  neutral['40'],   // #37404F
          '60':  neutral['00'],   // #5B6A83
          'p60': neutral.p60,    // #BDC3CD — button disabled text ✓
          'p70': neutral.p70,    // #CED2DA
          'p80': neutral.p80,    // #DEE1E6
          'p90': neutral.p90,    // #EFF0F3 — button disabled bg ✓
          'p95': neutral.p95,    // #F7F8F9 — button disabled border ✓
        },

        // ── Status ─────────────────────────────────────────────────────────
        success: {
          DEFAULT:  status.success.default,
          hover:    status.success.hover,
          subtle:   status.success.subtle,
          'focus-ring': status.success.focusRing,
        },
        warning: {
          DEFAULT:  status.warning.default,
          hover:    status.warning.hover,
          subtle:   status.warning.subtle,
          'focus-ring': status.warning.focusRing,
        },
        info: {
          DEFAULT:  status.info.default,
          hover:    status.info.hover,
          subtle:   status.info.subtle,
          'focus-ring': status.info.focusRing,
        },

        // ── Text ───────────────────────────────────────────────────────────
        text: {
          primary:     text.primary,
          secondary:   text.secondary,
          tertiary:    text.tertiary,
          quaternary:  text.quaternary,
          placeholder: text.placeholder,
          disabled:    text.disabled,
          brand:       text.brand,
        },

        // ── Background ─────────────────────────────────────────────────────
        background: {
          primary:   background.primary,
          secondary: background.secondary,
          tertiary:  background.tertiary,
        },

        // ── Border ─────────────────────────────────────────────────────────
        border: {
          primary:    border.primary,
          secondary:  border.secondary,
          brand:      border.brand,
          'brand-light': border.brandLight,
          error:      border.error,
        },

        // ── Accent palettes (primitive reference) ──────────────────────────
        brand: {
          DEFAULT: primitive.oceanBlue['00'],  // #477AB3
          darker:  primitive.oceanBlue['20'],  // #39628F
          lighter: primitive.oceanBlue.p90,   // #EDF2F7
          p60:     primitive.oceanBlue.p60,   // #B5CAE1
        },
        lavender: {
          '00':  primitive.lavender['00'],
          '20':  primitive.lavender['20'],
          p60:   primitive.lavender.p60,
          p90:   primitive.lavender.p90,
        },
        darkOrange: {
          '00': primitive.orange['00'],
          '20': primitive.orange['20'],
          p90:  primitive.orange.p90,
        },

        white: primitive.gray.white,
      },

      // ─── Box Shadow ───────────────────────────────────────────────────────
      boxShadow: {
        sm:    '0px 1px 3px 0px rgba(36,42,52,0.10)',
        md:    '0px 4px 8px 0px rgba(36,42,52,0.10)',
        lg:    '0px 6px 12px 0px rgba(36,42,52,0.10)',
        xl:    '0px 8px 24px 0px rgba(36,42,52,0.10)',
        '2xl': '0px 12px 36px 0px rgba(36,42,52,0.11)',
        '3xl': '0px 8px 32px 0px rgba(0,0,0,0.02)',
        // Focus rings (from Figma "Focus Ring/*")
        'focus-brand':        `0 0 0 3px ${primitive.green.p80}`,
        'focus-brand-dark':   `0 0 0 0.5px #FFFFFF, 0 0 0 3px ${primitive.green.p60}`,
        'focus-brand-darker': `0 0 0 0.5px #FFFFFF, 0 0 0 2px ${primitive.green['20']}`,
        'focus-error':        `0 0 0 3px ${primitive.red.p80}`,
        'focus-warning':      `0 0 0 3px ${primitive.orange.p80}`,   // #FFEECE
        'focus-success':      `0 0 0 3px ${primitive.green.p80}`,    // #D4F2DE
        'focus-info':         `0 0 0 3px ${primitive.blue.p80}`,     // #E0EFFA
        'focus-neutral':      `0 0 0 3px ${neutral.p80}`,            // #DEE1E6
      },

      // ─── Border Radius (4px base unit from Figma) ─────────────────────────
      borderRadius: {
        none:    '0px',
        sm:      '4px',
        DEFAULT: '8px',
        md:      '8px',
        lg:      '12px',
        xl:      '16px',
        '2xl':   '24px',
        full:    '9999px',
      },

      // ─── Breakpoints (Figma "Grid system" page) ───────────────────────────
      screens: {
        xs:    '320px',
        sm:    '576px',
        md:    '768px',
        lg:    '1024px',
        xl:    '1280px',
        '2xl': '1536px',
      },

      // ─── Font Family ──────────────────────────────────────────────────────
      fontFamily: {
        sans:                    ['"Noto Sans Thai Looped"', 'sans-serif'],
        'noto-sans-thai-looped': ['"Noto Sans Thai Looped"', 'sans-serif'],
        kanit:                   ['"Kanit"', 'sans-serif'],
      },

      // ─── Spacing (4px base unit from Figma) ───────────────────────────────
      spacing: {
        1:  '4px',
        2:  '8px',
        3:  '12px',
        4:  '16px',
        5:  '20px',
        6:  '24px',
        7:  '28px',
        8:  '32px',
        9:  '36px',
        10: '40px',
        12: '48px',
        14: '56px',
        16: '64px',
        20: '80px',
        24: '96px',
        30: '120px',
        40: '160px',
      },
    },
  },
  plugins: [],
};

export default config;
