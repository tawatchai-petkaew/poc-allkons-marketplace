'use client';

import React from 'react';
import { clsx } from 'clsx';
import { buttonVariants } from './button.variants';
import type { ButtonVariant, ButtonSize } from './button.variants';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /**
   * Visual variant × color combination.
   * Maps directly to Figma: Variant + Color properties.
   *
   * primary-brand    → Filled,  green   (default)
   * primary-error    → Filled,  red
   * secondary-brand  → Outline, green
   * secondary-neutral→ Outline, gray
   * secondary-error  → Outline, red
   * tertiary-brand   → Ghost,   green
   * tertiary-neutral → Ghost,   gray
   * tertiary-error   → Ghost,   red
   * link-brand       → Link,    green
   * link-neutral     → Link,    gray
   * link-error       → Link,    red
   */
  variant?: ButtonVariant;

  /**
   * Button height.
   * lg = 48px | md = 40px (default) | sm = 32px
   */
  size?: ButtonSize;

  /** Stretches button to full container width */
  fullWidth?: boolean;

  /**
   * Icon displayed before the label.
   * Pass a Remixicon or any React node.
   */
  startIcon?: React.ReactNode;

  /**
   * Icon displayed after the label.
   * Pass a Remixicon or any React node.
   */
  endIcon?: React.ReactNode;

  /**
   * Icon-only mode — pass icon via startIcon, leave children empty.
   * Renders a square button.
   */
  iconOnly?: boolean;

  /** Loading state — shows a spinning indicator and disables interaction */
  loading?: boolean;

  children?: React.ReactNode;

  /** data-testid for automated testing */
  dataTestId?: string;

  /**
   * Alias for native `type` — kept for backward compatibility with AntD Button API.
   * Prefer using `type` directly.
   */
  htmlType?: 'button' | 'submit' | 'reset';
}

// ─── Loading spinner ──────────────────────────────────────────────────────────

const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4 shrink-0"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12" cy="12" r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

// ─── Component ───────────────────────────────────────────────────────────────

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant   = 'primary-brand',
      size      = 'md',
      fullWidth = false,
      startIcon,
      endIcon,
      iconOnly  = false,
      loading   = false,
      disabled  = false,
      type,
      htmlType,
      children,
      className,
      dataTestId,
      onClick,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const leadIcon   = loading ? <Spinner /> : startIcon;
    const buttonType = type ?? htmlType ?? 'button';

    return (
      <button
        ref={ref}
        type={buttonType}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        data-testid={dataTestId}
        onClick={isDisabled ? undefined : onClick}
        className={clsx(
          buttonVariants({ variant, size, fullWidth, iconOnly }),
          className
        )}
        {...rest}
      >
        {leadIcon && (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {leadIcon}
          </span>
        )}

        {!iconOnly && children}

        {!iconOnly && endIcon && !loading && (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {endIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
