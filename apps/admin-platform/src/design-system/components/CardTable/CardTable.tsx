'use client';

import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { CardTableItem } from './CardTableItem';
import type { CardTableItemSize } from './CardTableItem';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: Card table — node 40002665:11411
//
// Layout: Vertical (flex-col) | Horizontal (flex-row, items equal width)
// Breakpoint: desktop (gap-3, md items) | mobile (gap-2, sm items)

export type CardTableLayout = 'vertical' | 'horizontal';
export type CardTableBreakpoint = 'desktop' | 'mobile';

export interface CardTableItemData {
  /** Unique key */
  value: string;
  /** Icon inside the feature-icon box */
  icon?: ReactNode;
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
  /** Additional content slot below the text */
  children?: ReactNode;
}

export interface CardTableProps {
  /** Array of item data */
  items: CardTableItemData[];
  /** Flex direction */
  layout?: CardTableLayout;
  /** Controls gap and item text/icon size */
  breakpoint?: CardTableBreakpoint;
  /** Override item size (defaults based on breakpoint) */
  size?: CardTableItemSize;
  /** Called when an item is clicked, receives item value */
  onItemClick?: (value: string) => void;
  className?: string;
}

// ─── CardTable ────────────────────────────────────────────────────────────────

export const CardTable = ({
  items,
  layout = 'vertical',
  breakpoint = 'desktop',
  size,
  onItemClick,
  className,
}: CardTableProps) => {
  const isMobile = breakpoint === 'mobile';
  const isHorizontal = layout === 'horizontal';

  // Default size based on breakpoint
  const itemSize: CardTableItemSize = size ?? (isMobile ? 'sm' : 'md');

  return (
    <div
      className={clsx(
        'flex w-full',
        isHorizontal ? 'flex-row' : 'flex-col',
        isMobile ? 'gap-2' : 'gap-3',
        className,
      )}
    >
      {items.map((item) => (
        <CardTableItem
          key={item.value}
          size={itemSize}
          icon={item.icon}
          heading={item.heading}
          supportingText={item.supportingText}
          badge={item.badge}
          current={item.current}
          disabled={item.disabled}
          actions={item.actions}
          onClick={onItemClick ? () => onItemClick(item.value) : undefined}
          className={isHorizontal ? 'flex-1 min-w-0' : undefined}
        >
          {item.children}
        </CardTableItem>
      ))}
    </div>
  );
};

CardTable.displayName = 'CardTable';
