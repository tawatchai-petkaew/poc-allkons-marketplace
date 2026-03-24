'use client';

import React from 'react';
import { Button as AntButton } from 'antd';
import type { ButtonProps as AntButtonProps } from 'antd';
import { clsx } from 'clsx';
import { buttonVariants } from './button.variants';
import type { ButtonVariant, ButtonSize } from './button.variants';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ButtonProps
  extends Omit<AntButtonProps, 'type' | 'size' | 'danger' | 'variant' | 'color'> {
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

  /** Loading state — shows Ant Design spinner */
  loading?: boolean;

  /** Disabled state */
  disabled?: boolean;

  /** Form submit type */
  htmlType?: 'button' | 'submit' | 'reset';

  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
  className?: string;

  /** data-testid for automated testing */
  'data-testid'?: string;
}

// ─── Ant Design type mapping ──────────────────────────────────────────────────

type AntType = 'primary' | 'default' | 'text' | 'link';

function toAntType(variant: ButtonVariant): AntType {
  if (variant.startsWith('primary'))   return 'primary';
  if (variant.startsWith('secondary')) return 'default';
  if (variant.startsWith('tertiary'))  return 'text';
  if (variant.startsWith('link'))      return 'link';
  return 'default';
}

function toAntSize(size: ButtonSize): AntButtonProps['size'] {
  if (size === 'lg') return 'large';
  if (size === 'sm') return 'small';
  return 'middle';
}

function isDanger(variant: ButtonVariant): boolean {
  return variant.endsWith('-error');
}

// ─── Component ───────────────────────────────────────────────────────────────

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant    = 'primary-brand',
      size       = 'md',
      fullWidth  = false,
      startIcon,
      endIcon,
      iconOnly   = false,
      loading    = false,
      disabled   = false,
      htmlType   = 'button',
      onClick,
      children,
      className,
      'data-testid': dataTestId,
      ...rest
    },
    ref
  ) => {
    const antIcon = startIcon ?? (iconOnly ? children : undefined);

    return (
      <AntButton
        ref={ref}
        type={toAntType(variant)}
        size={toAntSize(size)}
        danger={isDanger(variant)}
        loading={loading}
        disabled={disabled}
        htmlType={htmlType}
        onClick={onClick}
        icon={antIcon}
        iconPosition={endIcon ? 'end' : 'start'}
        data-testid={dataTestId}
        className={clsx(
          buttonVariants({ variant, size, fullWidth, iconOnly }),
          // strip Ant Design's default shadow & outline — theme handles it
          '!shadow-none',
          className
        )}
        {...rest}
      >
        {!iconOnly && (
          <>
            {children}
            {endIcon && <span className="btn-end-icon">{endIcon}</span>}
          </>
        )}
      </AntButton>
    );
  }
);

Button.displayName = 'Button';
