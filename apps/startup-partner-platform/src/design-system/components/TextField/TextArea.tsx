'use client';

import { type ReactNode, type TextareaHTMLAttributes, useState, useId } from 'react';
import { clsx } from 'clsx';
import type { TextFieldSize } from './TextField';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: InputTextFieldTextArea — node 40007981:32742
//
// States  = Placeholder | Hover | Active | Typing | Filled | Disabled
// Size    = sm | md | lg
// Min-height 120px, max-height 480px, resize: vertical

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Label shown above the field */
  label?: string;
  /** Helper / error text shown below the field */
  helperText?: string;
  /** Switches to error/destructive styling */
  destructive?: boolean;
  /** Shows a red asterisk after the label */
  showAsterisk?: boolean;
  /** Field size. Default: md */
  size?: TextFieldSize;
  /** Icon rendered inside the textarea on the left (top-aligned) */
  leadingIcon?: ReactNode;
  /** Icon rendered inside the textarea on the right (top-aligned) */
  trailingIcon?: ReactNode;
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

// ─── TextArea ─────────────────────────────────────────────────────────────────

export const TextArea = ({
  label,
  helperText,
  destructive = false,
  showAsterisk,
  size = 'md',
  leadingIcon,
  trailingIcon,
  disabled,
  className,
  id: idProp,
  onFocus,
  onBlur,
  ...textareaProps
}: TextAreaProps) => {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const [isFocused, setIsFocused] = useState(false);

  const asterisk = showAsterisk ?? textareaProps.required;

  // ── Wrapper border/shadow ─────────────────────────────────────────────────
  const wrapperBorderClass = disabled
    ? 'border-neutral-p80 bg-background-disabled'
    : destructive
      ? isFocused
        ? 'border-error shadow-[0_0_0_3px_#F7D2CF]'
        : 'border-error hover:border-[#AE1A0C]'
      : isFocused
        ? 'border-primary shadow-[0_0_0_3px_#CCEFD9]'
        : 'border-neutral-p80 hover:border-primary';

  // ── Text/placeholder colors ───────────────────────────────────────────────
  const textareaTextClass = disabled
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

  const hasIcons = !!(leadingIcon || trailingIcon);

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

      {/* Textarea wrapper ────────────────────────────────────────────────────── */}
      <div
        className={clsx(
          'flex items-start rounded-[8px] border transition-[border-color,box-shadow] duration-150 overflow-hidden',
          FIELD_PAD[size],
          'gap-2',
          wrapperBorderClass,
        )}
      >
        {/* Leading icon */}
        {leadingIcon && (
          <span
            className={clsx(
              ICON_SIZE[size],
              'shrink-0 flex items-center justify-center [&_svg]:w-full [&_svg]:h-full mt-[2px]',
              iconColorClass,
            )}
          >
            {leadingIcon}
          </span>
        )}

        {/* Textarea */}
        <textarea
          id={id}
          disabled={disabled}
          className={clsx(
            'flex-1 min-w-0 bg-transparent outline-none resize-y min-h-[120px] max-h-[480px]',
            INPUT_TEXT[size],
            textareaTextClass,
            'disabled:cursor-not-allowed',
          )}
          onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
          {...textareaProps}
        />

        {/* Trailing icon */}
        {trailingIcon && (
          <span
            className={clsx(
              ICON_SIZE[size],
              'shrink-0 flex items-center justify-center [&_svg]:w-full [&_svg]:h-full mt-[2px]',
              iconColorClass,
            )}
          >
            {trailingIcon}
          </span>
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

TextArea.displayName = 'TextArea';
