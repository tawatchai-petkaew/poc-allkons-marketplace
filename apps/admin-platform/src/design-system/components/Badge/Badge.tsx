'use client';

import React, { type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: Badge — node 40001675:11478
// Type = {Pill|Badge} × {gost|outline|solid} → shape + variant props
// Color = Gray | Brand | Error | Success | Warning | Info | Purple

export type BadgeShape   = 'pill' | 'badge';
export type BadgeVariant = 'ghost' | 'outline' | 'solid';
export type BadgeColor   = 'gray' | 'brand' | 'error' | 'success' | 'warning' | 'info' | 'purple';

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: ReactNode;
  /** Show a colored dot on the left */
  dot?: boolean;
  /** Leading icon node (e.g. CountryIcon, FeatureIcon) */
  leadingIcon?: ReactNode;
  /** Callback to dismiss — renders an × button on the right */
  onDismiss?: () => void;
  className?: string;
}

// ─── CVA ──────────────────────────────────────────────────────────────────────
// Figma sizes: Medium = h-6 (24px), text-sm (14px/20px), min-w-6
// Padding (no icon): px-2 (8px both)
// Padding (dot/leading icon): pl-2 pr-3
// Padding (dismiss): pl-3 pr-2

const badgeVariants = cva(
  'inline-flex items-center justify-center shrink-0 border border-solid overflow-hidden whitespace-nowrap font-normal text-sm leading-5',
  {
    variants: {
      shape: {
        pill:  'rounded-full',
        badge: 'rounded-sm',
      },
      variant: {
        ghost:   '',
        outline: 'bg-transparent',
        solid:   '',
      },
      color: {
        gray:    '',
        brand:   '',
        error:   '',
        success: '',
        warning: '',
        info:    '',
        purple:  '',
      },
    },

    compoundVariants: [
      // ── ghost ──────────────────────────────────────────────────────────────
      { variant: 'ghost', color: 'gray',    class: 'bg-neutral-p95 border-neutral-p80  text-neutral-20' },
      { variant: 'ghost', color: 'brand',   class: 'bg-primary-subtle border-primary-border text-primary-text' },
      { variant: 'ghost', color: 'error',   class: 'bg-error-subtle  border-error-border  text-error' },
      { variant: 'ghost', color: 'success', class: 'bg-success-subtle border-success       text-success' },
      { variant: 'ghost', color: 'warning', class: 'bg-warning-subtle border-warning       text-warning' },
      { variant: 'ghost', color: 'info',    class: 'bg-info-subtle    border-info          text-info' },
      { variant: 'ghost', color: 'purple',  class: 'bg-lavender-p90  border-lavender-p60  text-lavender-00' },

      // ── outline ────────────────────────────────────────────────────────────
      { variant: 'outline', color: 'gray',    class: 'border-neutral-40 text-neutral-40' },
      { variant: 'outline', color: 'brand',   class: 'border-primary    text-primary-text' },
      { variant: 'outline', color: 'error',   class: 'border-error      text-error' },
      { variant: 'outline', color: 'success', class: 'border-success    text-success' },
      { variant: 'outline', color: 'warning', class: 'border-warning    text-warning' },
      { variant: 'outline', color: 'info',    class: 'border-info       text-info' },
      { variant: 'outline', color: 'purple',  class: 'border-lavender-00 text-lavender-00' },

      // ── solid ──────────────────────────────────────────────────────────────
      { variant: 'solid', color: 'gray',    class: 'bg-neutral-40 border-neutral-40 text-neutral-p95' },
      { variant: 'solid', color: 'brand',   class: 'bg-primary    border-primary    text-primary-subtle' },
      { variant: 'solid', color: 'error',   class: 'bg-error      border-error      text-white' },
      { variant: 'solid', color: 'success', class: 'bg-success    border-success    text-white' },
      { variant: 'solid', color: 'warning', class: 'bg-warning    border-warning    text-white' },
      { variant: 'solid', color: 'info',    class: 'bg-info       border-info       text-white' },
      { variant: 'solid', color: 'purple',  class: 'bg-lavender-00 border-lavender-00 text-white' },
    ],

    defaultVariants: {
      shape:   'pill',
      variant: 'ghost',
      color:   'gray',
    },
  }
);

// ─── X close button ───────────────────────────────────────────────────────────

const XIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
    <path
      d="M1 1L9 9M9 1L1 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

export const Badge = ({
  shape   = 'pill',
  variant = 'ghost',
  color   = 'gray',
  dot,
  leadingIcon,
  onDismiss,
  children,
  className,
}: BadgeProps) => {
  // Guard: reject empty objects Storybook may inject for ReactNode controls
  const validLeadingIcon = React.isValidElement(leadingIcon) || typeof leadingIcon === 'string'
    ? leadingIcon
    : null;

  const hasLeading = dot || !!validLeadingIcon;

  return (
    <span
      className={clsx(
        badgeVariants({ shape, variant, color }),
        'h-6',
        // Padding — Figma: px=8 default, leading widens right to 12, dismiss widens left to 12
        hasLeading && onDismiss ? 'pl-2 pr-2 gap-1'
          : hasLeading          ? 'pl-2 pr-3 gap-2'
          : onDismiss           ? 'pl-3 pr-2 gap-1'
          : 'px-2 min-w-6',
        className,
      )}
    >
      {/* Leading: dot */}
      {dot && !validLeadingIcon && (
        <span className="shrink-0 w-2 h-2 rounded-full bg-current" aria-hidden />
      )}

      {/* Leading: icon slot */}
      {validLeadingIcon && (
        <span className="shrink-0 inline-flex items-center justify-center">
          {validLeadingIcon}
        </span>
      )}

      {/* Label */}
      {children}

      {/* Trailing: dismiss button */}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-full hover:opacity-70 transition-opacity cursor-pointer"
          aria-label="Dismiss"
        >
          <XIcon />
        </button>
      )}
    </span>
  );
};

Badge.displayName = 'Badge';
