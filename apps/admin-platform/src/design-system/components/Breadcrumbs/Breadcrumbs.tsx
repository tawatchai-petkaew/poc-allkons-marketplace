'use client';

import { type ReactNode } from 'react';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: BreadcrumbButtonBase — node 40001772:8447
// Figma: Breadcrumbs          — node 40001780:11712
//
// color   = brand   → active text #008C36, inactive #495569
//           neutral → active text #242A34, inactive #5B6A83
// divider = chevron (›) | slash (/)
// type    = text   → plain text items, no item background
//           button → pill-shaped items with subtle background per item
//
// First item is always treated as the Home icon.
// Last item is always "current" (active colour, no href interaction).
// On mobile the home shows icon-only; middle items collapse to a single "…".

export type BreadcrumbColor   = 'brand' | 'neutral';
export type BreadcrumbDivider = 'chevron' | 'slash';
export type BreadcrumbType    = 'text' | 'button';

export interface BreadcrumbItem {
  /** Visible label text */
  label: string;
  /** When provided, item renders as an <a> link */
  href?: string;
  /** Click handler (used when no href is given) */
  onClick?: () => void;
}

export interface BreadcrumbsProps {
  /**
   * Ordered list of breadcrumb segments.
   * • Index 0 → Home (renders as house icon)
   * • Last index → current page (active colour, non-interactive)
   */
  items: BreadcrumbItem[];
  /**
   * Active item colour palette.
   * brand   = green (#008C36 active, #495569 inactive)
   * neutral = dark  (#242A34 active, #5B6A83 inactive)
   * Default: brand
   */
  color?: BreadcrumbColor;
  /**
   * Separator between items.
   * chevron = › icon  |  slash = /
   * Default: chevron
   */
  divider?: BreadcrumbDivider;
  /**
   * Item presentation style.
   * text   = plain text, no pill background
   * button = each item has a subtle pill/badge background
   * Default: text
   */
  type?: BreadcrumbType;
  /** Extra classes applied to the root <nav> */
  className?: string;
}

// ─── Colour config ────────────────────────────────────────────────────────────

const COLOR_CONFIG: Record<BreadcrumbColor, {
  inactiveText:  string;  // Tailwind text class for non-current items
  activeText:    string;  // Tailwind text class for current (last) item
  inactiveBg:    string;  // Button-type: inactive pill bg (transparent)
  activeBg:      string;  // Button-type: active pill bg
}> = {
  brand: {
    inactiveText: 'text-text-tertiary',            // #495569
    activeText:   'text-primary-text',             // #008C36
    inactiveBg:   'bg-transparent',
    activeBg:     'bg-background-brand-subtle',    // #CCEFD9
  },
  neutral: {
    inactiveText: 'text-text-quaternary',          // #5B6A83
    activeText:   'text-neutral-60',               // #242A34
    inactiveBg:   'bg-transparent',
    activeBg:     'bg-neutral-p90',                // #EFF0F3
  },
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const HomeIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="w-5 h-5 shrink-0">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.293 2.293a1 1 0 0 1 1.414 0l6 6A1 1 0 0 1 17 9v8a1 1 0 0 1-1 1h-3.5a.5.5 0 0 1-.5-.5V14a1 1 0 0 0-2 0v3.5a.5.5 0 0 1-.5.5H5a1 1 0 0 1-1-1V9a1 1 0 0 1 .293-.707l5-5Z"
    />
  </svg>
);

const ChevronRightIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden className="w-4 h-4 shrink-0 text-text-quinary">
    <path
      d="M6 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SlashDivider = () => (
  <span
    aria-hidden
    className="shrink-0 w-4 text-center text-sm leading-5 text-text-quinary select-none"
  >
    /
  </span>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Renders the separator between two items */
const Divider = ({ divider }: { divider: BreadcrumbDivider }) =>
  divider === 'chevron' ? <ChevronRightIcon /> : <SlashDivider />;

// ─── Breadcrumbs ──────────────────────────────────────────────────────────────

