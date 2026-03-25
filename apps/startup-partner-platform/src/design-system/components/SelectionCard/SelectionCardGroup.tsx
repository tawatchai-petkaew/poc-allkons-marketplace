'use client';

import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { SelectionCardItem } from './SelectionCardItem';
import type { SelectionCardItemSize } from './SelectionCardItem';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: Checkbox group — node 40002708:24873
//
// Same container logic as CardTable — vertical-only layout,
// breakpoint controls gap size and default item size.

export type SelectionCardBreakpoint = 'desktop' | 'mobile';

export interface SelectionCardItemData {
  /** Unique key */
  value: string;
  /** Primary heading */
  heading: string;
  /** Secondary supporting text */
  supportingText?: string;
  /** Badge label */
  badge?: string;
  /** Selected/active state */
  current?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Action buttons slot */
  actions?: ReactNode;
  /** Additional content slot */
  children?: ReactNode;
}

export interface SelectionCardGroupProps {
  /** Array of item data */
  items: SelectionCardItemData[];
  /** Controls gap and default item size */
  breakpoint?: SelectionCardBreakpoint;
  /** Override item size (defaults based on breakpoint) */
  size?: SelectionCardItemSize;
  /** Called when an item is clicked, receives item value */
  onItemClick?: (value: string) => void;
  className?: string;
}

// ─── SelectionCardGroup ───────────────────────────────────────────────────────

export const SelectionCardGroup = ({
  items,
  breakpoint = 'desktop',
  size,
  onItemClick,
  className,
}: SelectionCardGroupProps) => {
  const isMobile = breakpoint === 'mobile';
  const itemSize: SelectionCardItemSize = size ?? (isMobile ? 'sm' : 'md');

  return (
    <div className={clsx(
      'flex flex-col w-full',
      isMobile ? 'gap-2' : 'gap-3',
      className,
    )}>
      {items.map((item) => (
        <SelectionCardItem
          key={item.value}
          size={itemSize}
          current={item.current}
          disabled={item.disabled}
          heading={item.heading}
          supportingText={item.supportingText}
          badge={item.badge}
          actions={item.actions}
          onClick={onItemClick ? () => onItemClick(item.value) : undefined}
        >
          {item.children}
        </SelectionCardItem>
      ))}
    </div>
  );
};

SelectionCardGroup.displayName = 'SelectionCardGroup';
