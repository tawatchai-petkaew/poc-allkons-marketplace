'use client';

import { type ReactNode, useState } from 'react';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: _Tab button base       — node 40002553:5457
//        Horizontal tabs        — node 40002553:8293
//        Vertical tabs          — node 40002553:14581
//        Button dark brand      — node 40003342:5859 / 40003342:5868
//        Pill (rounded)         — node 40006157:20043 / 40006157:20052
//
// Variants = underline | button-brand | button-gray | button-white
//            | button-dark-brand | pill
// Sizes    = sm (32px) | md (40px) | lg (48px)
// Layout   = horizontal | vertical

export type TabVariant = 'underline' | 'button-brand' | 'button-gray' | 'button-white' | 'button-dark-brand' | 'pill';
export type TabSize    = 'sm' | 'md' | 'lg';
export type TabsLayout = 'horizontal' | 'vertical';

export interface TabItem {
  key: string;
  label: string;
  /** Leading icon */
  icon?: ReactNode;
  /** Badge count / label */
  badge?: number | string;
  /** Show close (×) button */
  closable?: boolean;
  disabled?: boolean;
  /** Panel content rendered when this tab is active */
  children?: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  /** Controlled active key */
  activeKey?: string;
  /** Uncontrolled initial active key (defaults to first item) */
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  /** Called when user clicks the × on a closable tab */
  onClose?: (key: string) => void;
  /** Visual style. Default: underline */
  variant?: TabVariant;
  /** Button height. Default: md */
  size?: TabSize;
  /** Tab bar direction. Default: horizontal */
  layout?: TabsLayout;
  /** Stretch tabs to fill available width. Default: false */
  fullWidth?: boolean;
  /** Extra classes on the root wrapper */
  className?: string;
}

// ─── Size maps ────────────────────────────────────────────────────────────────

const TAB_H: Record<TabSize, string> = {
  sm: 'h-8',    // 32 px
  md: 'h-10',   // 40 px
  lg: 'h-12',   // 48 px
};

// ─── Tab Badge ────────────────────────────────────────────────────────────────

const TabBadge = ({ value, active }: { value: string | number; active: boolean }) => (
  <span
    className={clsx(
      'inline-flex items-center justify-center h-5 min-w-5 px-2 rounded-full text-xs border leading-none shrink-0',
      active
        ? 'bg-[#E5F7EC] border-[#99DFB4] text-[#008C36]'
        : 'bg-background-secondary border-neutral-p80 text-[#242A34]',
    )}
  >
    {value}
  </span>
);

// ─── Close button ──────────────────────────────────────────────────────────────

const CloseX = ({
  active,
  onClick,
}: {
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
}) => (
  <span
    role="button"
    tabIndex={-1}
    aria-label="Close tab"
    onClick={onClick}
    className={clsx(
      'w-4 h-4 rounded-[4px] inline-flex items-center justify-center shrink-0',
      'transition-colors duration-150 cursor-pointer',
      active
        ? 'text-[#008C36] hover:bg-[#CCEFD9]'
        : 'text-text-quaternary hover:bg-background-secondary',
    )}
  >
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className="w-3 h-3">
      <path d="M4 4l8 8M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </span>
);

// ─── Tab button class logic ───────────────────────────────────────────────────
// All class strings are static so Tailwind JIT can detect them.

function getTabClass(
  variant: TabVariant,
  layout: TabsLayout,
  active: boolean,
  disabled: boolean,
  fullWidth: boolean,
  size: TabSize,
): string {
  const base = clsx(
    'inline-flex items-center gap-2 text-sm whitespace-nowrap',
    'transition-colors duration-150 select-none outline-none',
    'focus-visible:shadow-[0_0_0_3px_#CCEFD9]',
    TAB_H[size],
    disabled ? 'cursor-not-allowed' : 'cursor-pointer',
    fullWidth && layout === 'horizontal' && 'flex-1 justify-center',
    fullWidth && layout === 'vertical'   && 'w-full',
  );

  // ── Underline variant ─────────────────────────────────────────────────────
  if (variant === 'underline') {
    if (layout === 'horizontal') {
      return clsx(
        base,
        'px-1',
        disabled && 'text-neutral-p60',
        !disabled && active  && 'text-[#008C36] font-medium border-b-2 border-[#008C36] -mb-px',
        !disabled && !active && 'text-text-quaternary hover:text-primary hover:bg-[#E5F7EC] hover:rounded-[8px]',
      );
    }
    // Vertical — left-border indicator
    return clsx(
      base,
      'px-2 rounded-[8px]',
      disabled && 'text-neutral-p60',
      !disabled && active  && 'text-[#008C36] font-medium border-l-2 border-[#008C36]',
      !disabled && !active && 'text-text-quaternary hover:text-primary hover:bg-[#E5F7EC]',
    );
  }

  // ── Button brand ──────────────────────────────────────────────────────────
  if (variant === 'button-brand') {
    return clsx(
      base,
      'px-3 rounded-[8px]',
      disabled && 'text-neutral-p60',
      !disabled && active  && 'bg-[#E5F7EC] text-primary',
      !disabled && !active && 'text-text-secondary hover:bg-[#E5F7EC] hover:text-primary',
    );
  }

  // ── Button gray ───────────────────────────────────────────────────────────
  if (variant === 'button-gray') {
    return clsx(
      base,
      'px-3 rounded-[8px]',
      disabled && 'text-neutral-p60',
      !disabled && active  && 'bg-background-secondary text-text-secondary font-medium',
      !disabled && !active && 'text-text-secondary hover:bg-background-secondary',
    );
  }

  // ── Button white ──────────────────────────────────────────────────────────
  if (variant === 'button-white') {
    return clsx(
      base,
      'px-3 rounded-[8px]',
      disabled && 'text-neutral-p60',
      !disabled && active  && 'bg-white text-text-secondary font-medium shadow-sm',
      !disabled && !active && 'text-text-secondary hover:bg-white hover:shadow-sm',
    );
  }

  // ── Button dark brand (solid green active, gray pill container) ───────────
  // Active tab = solid #00AF43 bg with white text; displayed inside a
  // bg-background-secondary pill container (see getBarClass).
  if (variant === 'button-dark-brand') {
    return clsx(
      base,
      'px-3 rounded-[8px]',
      disabled && 'text-neutral-p60',
      !disabled && active  && 'bg-primary text-white font-medium',
      !disabled && !active && 'text-text-secondary hover:bg-white hover:shadow-sm',
    );
  }

  // ── Pill (rounded-full; solid green active, white-fill bordered inactive) ──
  // No container background. Inactive tabs are white-filled pills with a
  // visible border. Active is solid green filled.
  return clsx(
    base,
    'px-3 rounded-full',
    disabled && 'bg-white text-neutral-p60 border border-neutral-p80',
    !disabled && active  && 'bg-primary text-white font-medium',
    !disabled && !active && 'bg-white text-text-secondary border border-neutral-p80 hover:border-primary hover:text-primary',
  );
}

