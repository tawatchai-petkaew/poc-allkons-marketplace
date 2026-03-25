'use client';

import { useState } from 'react';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: Toggle — node 40001595:9969 (base) + 40001595:10102 (spec sheet)
// Size  = md (44×24px, thumb 20px) | sm (36×20px, thumb 16px)
// Color = brand (#00AF43) | success (#1EB950)
// Type  = default (thumb only) | label (ON/OFF text inside track)

export type ToggleColor = 'brand' | 'success';
export type ToggleSize  = 'md' | 'sm';

export interface ToggleProps {
  /** Controlled checked state */
  checked?: boolean;
  /** Uncontrolled default — ignored when `checked` is provided */
  defaultChecked?: boolean;
  /** Fires with the next checked value on user interaction */
  onChange?: (checked: boolean) => void;
  /** Active color — brand (green #00AF43) or success (#1EB950). Default: brand */
  color?: ToggleColor;
  /** md = 44×24px (default) | sm = 36×20px */
  size?: ToggleSize;
  /** Show ON / OFF text label inside the track */
  showLabel?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// ON label text color (Figma: text/brand/subtle p80 & text/success/subtle p80)
// These specific tints aren't in the tailwind token map
const LABEL_ON_TEXT: Record<ToggleColor, string> = {
  brand:   '#CCEFD9',  // primitive.specialGreen.p80
  success: '#D4F2DE',  // primitive.green.p80
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Toggle = ({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  color    = 'brand',
  size     = 'md',
  showLabel = false,
  disabled  = false,
  className,
  id,
  'aria-label':      ariaLabel,
  'aria-labelledby': ariaLabelledby,
}: ToggleProps) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const isChecked    = isControlled ? controlledChecked : internalChecked;

  const handleClick = () => {
    if (disabled) return;
    const next = !isChecked;
    if (!isControlled) setInternalChecked(next);
    onChange?.(next);
  };

  const isMd = size === 'md';

  // ── Track background ───────────────────────────────────────────────────────
  // Disabled: same bg as active, wrapped with disabled:opacity-50 on button
  // → preserves ON/OFF visual identity, clearly communicates disabled state
  const trackBg = isChecked
    ? color === 'brand'
      ? 'bg-primary hover:bg-primary-hover'
      : 'bg-success hover:bg-success-hover'
    : 'bg-neutral-p80 hover:bg-neutral-border-hover';

  // ── Focus ring ─────────────────────────────────────────────────────────────
  // Brand:   0.5px white + 3px #99DFB4  → shadow-focus-brand-dark
  // Success: 3px #D4F2DE               → shadow-focus-success
  const focusRing = color === 'brand'
    ? 'focus-visible:shadow-focus-brand-dark'
    : 'focus-visible:shadow-focus-success';

  // ── Thumb (default mode — absolute positioned, pixel-precise) ──────────────
  // md: thumb 20×20, top=2px, left=2px, travel=20px (track 44px - 2px*2 - 20px)
  // sm: thumb 16×16, top=2px, left=2px, travel=16px (track 36px - 2px*2 - 16px)
  const defaultThumb = (
    <span
      className={clsx(
        'absolute top-[2px] left-[2px] rounded-full bg-white shadow-sm',
        'transition-transform duration-200 ease-in-out',
        isMd ? 'w-5 h-5' : 'w-4 h-4',
        isChecked && (isMd ? 'translate-x-[20px]' : 'translate-x-[16px]'),
      )}
    />
  );

  // ── Thumb (label mode — in flex flow, no animation needed) ────────────────
  const labelThumb = (
    <span
      className={clsx(
        'rounded-full bg-white shadow-sm shrink-0',
        isMd ? 'w-5 h-5' : 'w-4 h-4',
      )}
    />
  );

  // ── Track layout ───────────────────────────────────────────────────────────
  // Default: fixed w/h, relative (for absolute thumb)
  // Label:   auto-width flex, padding mirrors Figma spec
  const trackLayout = showLabel
    ? clsx(
        'inline-flex items-center gap-1',
        isChecked
          ? isMd ? 'pl-[10px] pr-[2px]' : 'pl-2 pr-[2px]'
          : isMd ? 'pl-[2px] pr-[10px]' : 'pl-[2px] pr-2',
      )
    : clsx(
        'relative',
        isMd ? 'w-11 h-6' : 'w-9 h-5',
      );

  return (
    <button
      id={id}
      role="switch"
      type="button"
      aria-checked={isChecked}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      disabled={disabled}
      onClick={handleClick}
      className={clsx(
        'shrink-0 rounded-full transition-colors duration-200 ease-in-out',
        'cursor-pointer disabled:cursor-not-allowed',
        'focus-visible:outline-none',
        // Disabled: fade the whole toggle (preserves ON/OFF distinction)
        'disabled:opacity-50',
        // Label mode needs explicit height since absolute thumb doesn't set it
        showLabel && (isMd ? 'h-6' : 'h-5'),
        trackLayout,
        trackBg,
        focusRing,
        className,
      )}
    >
      {/* ON label — left of thumb when checked */}
      {showLabel && isChecked && (
        <span
          className="text-sm leading-5 font-normal whitespace-nowrap select-none"
          style={{ color: LABEL_ON_TEXT[color] }}
          aria-hidden
        >
          ON
        </span>
      )}

      {showLabel ? labelThumb : defaultThumb}

      {/* OFF label — right of thumb when unchecked */}
      {showLabel && !isChecked && (
        <span
          className="text-sm leading-5 font-normal whitespace-nowrap select-none text-[#9DA6B5]"
          aria-hidden
        >
          OFF
        </span>
      )}
    </button>
  );
};

Toggle.displayName = 'Toggle';
