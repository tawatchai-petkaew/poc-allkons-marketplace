'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: Feature icon — Size × Color × Type × Radius

export type FeatureIconSize   = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type FeatureIconColor  = 'Gray' | 'Brand' | 'Pink' | 'Success' | 'Warning' | 'Error' | 'Info';
export type FeatureIconType   = 'Light' | 'Dark' | 'Modern';
export type FeatureIconRadius = 'Rounded' | 'Full-Rounded';

export interface FeatureIconProps extends VariantProps<typeof featureIconVariants> {
  /** Icon content (SVG, img, or any React node) */
  children: React.ReactNode;
  className?: string;
}

// ─── CVA variants ─────────────────────────────────────────────────────────────

const featureIconVariants = cva(
  'inline-flex items-center justify-center shrink-0 overflow-hidden',
  {
    variants: {
      // Figma sizes: xs=24, sm=32, md=36, lg=40, xl=48, 2xl=56
      size: {
        xs:  'w-6 h-6',      // 24px
        sm:  'w-8 h-8',      // 32px
        md:  'w-9 h-9',      // 36px
        lg:  'w-10 h-10',    // 40px
        xl:  'w-12 h-12',    // 48px
        '2xl': 'w-14 h-14',  // 56px
      },

      // Radius
      radius: {
        'Rounded':      'rounded-md',   // 8px
        'Full-Rounded': 'rounded-full',
      },

      // Color × Type combined (252 = 7 × 3 × 2 × 6, radius/size orthogonal)
      // bg + text (icon color)
      color: {
        Gray:    '',
        Brand:   '',
        Pink:    '',
        Success: '',
        Warning: '',
        Error:   '',
        Info:    '',
      },

      type: {
        Light:   '',
        Dark:    '',
        Modern:  '',
      },
    },

    // ── Compound variants — Color × Type → bg + text ────────────────────────
    compoundVariants: [
      // ─ Light ─────────────────────────────────────────────────────────────
      { color: 'Gray',    type: 'Light',  class: 'bg-neutral-p95 text-neutral-40' },
      { color: 'Brand',   type: 'Light',  class: 'bg-primary-subtle text-primary' },
      { color: 'Pink',    type: 'Light',  class: 'bg-lavender-p90 text-lavender-00' },
      { color: 'Success', type: 'Light',  class: 'bg-success-subtle text-success' },
      { color: 'Warning', type: 'Light',  class: 'bg-warning-subtle text-warning' },
      { color: 'Error',   type: 'Light',  class: 'bg-error-subtle text-error' },
      { color: 'Info',    type: 'Light',  class: 'bg-info-subtle text-info' },

      // ─ Dark ──────────────────────────────────────────────────────────────
      { color: 'Gray',    type: 'Dark',   class: 'bg-neutral-40 text-white' },
      { color: 'Brand',   type: 'Dark',   class: 'bg-primary text-white' },
      { color: 'Pink',    type: 'Dark',   class: 'bg-lavender-00 text-white' },
      { color: 'Success', type: 'Dark',   class: 'bg-success text-white' },
      { color: 'Warning', type: 'Dark',   class: 'bg-warning text-white' },
      { color: 'Error',   type: 'Dark',   class: 'bg-error text-white' },
      { color: 'Info',    type: 'Dark',   class: 'bg-info text-white' },

      // ─ Modern (white bg, colored border + icon) ───────────────────────────
      { color: 'Gray',    type: 'Modern', class: 'bg-white border border-neutral-border text-neutral-40' },
      { color: 'Brand',   type: 'Modern', class: 'bg-white border border-primary text-primary' },
      { color: 'Pink',    type: 'Modern', class: 'bg-white border border-lavender-00 text-lavender-00' },
      { color: 'Success', type: 'Modern', class: 'bg-white border border-success text-success' },
      { color: 'Warning', type: 'Modern', class: 'bg-white border border-warning text-warning' },
      { color: 'Error',   type: 'Modern', class: 'bg-white border border-error text-error' },
      { color: 'Info',    type: 'Modern', class: 'bg-white border border-info text-info' },
    ],

    defaultVariants: {
      size:   'md',
      color:  'Brand',
      type:   'Light',
      radius: 'Rounded',
    },
  }
);

// ─── Icon size map (inner icon should be ~50–60% of container) ────────────────

const iconSizeClass: Record<FeatureIconSize, string> = {
  xs:  'w-3 h-3',   // 12px inside 24px
  sm:  'w-4 h-4',   // 16px inside 32px
  md:  'w-5 h-5',   // 20px inside 36px
  lg:  'w-5 h-5',   // 20px inside 40px
  xl:  'w-6 h-6',   // 24px inside 48px
  '2xl': 'w-7 h-7', // 28px inside 56px
};

// ─── Component ────────────────────────────────────────────────────────────────

export const FeatureIcon = ({
  size   = 'md',
  color  = 'Brand',
  type   = 'Light',
  radius = 'Rounded',
  children,
  className,
}: FeatureIconProps) => (
  <span className={clsx(featureIconVariants({ size, color, type, radius }), className)}>
    <span className={clsx('inline-flex items-center justify-center', iconSizeClass[size as FeatureIconSize])}>
      {children}
    </span>
  </span>
);

FeatureIcon.displayName = 'FeatureIcon';