export const Breadcrumbs = ({
  items,
  color   = 'brand',
  divider = 'chevron',
  type    = 'text',
  className,
}: BreadcrumbsProps) => {
  if (!items.length) return null;

  const { inactiveText, activeText, inactiveBg, activeBg } = COLOR_CONFIG[color];
  const isButton = type === 'button';

  const lastIdx = items.length - 1;

  // ── Shared pill wrapper for button type ────────────────────────────────────
  const pillClass = (active: boolean) =>
    isButton
      ? clsx(
          'rounded-lg px-2 py-1',
          active ? activeBg : inactiveBg,
        )
      : '';

  // ── Render a single breadcrumb item ────────────────────────────────────────
  const renderItem = (item: BreadcrumbItem, idx: number): ReactNode => {
    const isFirst   = idx === 0;
    const isLast    = idx === lastIdx;
    const isCurrent = isLast;

    const textClass = clsx(
      'text-sm leading-5 whitespace-nowrap truncate',
      isCurrent ? activeText : inactiveText,
    );

    // ── Home item (first) ─────────────────────────────────────────────────
    if (isFirst) {
      const inner = (
        <span className={clsx('flex items-center gap-1', pillClass(false))}>
          {/* Icon always visible */}
          <span className={inactiveText}>
            <HomeIcon />
          </span>
          {/* Label: visible on desktop; hidden on mobile (icon-only) */}
          {isButton && (
            <span className={clsx(textClass, 'hidden sm:inline max-w-[80px]')}>
              {item.label}
            </span>
          )}
          {!isButton && (
            <span className={clsx(textClass, 'hidden sm:inline max-w-[80px]')}>
              {item.label}
            </span>
          )}
        </span>
      );

      if (item.href) {
        return (
          <a
            key={idx}
            href={item.href}
            className={clsx(
              'flex items-center rounded-lg outline-none',
              'focus-visible:ring-2 focus-visible:ring-primary',
              'hover:opacity-75 transition-opacity',
            )}
            aria-label={item.label}
          >
            {inner}
          </a>
        );
      }

      if (item.onClick) {
        return (
          <button
            key={idx}
            type="button"
            onClick={item.onClick}
            className={clsx(
              'flex items-center rounded-lg outline-none cursor-pointer',
              'focus-visible:ring-2 focus-visible:ring-primary',
              'hover:opacity-75 transition-opacity',
            )}
            aria-label={item.label}
          >
            {inner}
          </button>
        );
      }

      return (
        <span key={idx} className="flex items-center" aria-label={item.label}>
          {inner}
        </span>
      );
    }

    // ── Current (last) item ───────────────────────────────────────────────
    if (isCurrent) {
      return (
        <span
          key={idx}
          aria-current="page"
          className={clsx(
            'flex items-center gap-1 rounded-lg',
            pillClass(true),
          )}
        >
          <span className={clsx(textClass, 'max-w-[80px] sm:max-w-none')}>
            {item.label}
          </span>
        </span>
      );
    }

    // ── Middle items ──────────────────────────────────────────────────────
    const inner = (
      <span className={clsx('flex items-center gap-1', pillClass(false))}>
        {/* Mobile: collapse to "…" */}
        <span className={clsx(textClass, 'sm:hidden')} aria-hidden>
          …
        </span>
        {/* Desktop: show truncated label */}
        <span className={clsx(textClass, 'hidden sm:inline max-w-[80px]')}>
          {item.label}
        </span>
      </span>
    );

    if (item.href) {
      return (
        <a
          key={idx}
          href={item.href}
          className={clsx(
            'flex items-center rounded-lg outline-none',
            'focus-visible:ring-2 focus-visible:ring-primary',
            'hover:opacity-75 transition-opacity',
          )}
        >
          {inner}
        </a>
      );
    }

    if (item.onClick) {
      return (
        <button
          key={idx}
          type="button"
          onClick={item.onClick}
          className={clsx(
            'flex items-center rounded-lg outline-none cursor-pointer',
            'focus-visible:ring-2 focus-visible:ring-primary',
            'hover:opacity-75 transition-opacity',
          )}
        >
          {inner}
        </button>
      );
    }

    return (
      <span key={idx} className="flex items-center">
        {inner}
      </span>
    );
  };

  // ─── Build item list with separators ────────────────────────────────────────
  const nodes: ReactNode[] = [];

  items.forEach((item, idx) => {
    nodes.push(renderItem(item, idx));
    if (idx < lastIdx) {
      nodes.push(
        <span key={`sep-${idx}`} aria-hidden className="flex items-center shrink-0">
          <Divider divider={divider} />
        </span>,
      );
    }
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className={clsx(
        'flex flex-wrap items-center gap-1',
        className,
      )}
    >
      <ol className="flex flex-wrap items-center gap-1 list-none m-0 p-0">
        {nodes.map((node, i) => (
          <li key={i} className="flex items-center">
            {node}
          </li>
        ))}
      </ol>
    </nav>
  );
};

Breadcrumbs.displayName = 'Breadcrumbs';
