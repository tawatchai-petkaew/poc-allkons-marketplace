'use client';

import { type ReactNode, type InputHTMLAttributes, useState, useId } from 'react';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: InputTextFieldDefault        — node 40001706:30748
//        InputTextFieldLeadAndTrail   — node 40008551:20576
//        InputTextFieldNumber         — node 40015667:56791
//
// States  = Placeholder | Hover | Active | Typing | Filled | Disabled
// Size    = sm | md | lg
// Addons  = leadingIcon | trailingIcon | leadingText | trailingText

export type TextFieldSize = 'sm' | 'md' | 'lg';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label shown above the field */
  label?: string;
  /** Helper / error text shown below the field */
  helperText?: string;
  /** Switches to error/destructive styling */
  destructive?: boolean;
  /** Shows a red asterisk after the label (overrides `required` HTML attr display) */
  showAsterisk?: boolean;
  /** Field size. Default: md */
  size?: TextFieldSize;
  /** Icon rendered inside the field on the left */
  leadingIcon?: ReactNode;
  /** Icon rendered inside the field on the right */
  trailingIcon?: ReactNode;
  /** Text addon rendered to the left (e.g. "$", "http://") */
  leadingText?: string;
  /** Text addon rendered to the right (e.g. ".com", "kg") */
  trailingText?: string;
  className?: string;
}

// ─── Size maps ────────────────────────────────────────────────────────────────

const FIELD_PAD: Record<TextFieldSize, string> = {
  sm: 'px-3 py-1',
  md: 'px-4 py-2',
  lg: 'px-4 py-3',
};

const ICON_SIZE: Record<TextFieldSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-5 h-5',
};

const INPUT_TEXT: Record<TextFieldSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-base',
};

const ADDON_TEXT: Record<TextFieldSize, string> = {
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
};

// ─── TextField ────────────────────────────────────────────────────────────────

export const TextField = ({
  label,
  helperText,
  destructive = false,
  showAsterisk,
  size = 'md',
  leadingIcon,
  trailingIcon,
  leadingText,
  trailingText,
  disabled,
  className,
  id: idProp,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) => {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const [isFocused, setIsFocused] = useState(false);

  const asterisk = showAsterisk ?? inputProps.required;

  // ── Field wrapper border/shadow ──────────────────────────────────────────
  const wrapperBorderClass = disabled
    ? 'border-neutral-p80 bg-background-disabled'
    : destructive
      ? isFocused
        ? 'border-error shadow-[0_0_0_3px_#F7D2CF]'
        : 'border-error hover:border-[#AE1A0C]'
      : isFocused
        ? 'border-primary shadow-[0_0_0_3px_#CCEFD9]'
        : 'border-neutral-p80 hover:border-primary';

  // ── Input text/placeholder colors ────────────────────────────────────────
  const inputTextClass = disabled
    ? 'text-text-placeholder'
    : destructive
      ? 'text-error placeholder:text-[#e8796f]'
      : 'text-text-secondary placeholder:text-text-placeholder';

  // ── Icon tint ─────────────────────────────────────────────────────────────
  const iconColorClass = disabled
    ? 'text-neutral-p60'
    : destructive
      ? 'text-error'
      : isFocused
        ? 'text-primary'
        : 'text-text-placeholder';

  const addonClass = disabled
    ? 'border-neutral-p80 bg-background-disabled text-text-placeholder'
    : 'border-neutral-p80 bg-background-secondary text-text-tertiary';

  return (
    <div className={clsx('flex flex-col gap-2', className)}>

      {/* Label ─────────────────────────────────────────────────────────────── */}
      {label && (
        <label
          htmlFor={id}
          className="flex items-center gap-1 text-sm font-medium text-text-secondary"
        >
          {label}
          {asterisk && (
            <span
              className={disabled ? 'text-neutral-p60' : 'text-error'}
              aria-hidden
            >
              *
            </span>
          )}
        </label>
      )}

      {/* Field wrapper ───────────────────────────────────────────────────────── */}
      <div
        className={clsx(
          'flex items-stretch rounded-[8px] border transition-[border-color,box-shadow] duration-150 overflow-hidden',
          wrapperBorderClass,
        )}
      >
        {/* Leading text addon */}
        {leadingText && (
          <div
            className={clsx(
              'flex items-center shrink-0 border-r px-3',
              ADDON_TEXT[size],
              addonClass,
            )}
          >
            {leadingText}
          </div>
        )}

        {/* Main input row */}
        <div className={clsx('flex-1 flex items-center gap-2', FIELD_PAD[size])}>
          {leadingIcon && (
            <span
              className={clsx(
                ICON_SIZE[size],
                'shrink-0 flex items-center justify-center [&_svg]:w-full [&_svg]:h-full',
                iconColorClass,
              )}
            >
              {leadingIcon}
            </span>
          )}

          <input
            id={id}
            disabled={disabled}
            className={clsx(
              'flex-1 min-w-0 bg-transparent outline-none',
              INPUT_TEXT[size],
              inputTextClass,
              'disabled:cursor-not-allowed',
            )}
            onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
            onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
            {...inputProps}
          />

          {trailingIcon && (
            <span
              className={clsx(
                ICON_SIZE[size],
                'shrink-0 flex items-center justify-center [&_svg]:w-full [&_svg]:h-full',
                iconColorClass,
              )}
            >
              {trailingIcon}
            </span>
          )}
        </div>

        {/* Trailing text addon */}
        {trailingText && (
          <div
            className={clsx(
              'flex items-center shrink-0 border-l px-3',
              ADDON_TEXT[size],
              addonClass,
            )}
          >
            {trailingText}
          </div>
        )}
      </div>

      {/* Helper text ─────────────────────────────────────────────────────────── */}
      {helperText && (
        <p className={clsx('text-sm', destructive ? 'text-error' : 'text-text-quinary')}>
          {helperText}
        </p>
      )}
    </div>
  );
};

TextField.displayName = 'TextField';
