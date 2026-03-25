'use client';

import type { ReactNode } from 'react';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: Card table item — node 40002665:10617
//
// Sizes:  sm (icon 16px) | md (icon 20px) | lg (icon 24px)
// States: default | hover | disabled
// Props:  current (green border + brand icon bg), badge, actions slot, children slot

export type CardTableItemSize = 'sm' | 'md' | 'lg';

export interface CardTableItemProps {
  /** Icon rendered inside the feature-icon box */
  icon?: ReactNode;
  /** Primary heading text */
  heading: string;
  /** Secondary supporting text */
  supportingText?: string;
  /** Optional badge label next to the heading */
  badge?: string;
  /** Active/selected state — green border + brand icon background */
  current?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: CardTableItemSize;
  /** Vertical alignment of the icon relative to the text block */
  align?: 'top' | 'center';
  /** Action buttons placed absolutely at the top-right of the card */
  actions?: ReactNode;
  /** Additional content slot below the heading/supporting text */
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
}

// ─── Size config ──────────────────────────────────────────────────────────────

const SIZE_CONFIG = {
  // Large: p-4 + rounded-xl (16px) → inner radius = 16-16 = 0 ← snug icon corners
  lg: {
    padding:        'p-4',              // 16px
    radius:         'rounded-xl',      // 16px
    iconSize:       'w-6 h-6',         // 24px
    textGap:        'gap-3',           // 12px between icon and text block
    headingText:    'text-lg leading-6 font-medium',
    supportingText: 'text-base leading-6',
    actionGap:      'gap-2',
  },
  // Medium: p-3 + rounded-xl (16px) → standard card
  md: {
    padding:        'p-3',             // 12px
    radius:         'rounded-xl',     // 16px
    iconSize:       'w-5 h-5',        // 20px
    textGap:        'gap-2',          // 8px
    headingText:    'text-base leading-6 font-medium',
    supportingText: 'text-sm leading-5',
    actionGap:      'gap-2',
  },
  // Small: p-3 + rounded-lg (12px) → tighter, more compact
  sm: {
    padding:        'p-3',            // 12px
    radius:         'rounded-lg',    // 12px
    iconSize:       'w-4 h-4',       // 16px
    textGap:        'gap-1',         // 4px
    headingText:    'text-sm leading-5 font-medium',
    supportingText: 'text-sm leading-5',
    actionGap:      'gap-1',
  },
} as const;

// ─── CardTableItem ─────────────────────────────────────────────────────────────

export const CardTableItem = ({
  icon,
  heading,
  supportingText,
  badge,
  current = false,
  disabled = false,
  size = 'md',
  align = 'top',
  actions,
  children,
  onClick,
  className,
}: CardTableItemProps) => {
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

        {/* Text block — basis-32 = min ~128px before actions wrap below */}
        <div className={clsx('flex flex-1 basis-32 flex-col min-w-0', cfg.textGap)}>

          {/* Feature icon */}
          {icon && (
            <div className="flex items-center shrink-0">
              <div className={clsx(
                'flex items-center justify-center p-2 rounded-md shrink-0',
                current ? 'bg-primary' : 'bg-neutral-p95',
              )}>
                <span className={clsx(
                  cfg.iconSize,
                  'flex items-center justify-center',
                  current ? 'text-white' : 'text-text-tertiary',
                )}>
                  {icon}
                </span>
              </div>
            </div>
          )}

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

        {/* Actions — shrink-0 stays on same row when space allows, wraps below when tight */}
        {actions && (
          <div className={clsx('flex shrink-0 items-center', cfg.actionGap)}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

CardTableItem.displayName = 'CardTableItem';
