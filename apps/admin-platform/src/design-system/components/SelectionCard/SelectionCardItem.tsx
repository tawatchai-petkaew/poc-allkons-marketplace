'use client';

import type { ReactNode } from 'react';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: Checkbox group item — node 40002708:24079
//
// Same layout logic as CardTableItem — replaces feature-icon box with a
// radio/checkbox circle indicator.
//
// current = checked → green circle + green border + bg-secondary

export type SelectionCardItemSize = 'sm' | 'md' | 'lg';

export interface SelectionCardItemProps {
  /** Selected / checked state */
  current?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: SelectionCardItemSize;
  /** Vertical alignment of indicator relative to text block */
  align?: 'top' | 'center';
  /** Primary heading text */
  heading: string;
  /** Secondary supporting text */
  supportingText?: string;
  /** Optional badge label next to the heading */
  badge?: string;
  /**
   * Action buttons — flex-wrap: stays on same row when space allows,
   * wraps below when the card is too narrow
   */
  actions?: ReactNode;
  /** Additional content slot below the heading/supporting text */
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
}

// ─── Size config ──────────────────────────────────────────────────────────────

const SIZE_CONFIG = {
  lg: {
    padding:        'p-4',
    radius:         'rounded-xl',
    indicator:      'w-6 h-6',       // 24px circle
    innerDot:       'w-3 h-3',       // 12px checked dot
    indicatorPad:   'p-1',           // 4px wrapper padding
    textGap:        'gap-3',
    headingText:    'text-lg leading-6 font-medium',
    supportingText: 'text-base leading-6',
    actionGap:      'gap-2',
  },
  md: {
    padding:        'p-3',
    radius:         'rounded-xl',
    indicator:      'w-5 h-5',       // 20px circle
    innerDot:       'w-[10px] h-[10px]',
    indicatorPad:   'p-1',
    textGap:        'gap-2',
    headingText:    'text-base leading-6 font-medium',
    supportingText: 'text-sm leading-5',
    actionGap:      'gap-2',
  },
  sm: {
    padding:        'p-3',
    radius:         'rounded-lg',
    indicator:      'w-4 h-4',       // 16px circle
    innerDot:       'w-2 h-2',       // 8px checked dot
    indicatorPad:   'p-[2px]',
    textGap:        'gap-1',
    headingText:    'text-sm leading-5 font-medium',
    supportingText: 'text-sm leading-5',
    actionGap:      'gap-1',
  },
} as const;

// ─── Radio indicator ──────────────────────────────────────────────────────────

const RadioIndicator = ({
  checked,
  indicatorClass,
  innerDotClass,
}: {
  checked: boolean;
  indicatorClass: string;
  innerDotClass: string;
}) => (
  <div className={clsx(
    'rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
    indicatorClass,
    checked
      ? 'bg-primary border-primary'
      : 'bg-white border-neutral-p70',
  )}>
    {checked && (
      <div className={clsx('rounded-full bg-white shrink-0', innerDotClass)} />
    )}
  </div>
);

// ─── SelectionCardItem ────────────────────────────────────────────────────────

export const SelectionCardItem = ({
  current = false,
  disabled = false,
  size = 'md',
  align = 'top',
  heading,
  supportingText,
  badge,
  actions,
  children,
  onClick,
  className,
}: SelectionCardItemProps) => {
  const cfg = SIZE_CONFIG[size];
  const isClickable = !!onClick && !disabled;

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); } : undefined}
      className={clsx(
        'flex flex-col w-full border transition-colors',
        cfg.padding,
        cfg.radius,
        current
          ? 'bg-neutral-p95 border-primary'
          : 'bg-white border-neutral-p80',
        isClickable && !current && 'hover:bg-neutral-p95 cursor-pointer',
        isClickable && current && 'cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
    >
      {/* Content row — flex-wrap lets actions drop below when space is tight */}
      <div className={clsx(
        'flex flex-wrap gap-x-4 gap-y-2 w-full',
        align === 'center' ? 'items-center' : 'items-start',
      )}>

        {/* Left: indicator + text (basis-32 = min ~128px before actions wrap) */}
        <div className={clsx('flex flex-1 basis-32 flex-col min-w-0', cfg.textGap)}>

          {/* Radio indicator */}
          <div className={clsx('flex items-center shrink-0', cfg.indicatorPad)}>
            <RadioIndicator
              checked={current}
              indicatorClass={cfg.indicator}
              innerDotClass={cfg.innerDot}
            />
          </div>

          {/* Heading + supporting text */}
          <div className="flex flex-col w-full min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className={clsx(cfg.headingText, 'text-text-secondary truncate min-w-0')}>
                {heading}
              </span>
              {badge && (
                <span className="shrink-0 inline-flex items-center justify-center h-5 min-w-5 px-2 rounded-full bg-neutral-p95 border border-neutral-p80 text-xs text-[#242A34] leading-4">
                  {badge}
                </span>
              )}
            </div>
            {supportingText && (
              <span className={clsx(cfg.supportingText, 'text-text-tertiary truncate')}>
                {supportingText}
              </span>
            )}
          </div>

          {/* Slot: additional content */}
          {children && <div className="w-full">{children}</div>}
        </div>

        {/* Actions — shrink-0, same row when space allows, wraps below when tight */}
        {actions && (
          <div className={clsx('flex shrink-0 items-center', cfg.actionGap)}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

SelectionCardItem.displayName = 'SelectionCardItem';
