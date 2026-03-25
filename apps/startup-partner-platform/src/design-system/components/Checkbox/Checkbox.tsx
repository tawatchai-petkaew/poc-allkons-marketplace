'use client';

import { type InputHTMLAttributes, useId, useRef, useEffect, useState } from 'react';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: CheckboxBase — node 40001601:28499
//        Checkbox     — node 40001601:28547
//
// Sizes  = sm (16px) | md (20px) | lg (24px)
// States = default | hover | focused | disabled
// Extra  = indeterminate (dash instead of check, white bg + #DEE1E6 border)

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'onChange'> {
  checked?: boolean;
  defaultChecked?: boolean;
  /** Shows a dash (−) instead of a check. Takes precedence over checked for icon. */
  indeterminate?: boolean;
  disabled?: boolean;
  size?: CheckboxSize;
  /** Label text rendered to the right of the box */
  label?: string;
  /** Sub-label below the main label */
  supportingText?: string;
  onChange?: (checked: boolean) => void;
  className?: string;
}

// ─── Size maps ────────────────────────────────────────────────────────────────

const BOX: Record<CheckboxSize, string> = {
  sm: 'w-4 h-4',   // 16 px
  md: 'w-5 h-5',   // 20 px
  lg: 'w-6 h-6',   // 24 px
};

// Check-mark icon container inside the box
const CHECK_ICON: Record<CheckboxSize, string> = {
  sm: 'w-3 h-3',   // 12 px
  md: 'w-4 h-4',   // 16 px
  lg: 'w-5 h-5',   // 20 px
};

// Indeterminate dash width
const DASH_W: Record<CheckboxSize, string> = {
  sm: 'w-[10px]',
  md: 'w-[14px]',
  lg: 'w-[18px]',
};

const LABEL_TEXT: Record<CheckboxSize, string> = {
  sm: 'text-sm leading-5',
  md: 'text-base leading-6',
  lg: 'text-lg leading-7',
};


// ─── Focus ring (shared) ──────────────────────────────────────────────────────
// white inner ring + brand-lighter outer ring (Figma: 0.5px #fff + 3px #99DFB4)

const FOCUS_RING = 'shadow-[0_0_0_0.5px_#fff,0_0_0_3px_#99DFB4]';

// ─── Box visual class ─────────────────────────────────────────────────────────

function getBoxClass(
  checked: boolean,
  indeterminate: boolean,
  disabled: boolean,
  focused: boolean,
  hovered: boolean,
): string {
  if (disabled) {
    // Both checked and indeterminate use gray fill, no border
    return checked || indeterminate
      ? 'bg-neutral-p60 border-transparent'
      : 'bg-background-secondary border-neutral-p80';
  }

  if (indeterminate) {
    return clsx(
      hovered ? 'bg-background-secondary' : 'bg-white',
      'border-neutral-p80',  // #DEE1E6
      focused && FOCUS_RING,
    );
  }

  if (checked) {
    return clsx(
      hovered ? 'bg-[#008C36] border-[#008C36]' : 'bg-primary border-primary',
      focused && FOCUS_RING,
    );
  }

  // Unchecked
  return clsx(
    hovered ? 'bg-background-secondary' : 'bg-white',
    'border-neutral-p60',   // #BDC3CD
    focused && FOCUS_RING,
  );
}

// ─── Check SVG ────────────────────────────────────────────────────────────────

const CheckSvg = () => (
  <svg viewBox="0 0 12 12" fill="none" aria-hidden className="w-full h-full">
    <path
      d="M2 6.5l2.8 2.8L10 3.5"
      stroke="white"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Checkbox ─────────────────────────────────────────────────────────────────

export const Checkbox = ({
  checked: checkedProp,
  defaultChecked = false,
  indeterminate = false,
  disabled = false,
  size = 'md',
  label,
  supportingText,
  onChange,
  className,
  id: idProp,
  onFocus,
  onBlur,
  ...inputProps
}: CheckboxProps) => {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);

  // Controlled / uncontrolled
  const isControlled = checkedProp !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = isControlled ? (checkedProp ?? false) : internalChecked;

  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // indeterminate must be set via DOM (not an HTML attribute)
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const handleChange = () => {
    if (!isControlled) setInternalChecked(c => !c);
    onChange?.(!isChecked);
  };

  return (
    <label
      htmlFor={id}
      className={clsx(
        'inline-flex items-start gap-2',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className,
      )}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hidden native input — keyboard + screen-reader accessible */}
      <input
        ref={inputRef}
        id={id}
        type="checkbox"
        className="sr-only"
        checked={isChecked}
        disabled={disabled}
        onChange={handleChange}
        onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
        onBlur={(e)  => { setIsFocused(false); onBlur?.(e); }}
        {...inputProps}
      />

      {/* Custom visual box */}
      <div
        aria-hidden
        className={clsx(
          BOX[size],
          'shrink-0 flex items-center justify-center rounded-[4px] border mt-[2px]',
          'transition-[border-color,background-color,box-shadow] duration-150',
          getBoxClass(isChecked, indeterminate, disabled, isFocused, isHovered),
        )}
      >
        {/* Check mark */}
        {isChecked && !indeterminate && (
          <span className={CHECK_ICON[size]}>
            <CheckSvg />
          </span>
        )}

        {/* Indeterminate dash */}
        {indeterminate && (
          <span
            className={clsx(
              DASH_W[size],
              'h-[2px] rounded-full',
              disabled ? 'bg-white' : 'bg-primary',
            )}
          />
        )}
      </div>

      {/* Label text */}
      {(label || supportingText) && (
        <div className="flex flex-col">
          {label && (
            <span
              className={clsx(
                LABEL_TEXT[size],
                disabled ? 'text-neutral-p60' : 'text-text-secondary',
              )}
            >
              {label}
            </span>
          )}
          {supportingText && (
            <span
              className={clsx(
                'text-sm leading-5',
                disabled ? 'text-neutral-p60' : 'text-text-quinary',
              )}
            >
              {supportingText}
            </span>
          )}
        </div>
      )}
    </label>
  );
};

Checkbox.displayName = 'Checkbox';
