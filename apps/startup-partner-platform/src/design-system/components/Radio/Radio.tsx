'use client';

import { type InputHTMLAttributes, useId, useState } from 'react';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: RadioBase — node 40001601:28536
//        Radio     — node 40001601:29380
//
// Sizes  = sm (16px) | md (20px) | lg (24px)
// States = default | hover | focused | disabled

export type RadioSize = 'sm' | 'md' | 'lg';

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'onChange'> {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  size?: RadioSize;
  /** Label text rendered to the right */
  label?: string;
  /** Sub-label below the main label */
  supportingText?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export interface RadioGroupOption {
  value: string;
  label: string;
  supportingText?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Shared `name` for all radio inputs in the group */
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  size?: RadioSize;
  options: RadioGroupOption[];
  /** Layout direction. Default: vertical */
  direction?: 'vertical' | 'horizontal';
  className?: string;
}

// ─── Size maps ────────────────────────────────────────────────────────────────

const CIRCLE: Record<RadioSize, string> = {
  sm: 'w-4 h-4',   // 16 px
  md: 'w-5 h-5',   // 20 px
  lg: 'w-6 h-6',   // 24 px
};

// Inner dot when checked
const DOT: Record<RadioSize, string> = {
  sm: 'w-2 h-2',         // 8 px
  md: 'w-[10px] h-[10px]', // 10 px
  lg: 'w-3 h-3',         // 12 px
};

const LABEL_TEXT: Record<RadioSize, string> = {
  sm: 'text-sm leading-5',
  md: 'text-base leading-6',
  lg: 'text-lg leading-7',
};


// ─── Focus ring ───────────────────────────────────────────────────────────────

const FOCUS_RING = 'shadow-[0_0_0_0.5px_#fff,0_0_0_3px_#99DFB4]';

// ─── Circle visual class ──────────────────────────────────────────────────────

function getCircleClass(
  checked: boolean,
  disabled: boolean,
  focused: boolean,
  hovered: boolean,
): string {
  if (disabled) {
    return checked
      ? 'bg-neutral-p60 border-transparent'
      : 'bg-background-secondary border-[#EFF0F3]';
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

// ─── Radio ────────────────────────────────────────────────────────────────────

export const Radio = ({
  checked: checkedProp,
  defaultChecked = false,
  disabled = false,
  size = 'md',
  label,
  supportingText,
  value,
  onChange,
  className,
  id: idProp,
  onFocus,
  onBlur,
  ...inputProps
}: RadioProps) => {
  const generatedId = useId();
  const id = idProp ?? generatedId;

  const isControlled = checkedProp !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = isControlled ? (checkedProp ?? false) : internalChecked;

  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleChange = () => {
    if (!isControlled) setInternalChecked(true);
    onChange?.(value ?? '');
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
      {/* Hidden native input */}
      <input
        id={id}
        type="radio"
        className="sr-only"
        checked={isChecked}
        disabled={disabled}
        value={value}
        onChange={handleChange}
        onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
        onBlur={(e)  => { setIsFocused(false); onBlur?.(e); }}
        {...inputProps}
      />

      {/* Custom visual circle */}
      <div
        aria-hidden
        className={clsx(
          CIRCLE[size],
          'shrink-0 flex items-center justify-center rounded-full border mt-[2px]',
          'transition-[border-color,background-color,box-shadow] duration-150',
          getCircleClass(isChecked, disabled, isFocused, isHovered),
        )}
      >
        {isChecked && (
          <span
            className={clsx(
              DOT[size],
              'rounded-full bg-white',
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

Radio.displayName = 'Radio';

// ─── RadioGroup ───────────────────────────────────────────────────────────────

export const RadioGroup = ({
  name,
  value: valueProp,
  defaultValue = '',
  onChange,
  disabled = false,
  size = 'md',
  options,
  direction = 'vertical',
  className,
}: RadioGroupProps) => {
  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? (valueProp ?? '') : internalValue;

  const handleChange = (val: string) => {
    if (!isControlled) setInternalValue(val);
    onChange?.(val);
  };

  return (
    <div
      role="radiogroup"
      className={clsx(
        'flex',
        direction === 'horizontal' ? 'flex-row flex-wrap gap-6' : 'flex-col gap-3',
        className,
      )}
    >
      {options.map(opt => (
        <Radio
          key={opt.value}
          name={name}
          value={opt.value}
          checked={currentValue === opt.value}
          disabled={disabled || opt.disabled}
          size={size}
          label={opt.label}
          supportingText={opt.supportingText}
          onChange={handleChange}
        />
      ))}
    </div>
  );
};

RadioGroup.displayName = 'RadioGroup';
