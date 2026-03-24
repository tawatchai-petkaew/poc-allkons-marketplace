import { cva } from 'class-variance-authority';

/**
 * Button Variants — Allkons Design System
 * Source: Figma "Allkons DS1" → Button (node: 40001561:21343)
 * Tokens verified via Figma MCP get_variable_defs
 *
 * Token Layer:  alias.ts → tailwind.config.ts → here (no hex values)
 *
 * Figma dimensions:
 *   lg: h=48px, px=16px, py=12px, fontSize=18px
 *   md: h=40px, px=16px, py=8px,  fontSize=16px
 *   sm: h=32px, px=12px, py=4px,  fontSize=14px
 *   border-radius: 8px  |  font-weight: 600
 */
export const buttonVariants = cva(
  // ─── Base ────────────────────────────────────────────────────────────────
  [
    'inline-flex items-center justify-center gap-2',
    'rounded-md font-semibold leading-6 select-none',
    'transition-all duration-150 ease-in-out',
    'outline-none cursor-pointer',
    'disabled:cursor-not-allowed',
  ],
  {
    variants: {
      // ─── Variant × Color ──────────────────────────────────────────────
      variant: {
        // ── Primary (Filled) ─────────────────────────────────────────────
        // Brand: bg=#00AF43→#008C36, text=white→#E5F7EC, border matches bg
        // Figma: Component/Button/Primary/Brand/*_hover
        'primary-brand': [
          '!bg-primary !text-white !border !border-primary',
          'hover:!bg-primary-hover hover:!border-primary-hover hover:!text-primary-subtle',
          'active:!bg-primary-hover active:!border-primary-hover active:!text-primary-subtle',
          'focus-visible:!shadow-focus-brand',
          'disabled:!bg-neutral-p90 disabled:!border-neutral-p95 disabled:!text-neutral-p60',
        ],
        // Error: bg=#DA2110→#AE1A0C, text=white→#FBE8E7
        // Figma: Component/Button/Primary/Error/*_hover
        'primary-error': [
          '!bg-error !text-white !border !border-error',
          'hover:!bg-error-hover hover:!border-error-border-hover hover:!text-error-subtle',
          'active:!bg-error-hover active:!border-error-border-hover active:!text-error-subtle',
          'focus-visible:!shadow-focus-error',
          'disabled:!bg-neutral-p90 disabled:!border-neutral-p95 disabled:!text-neutral-p60',
        ],

        // ── Secondary (Outline) ───────────────────────────────────────────
        // Brand: border=#00AF43, text=#008C36 → hover bg=#E5F7EC, text=#006928, border=#008C36
        // Figma: Component/Button/Secondary/Brand/*_hover
        'secondary-brand': [
          '!bg-transparent !text-primary-text !border !border-primary',
          'hover:!bg-primary-subtle hover:!border-primary-border-hover hover:!text-primary-text-hover',
          'active:!bg-primary-subtle active:!border-primary-border-hover active:!text-primary-text-hover',
          'focus-visible:!shadow-focus-brand',
          'disabled:!bg-neutral-p90 disabled:!border-neutral-p95 disabled:!text-neutral-p60',
        ],
        // Neutral: border=#DEE1E6, text=#37404F → hover bg=#F7F8F9, border=#BDC3CD, text=#242A34
        // Figma: Component/Button/Secondary/Neutral/*_hover
        'secondary-neutral': [
          '!bg-transparent !text-neutral-text !border !border-neutral-border',
          'hover:!bg-neutral-bg-hover hover:!border-neutral-border-hover hover:!text-neutral-text-hover',
          'active:!bg-neutral-bg-hover active:!border-neutral-border-hover active:!text-neutral-text-hover',
          'focus-visible:!shadow-focus-neutral',
          'disabled:!bg-neutral-p90 disabled:!border-neutral-p95 disabled:!text-neutral-p60',
        ],
        // Error: bg=#FFF, border=#DA2110, text=#DA2110 → hover bg=#FBE8E7, border=#AE1A0C, text=#AE1A0C
        // Figma: Component/Button/Secondary/Error/*_hover
        'secondary-error': [
          '!bg-white !text-error !border !border-error',
          'hover:!bg-error-subtle hover:!border-error-border-hover hover:!text-error-text-hover',
          'active:!bg-error-subtle active:!border-error-border-hover active:!text-error-text-hover',
          'focus-visible:!shadow-focus-error',
          'disabled:!bg-neutral-p90 disabled:!border-neutral-p95 disabled:!text-neutral-p60',
        ],

        // ── Ghost (Tertiary) ──────────────────────────────────────────────
        // Brand: text=#008C36 → hover bg=#E5F7EC, text=#006928
        // Figma: Component/Button/Tertiary/Brand/*_hover
        'tertiary-brand': [
          '!bg-transparent !text-primary-text !border !border-transparent',
          'hover:!bg-primary-subtle hover:!text-primary-text-hover',
          'active:!bg-primary-subtle active:!text-primary-text-hover',
          'focus-visible:!shadow-focus-brand',
          'disabled:!bg-neutral-p90 disabled:!text-neutral-p60',
        ],
        // Neutral: text=#242A34 → hover bg=#F7F8F9, text=#12151A
        // Figma: Component/Button/Tertiary/Neutal/*_hover
        'tertiary-neutral': [
          '!bg-transparent !text-neutral-20 !border !border-transparent',
          'hover:!bg-neutral-bg-hover hover:!text-neutral-text-strong',
          'active:!bg-neutral-bg-hover active:!text-neutral-text-strong',
          'focus-visible:!shadow-focus-neutral',
          'disabled:!bg-neutral-p90 disabled:!text-neutral-p60',
        ],
        // Error: text=#DA2110 → hover bg=#FBE8E7, text=#AE1A0C
        // Figma: Component/Button/Tertiary/Error/*_hover
        'tertiary-error': [
          '!bg-transparent !text-error !border !border-transparent',
          'hover:!bg-error-subtle hover:!text-error-text-hover',
          'active:!bg-error-subtle active:!text-error-text-hover',
          'focus-visible:!shadow-focus-error',
          'disabled:!bg-neutral-p90 disabled:!text-neutral-p60',
        ],

        // ── Link ─────────────────────────────────────────────────────────
        // Brand: text=#008C36 → hover text=#006928
        'link-brand': [
          '!bg-transparent !text-primary-text border-none underline-offset-2',
          'hover:!text-primary-text-hover hover:underline',
          'active:!text-primary-text-hover',
          'focus-visible:!shadow-focus-brand',
          'disabled:!text-neutral-p60',
        ],
        // Neutral: text=#242A34 → hover text=#12151A
        'link-neutral': [
          '!bg-transparent !text-neutral-20 border-none underline-offset-2',
          'hover:!text-neutral-text-strong hover:underline',
          'active:!text-neutral-text-strong',
          'focus-visible:!shadow-focus-neutral',
          'disabled:!text-neutral-p60',
        ],
        // Error: text=#DA2110 → hover text=#AE1A0C
        'link-error': [
          '!bg-transparent !text-error border-none underline-offset-2',
          'hover:!text-error-text-hover hover:underline',
          'active:!text-error-text-hover',
          'focus-visible:!shadow-focus-error',
          'disabled:!text-neutral-p60',
        ],
      },

      // ─── Size ─────────────────────────────────────────────────────────
      size: {
        lg: 'h-12 px-4 py-3 text-lg',   // h=48px, px=16px, py=12px, font=18px
        md: 'h-10 px-4 py-2 text-base',  // h=40px, px=16px, py=8px,  font=16px
        sm: 'h-8  px-3 py-1 text-sm',   // h=32px, px=12px, py=4px,  font=14px
      },

      // ─── Full width ───────────────────────────────────────────────────
      fullWidth: {
        true:  'w-full',
        false: 'w-auto',
      },

      // ─── Icon only (square button) ───────────────────────────────────
      iconOnly: {
        true:  '',
        false: '',
      },
    },

    // ─── Compound variants — icon only overrides padding/width ────────
    compoundVariants: [
      { iconOnly: true, size: 'lg', class: 'w-12 px-0' },
      { iconOnly: true, size: 'md', class: 'w-10 px-0' },
      { iconOnly: true, size: 'sm', class: 'w-8  px-0' },
    ],

    defaultVariants: {
      variant:   'primary-brand',
      size:      'md',
      fullWidth:  false,
      iconOnly:   false,
    },
  }
);

export type ButtonVariant =
  | 'primary-brand'   | 'primary-error'
  | 'secondary-brand' | 'secondary-neutral' | 'secondary-error'
  | 'tertiary-brand'  | 'tertiary-neutral'  | 'tertiary-error'
  | 'link-brand'      | 'link-neutral'      | 'link-error';

export type ButtonSize = 'sm' | 'md' | 'lg';