// ─── Tab bar container class ──────────────────────────────────────────────────

function getBarClass(variant: TabVariant, layout: TabsLayout, fullWidth: boolean): string {
  const isUnderline  = variant === 'underline';
  const isHorizontal = layout === 'horizontal';
  const isDarkBrand  = variant === 'button-dark-brand';

  return clsx(
    // Underline uses items-end so the active border-bottom overlaps the track;
    // all other variants centre-align their tabs.
    isHorizontal ? (isUnderline ? 'flex flex-row items-end' : 'flex flex-row items-center') : 'flex flex-col',
    isUnderline
      ? isHorizontal ? 'gap-3 border-b border-neutral-p80' : 'gap-1 border-l border-neutral-p80'
      : isHorizontal ? 'gap-2' : 'gap-1',
    // button-dark-brand wraps tabs in a gray pill background
    isDarkBrand && 'bg-background-secondary p-1 rounded-[12px]',
    isHorizontal && fullWidth && 'w-full',
  );
}

// ─── Single tab button ────────────────────────────────────────────────────────

interface TabButtonProps {
  item:      TabItem;
  active:    boolean;
  variant:   TabVariant;
  size:      TabSize;
  layout:    TabsLayout;
  fullWidth: boolean;
  onClick:   () => void;
  onClose?:  () => void;
}

const TabButton = ({ item, active, variant, size, layout, fullWidth, onClick, onClose }: TabButtonProps) => (
  <button
    role="tab"
    type="button"
    aria-selected={active}
    aria-disabled={item.disabled}
    tabIndex={active ? 0 : -1}
    onClick={() => !item.disabled && onClick()}
    className={getTabClass(variant, layout, active, !!item.disabled, fullWidth, size)}
  >
    {/* Leading icon */}
    {item.icon && (
      <span className="w-4 h-4 shrink-0 flex items-center justify-center [&_svg]:w-full [&_svg]:h-full">
        {item.icon}
      </span>
    )}

    {/* Label */}
    <span>{item.label}</span>

    {/* Badge */}
    {item.badge !== undefined && <TabBadge value={item.badge} active={active} />}

    {/* Close × */}
    {item.closable && onClose && (
      <CloseX active={active} onClick={e => { e.stopPropagation(); onClose(); }} />
    )}
  </button>
);

// ─── Tabs ──────────────────────────────────────────────────────────────────────

export const Tabs = ({
  items,
  activeKey: activeKeyProp,
  defaultActiveKey,
  onChange,
  onClose,
  variant   = 'underline',
  size      = 'md',
  layout    = 'horizontal',
  fullWidth = false,
  className,
}: TabsProps) => {
  const isControlled = activeKeyProp !== undefined;
  const [internalKey, setInternalKey] = useState(
    defaultActiveKey ?? items[0]?.key ?? '',
  );
  const activeKey = isControlled ? (activeKeyProp ?? '') : internalKey;

  const handleChange = (key: string) => {
    if (!isControlled) setInternalKey(key);
    onChange?.(key);
  };

  const isHorizontal = layout === 'horizontal';
  const hasPanel     = items.some(item => item.children !== undefined);
  const activeItem   = items.find(item => item.key === activeKey);

  return (
    <div
      className={clsx(
        'flex',
        isHorizontal ? 'flex-col' : 'flex-row gap-6',
        className,
      )}
    >
      {/* ── Tab bar ── */}
      <div
        role="tablist"
        aria-orientation={isHorizontal ? 'horizontal' : 'vertical'}
        className={getBarClass(variant, layout, fullWidth)}
      >
        {items.map(item => (
          <TabButton
            key={item.key}
            item={item}
            active={item.key === activeKey}
            variant={variant}
            size={size}
            layout={layout}
            fullWidth={fullWidth}
            onClick={() => handleChange(item.key)}
            onClose={onClose ? () => onClose(item.key) : undefined}
          />
        ))}
      </div>

      {/* ── Tab panel ── */}
      {hasPanel && (
        <div role="tabpanel" className={isHorizontal ? 'pt-4' : ''}>
          {activeItem?.children}
        </div>
      )}
    </div>
  );
};

Tabs.displayName = 'Tabs';
