import { cva } from 'class-variance-authority';

/**
 * Button Variants — Allkons Design System
 * Source: Figma "Allkons DS1" → Button (node: 40001561-21343)
 *
 * Figma dimensions:
 *   lg: h=48px, px=16px, py=12px, fontSize=18px
 *   md: h=40px, px=16px, py=8px,  fontSize=16px
 *   sm: h=32px, px=12px, py=4px,  fontSize=14px
 *   border-radius: 8px
 *   font-weight: 600
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
        // Primary — Filled
        'primary-brand': [
          'bg-primary text-white border border-primary',
          'hover:bg-primary-p20 hover:border-primary-p20',
          'active:bg-primary-p20 active:border-primary-p20',
          'focus-visible:shadow-focus-brand-dark',
          'disabled:bg-neutral-p90 disabled:border-neutral-p90 disabled:text-text-placeholder',
        ],
        'primary-error': [
          'bg-error text-white border border-error',
          'hover:bg-error-p20 hover:border-error-p20',
          'active:bg-error-p20 active:border-error-p20',
          'focus-visible:shadow-focus-error',
          'disabled:bg-neutral-p90 disabled:border-neutral-p90 disabled:text-text-placeholder',
        ],

        // Secondary — Outline
        'secondary-brand': [
          'bg-white text-primary-p20 border border-primary',
          'hover:bg-primary-p90 hover:border-primary-p20',
          'active:bg-primary-p90 active:border-primary-p20',
          'focus-visible:shadow-focus-brand-dark',
          'disabled:bg-neutral-p90 disabled:border-neutral-p90 disabled:text-text-placeholder',
        ],
        'secondary-neutral': [
          'bg-white text-text-secondary border border-border-primary',
          'hover:bg-background-secondary hover:border-neutral-p80',
          'active:bg-background-secondary active:border-neutral-p80',
          'focus-visible:shadow-focus-neutral',
          'disabled:bg-neutral-p90 disabled:border-neutral-p90 disabled:text-text-placeholder',
        ],
        'secondary-error': [
          'bg-white text-error border border-error',
          'hover:bg-error-p90 hover:border-error-p20',
          'active:bg-error-p90 active:border-error-p20',
          'focus-visible:shadow-focus-error',
          'disabled:bg-neutral-p90 disabled:border-neutral-p90 disabled:text-text-placeholder',
        ],

        // Tertiary — Ghost
        'tertiary-brand': [
          'bg-transparent text-primary-p20 border border-transparent',
          'hover:bg-primary-p90',
          'active:bg-primary-p90',
          'focus-visible:shadow-focus-brand-dark',
          'disabled:bg-neutral-p90 disabled:text-text-placeholder',
        ],
        'tertiary-neutral': [
          'bg-transparent text-neutral-20 border border-transparent',
          'hover:bg-neutral-p90',
          'active:bg-neutral-p90',
          'focus-visible:shadow-focus-neutral',
          'disabled:bg-neutral-p90 disabled:text-text-placeholder',
        ],
        'tertiary-error': [
          'bg-transparent text-error border border-transparent',
          'hover:bg-error-p90',
          'active:bg-error-p90',
          'focus-visible:shadow-focus-error',
          'disabled:bg-neutral-p90 disabled:text-text-placeholder',
        ],

        // Link
        'link-brand': [
          'bg-transparent text-primary-p20 border-none underline-offset-2',
          'hover:text-primary hover:underline',
          'active:text-primary',
          'focus-visible:shadow-focus-brand-dark',
          'disabled:text-text-placeholder',
        ],
        'link-neutral': [
          'bg-transparent text-neutral-20 border-none underline-offset-2',
          'hover:text-neutral-40 hover:underline',
          'active:text-neutral-40',
          'focus-visible:shadow-focus-neutral',
          'disabled:text-text-placeholder',
        ],
        'link-error': [
          'bg-transparent text-error border-none underline-offset-2',
          'hover:text-error-p20 hover:underline',
          'active:text-error-p20',
          'focus-visible:shadow-focus-error',
          'disabled:text-text-placeholder',
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
