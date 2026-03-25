'use client';

import { type ReactNode } from 'react';
import { clsx } from 'clsx';
import { Button } from '../Button';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: Card Header — node 40002738:50639
//
// Sizes   = md (24px title) | sm (20px title) | xs (18px title)
// Types   = Simple (text title) | Avatar (avatar label group)
// Mobile  = actions wrap below title, dropdown absolute top-right
// Desktop = single row, dropdown inline at end

export type CardHeaderSize = 'md' | 'sm' | 'xs';
export type CardHeaderType = 'simple' | 'avatar';

export interface CardHeaderAvatar {
  name: string;
  email?: string;
  /** Image URL — falls back to first-letter placeholder */
  src?: string;
}

export interface CardHeaderProps {
  /**
   * Header size controlling title font size.
   * md = 24px | sm = 20px | xs = 18px. Default: md
   */
  size?: CardHeaderSize;
  /**
   * Layout type.
   * simple = text title | avatar = avatar label group
   * Default: simple
   */
  type?: CardHeaderType;
  /** Header title */
  title?: ReactNode;
  /** Optional badge rendered inline after the title (neutral pill) */
  badge?: ReactNode;
  /** Supporting text below title (shown for all sizes) */
  description?: ReactNode;
  /** Action buttons slot — inline on desktop, below title on mobile */
  actions?: ReactNode;
  /**
   * Content for the ⋮ dropdown button area.
   * Pass `true` to render the default icon-only button.
   * Pass a ReactNode for a custom dropdown trigger.
   */
  dropdown?: ReactNode | boolean;
  /** Optional left image / icon swap slot (desktop only) */
  swapContent?: ReactNode;
  /** Avatar info (avatar type) */
  avatar?: CardHeaderAvatar;
  /** Show bottom divider. Default: true */
  divider?: boolean;
  /** Extra classes applied to the root element */
  className?: string;
}

// ─── Title size map ───────────────────────────────────────────────────────────

const TITLE_CLASS: Record<CardHeaderSize, string> = {
  md: 'text-2xl font-bold leading-7',
  sm: 'text-xl  font-bold leading-6',
  xs: 'text-lg  font-bold leading-6',
};

const DESC_CLASS: Record<CardHeaderSize, string> = {
  md: 'text-base text-text-tertiary leading-6',
  sm: 'text-sm  text-text-tertiary leading-5',
  xs: 'text-sm  text-text-tertiary leading-5',
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const MoreIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="w-5 h-5">
    <circle cx="10" cy="4.5" r="1.5" />
    <circle cx="10" cy="10"  r="1.5" />
    <circle cx="10" cy="15.5" r="1.5" />
  </svg>
);

// ─── CardHeader ───────────────────────────────────────────────────────────────

export const CardHeader = ({
  size = 'md',
  type = 'simple',
  title,
  badge,
  description,
  actions,
  dropdown,
  swapContent,
  avatar,
  divider = true,
  className,
}: CardHeaderProps) => {
  const isSimple = type === 'simple';
  const isAvatar = type === 'avatar';
  const hasDropdown = dropdown !== undefined && dropdown !== false && dropdown !== null;

  const dropdownNode = hasDropdown
    ? dropdown === true
      ? (
        <Button variant="secondary-neutral" size="md" iconOnly aria-label="More options">
          <MoreIcon />
        </Button>
      )
      : dropdown as ReactNode
    : null;

  return (
    <div className={clsx('flex flex-col gap-5 items-start w-full', className)}>

      {/* Content row */}
      <div className="relative flex flex-wrap sm:flex-nowrap items-end gap-6 w-full">

        {/* Left swap slot — desktop only */}
        {swapContent && (
          <div className="hidden sm:block shrink-0 w-14 h-14">{swapContent}</div>
        )}

        {/* Title / Avatar block */}
        <div className={clsx(
          'flex flex-col flex-1 min-w-0 gap-1',
          // On mobile, leave room for the absolute dropdown button
          hasDropdown ? 'pr-12 sm:pr-0' : '',
        )}>
          {isSimple && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                {title && (
                  <h2 className={clsx('text-text-primary whitespace-nowrap', TITLE_CLASS[size])}>
                    {title}
                  </h2>
                )}
                {badge}
              </div>
              {description && (
                <p className={DESC_CLASS[size]}>{description}</p>
              )}
            </>
          )}

          {isAvatar && avatar && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-background-secondary overflow-hidden shrink-0 relative">
                {avatar.src ? (
                  <img src={avatar.src} alt={avatar.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-text-secondary">
                    {avatar.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-text-secondary leading-5">{avatar.name}</span>
                {avatar.email && (
                  <span className="text-sm text-text-quinary leading-5">{avatar.email}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions — inline on desktop, below title on mobile (rendered twice) */}
        {actions && (
          <div className="hidden sm:flex items-center gap-3 shrink-0">{actions}</div>
        )}

        {/* Dropdown — absolute on mobile, inline on desktop */}
        {dropdownNode && (
          <>
            {/* Mobile: absolute top-right */}
            <div className="absolute top-0 right-0 sm:hidden">{dropdownNode}</div>
            {/* Desktop: inline */}
            <div className="hidden sm:block shrink-0">{dropdownNode}</div>
          </>
        )}

        {/* Mobile actions row — wraps below title */}
        {actions && (
          <div className="flex sm:hidden items-center gap-3 w-full">{actions}</div>
        )}
      </div>

      {/* Divider */}
      {divider && <hr className="w-full border-0 border-t border-neutral-p80" />}
    </div>
  );
};

CardHeader.displayName = 'CardHeader';
