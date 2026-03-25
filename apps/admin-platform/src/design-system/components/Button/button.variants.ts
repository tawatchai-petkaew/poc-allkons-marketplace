import { cva } from 'class-variance-authority';

/**
 * Button Variants — Allkons Design System
 * Source: Figma "Allkons DS1" → Button (node: 40001561:21343)
 *
 * Token layer:  alias.ts → tailwind.config.ts → here (no hex values)
 * Rendered by:  native <button> (no Ant Design wrapper)
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
    'border transition-colors duration-150 ease-in-out',
    'outline-none cursor-pointer',
    'disabled:cursor-not-allowed',
    'focus-visible:outline-none',
  ],
  {
    variants: {
      // ─── Variant × Color ──────────────────────────────────────────────
      variant: {

        // ── Primary / Filled ─────────────────────────────────────────────
        // Figma: Variant=Primary, Color=Brand
        // Default: bg=#00AF43, text=white, border=#00AF43
        // Hover:   bg=#008C36, text=#E5F7EC, border=#008C36
        'primary-brand': [
          'bg-primary text-white border-primary',
          'hover:bg-primary-hover hover:border-primary-hover hover:text-primary-subtle',
          'active:bg-primary-active active:border-primary-active active:text-primary-subtle',
          'focus-visible:shadow-focus-brand',
          'disabled:bg-neutral-disabled disabled:border-neutral-p95 disabled:text-neutral-p60',
        ],

        // Figma: Variant=Primary, Color=Error
        // Default: bg=#DA2110, text=white, border=#DA2110
        // Hover:   bg=#AE1A0C, text=#FBE8E7, border=#AE1A0C
        'primary-error': [
          'bg-error text-white border-error',
          'hover:bg-error-hover hover:border-error-hover hover:text-error-subtle',
          'active:bg-error-hover active:border-error-hover active:text-error-subtle',
          'focus-visible:shadow-focus-error',
          'disabled:bg-neutral-disabled disabled:border-neutral-p95 disabled:text-neutral-p60',
        ],

        // ── Secondary / Outline ───────────────────────────────────────────
        // Figma: Variant=Secondary, Color=Brand
        // Default: bg=transparent, text=#008C36, border=#00AF43
        // Hover:   bg=#E5F7EC, text=#006928, border=#008C36
        'secondary-brand': [
          'bg-transparent text-primary-text border-primary',
          'hover:bg-primary-subtle hover:border-primary-border-hover hover:text-primary-text-hover',
          'active:bg-primary-subtle active:border-primary-border-hover active:text-primary-text-hover',
          'focus-visible:shadow-focus-brand',
          'disabled:bg-neutral-disabled disabled:border-neutral-p95 disabled:text-neutral-p60',
        ],

        // Figma: Variant=Secondary, Color=Neutral
        // Default: bg=transparent, text=#37404F, border=#DEE1E6
        // Hover:   bg=#F7F8F9, text=#242A34, border=#BDC3CD
        'secondary-neutral': [
          'bg-transparent text-neutral-text border-neutral-border',
          'hover:bg-neutral-bg-hover hover:border-neutral-border-hover hover:text-neutral-text-hover',
          'active:bg-neutral-bg-hover active:border-neutral-border-hover active:text-neutral-text-hover',
          'focus-visible:shadow-focus-neutral',
          'disabled:bg-neutral-disabled disabled:border-neutral-p95 disabled:text-neutral-p60',
        ],

        // Figma: Variant=Secondary, Color=Error
        // Default: bg=white, text=#DA2110, border=#DA2110
        // Hover:   bg=#FBE8E7, text=#AE1A0C, border=#AE1A0C
        'secondary-error': [
          'bg-white text-error border-error',
          'hover:bg-error-subtle hover:border-error-hover hover:text-error-text-hover',
          'active:bg-error-subtle active:border-error-hover active:text-error-text-hover',
          'focus-visible:shadow-focus-error',
          'disabled:bg-neutral-disabled disabled:border-neutral-p95 disabled:text-neutral-p60',
        ],

        // ── Ghost / Tertiary ──────────────────────────────────────────────
        // Figma: Variant=Tertiary, Color=Brand
        // Default: bg=transparent, text=#008C36, border=transparent
        // Hover:   bg=#E5F7EC, text=#006928
        'tertiary-brand': [
          'bg-transparent text-primary-text border-transparent',
          'hover:bg-primary-subtle hover:text-primary-text-hover',
          'active:bg-primary-subtle active:text-primary-text-hover',
          'focus-visible:shadow-focus-brand',
          'disabled:bg-neutral-disabled disabled:text-neutral-p60',
        ],

        // Figma: Variant=Tertiary, Color=Neutral
        // Default: bg=transparent, text=#242A34, border=transparent
        // Hover:   bg=#F7F8F9, text=#12151A
        'tertiary-neutral': [
          'bg-transparent text-neutral-20 border-transparent',
          'hover:bg-neutral-bg-hover hover:text-neutral-text-strong',
          'active:bg-neutral-bg-hover active:text-neutral-text-strong',
          'focus-visible:shadow-focus-neutral',
          'disabled:bg-neutral-disabled disabled:text-neutral-p60',
        ],

        // Figma: Variant=Tertiary, Color=Error
        // Default: bg=transparent, text=#DA2110, border=transparent
        // Hover:   bg=#FBE8E7, text=#AE1A0C
        'tertiary-error': [
          'bg-transparent text-error border-transparent',
          'hover:bg-error-subtle hover:text-error-text-hover',
          'active:bg-error-subtle active:text-error-text-hover',
          'focus-visible:shadow-focus-error',
          'disabled:bg-neutral-disabled disabled:text-neutral-p60',
        ],

        // ── Link ─────────────────────────────────────────────────────────
        // Figma: Variant=Tertiary, Color=Brand, Type=Link
        // Default: text=#008C36
        // Hover:   text=#006928, underline
        'link-brand': [
          'bg-transparent text-primary-text border-none underline-offset-2',
          'hover:text-primary-text-hover hover:underline',
          'active:text-primary-text-hover',
          'focus-visible:shadow-focus-brand',
          'disabled:text-neutral-p60',
        ],

        // Figma: Variant=Tertiary, Color=Neutral, Type=Link
        // Default: text=#242A34
        // Hover:   text=#12151A, underline
        'link-neutral': [
          'bg-transparent text-neutral-20 border-none underline-offset-2',
          'hover:text-neutral-text-strong hover:underline',
          'active:text-neutral-text-strong',
          'focus-visible:shadow-focus-neutral',
          'disabled:text-neutral-p60',
        ],

        // Figma: Variant=Tertiary, Color=Error, Type=Link
        // Default: text=#DA2110
        // Hover:   text=#AE1A0C, underline
        'link-error': [
          'bg-transparent text-error border-none underline-offset-2',
          'hover:text-error-text-hover hover:underline',
          'active:text-error-text-hover',
          'focus-visible:shadow-focus-error',
          'disabled:text-neutral-p60',
        ],
      },

      // ─── Size ─────────────────────────────────────────────────────────
      // Figma: lg=48px, md=40px, sm=32px | border-radius=8px | weight=600
      size: {
        lg: 'h-12 px-4 py-3 text-lg',    // h=48px, px=16px, py=12px, font=18px
        md: 'h-10 px-4 py-2 text-base',  // h=40px, px=16px, py=8px,  font=16px
        sm: 'h-8  px-3 py-1 text-sm',    // h=32px, px=12px, py=4px,  font=14px
      },

      // ─── Full width ───────────────────────────────────────────────────
      fullWidth: {
        true:  'w-full',
        false: 'w-auto',
      },

      // ─── Icon only (square button) ───────────────────────────────────
      // Figma: Variant=*, Icon=Only
      iconOnly: {
        true:  '',
        false: '',
      },
    },

    // ─── Compound variants — icon only: force square (override w-auto + px from size) ──
    compoundVariants: [
      { iconOnly: true, size: 'lg', class: '!w-12 !px-0 !py-0' },
      { iconOnly: true, size: 'md', class: '!w-10 !px-0 !py-0' },
      { iconOnly: true, size: 'sm', class: '!w-8  !px-0 !py-0' },
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
