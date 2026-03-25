'use client';

import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: PaginationNumberBase — node 40001706:32829
//        CarouselArrow        — node 40001706:32830
//        Pagination           — node 40001756:34415
//
// Variants = default (no border on page numbers) | outline (bordered)
// Sizes    = sm (32px buttons) | md (40px buttons)

export type PaginationSize    = 'sm' | 'md';
export type PaginationVariant = 'default' | 'outline';

export interface PaginationProps {
  /** Current page number (1-based) */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Total item count — used for "X–Y of Z items" summary */
  totalItems?: number;
  /** Items per page — used for summary text */
  pageSize?: number;
  /** Called when user navigates to a page */
  onPageChange: (page: number) => void;
  /** Options shown in the per-page dropdown. Default: [10, 20, 50, 100] */
  pageSizeOptions?: number[];
  /** Called when user selects a new page size */
  onPageSizeChange?: (size: number) => void;
  /** Show the items-per-page dropdown. Default: true */
  showPageSize?: boolean;
  /** Show "items per page" label beside the dropdown. Default: false */
  showPageSizeLabel?: boolean;
  /** Show a horizontal rule above the bar. Default: true */
  showDivider?: boolean;
  /** Button size. Default: sm */
  size?: PaginationSize;
  /** Visual variant. Default: default */
  variant?: PaginationVariant;
  className?: string;
}

// ─── Page item computation ────────────────────────────────────────────────────
// Returns a mix of page numbers and nulls (null = ellipsis).
// Always shows: 1, last, current, current±1. Fills gaps with null.

function getPageItems(current: number, total: number): Array<number | null> {
  if (total <= 0) return [];
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const shown = new Set([1, total, current]);
  if (current > 1) shown.add(current - 1);
  if (current < total) shown.add(current + 1);

  const sorted = Array.from(shown).sort((a, b) => a - b);
  const result: Array<number | null> = [];

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push(null); // ellipsis
    result.push(sorted[i]);
  }

  return result;
}

function itemRangeText(page: number, pageSize: number, total: number): string {
  if (total <= 0) return '0 of 0 items';
  const start = (page - 1) * pageSize + 1;
  const end   = Math.min(page * pageSize, total);
  return `${start}–${end} of ${total} items`;
}

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

const ChevronLeftSvg = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden className="w-5 h-5">
    <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRightSvg = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden className="w-5 h-5">
    <path d="M7.5 15l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronDownSvg = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden className="w-5 h-5">
    <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Size / variant maps ──────────────────────────────────────────────────────

const BTN_SIZE: Record<PaginationSize, string> = {
  sm: 'w-8 h-8',    // 32 px
  md: 'w-10 h-10',  // 40 px
};

const BTN_RADIUS: Record<PaginationVariant, string> = {
  default: 'rounded-[4px]',
  outline: 'rounded-[8px]',
};

// ─── Pagination ───────────────────────────────────────────────────────────────

export const Pagination = ({
  page,
  totalPages,
  totalItems,
  pageSize = 20,
  onPageChange,
  pageSizeOptions = [10, 20, 50, 100],
  onPageSizeChange,
  showPageSize     = true,
  showPageSizeLabel = false,
  showDivider      = true,
  size             = 'sm',
  variant          = 'default',
  className,
}: PaginationProps) => {
  const isOutline      = variant === 'outline';
  const btnSize        = BTN_SIZE[size];
  const radius         = BTN_RADIUS[variant];
  const isPrevDisabled = page <= 1;
  const isNextDisabled = page >= totalPages;

  // ── Arrow button classes ────────────────────────────────────────────────────

  const arrowBase = clsx(
    'inline-flex items-center justify-center shrink-0 transition-colors duration-150',
    btnSize, radius,
  );

  const arrowEnabled = clsx(
    arrowBase, 'text-text-secondary hover:bg-background-secondary cursor-pointer',
    isOutline ? 'bg-white border border-neutral-p80' : 'bg-white',
  );

  const arrowDisabled = clsx(
    arrowBase, 'text-text-placeholder cursor-not-allowed',
    isOutline
      ? 'bg-background-secondary border border-background-secondary'
      : 'bg-background-secondary',
  );

  // ── Page number button classes ──────────────────────────────────────────────

  const numBase = clsx(
    'inline-flex items-center justify-center shrink-0 text-sm font-normal',
    'transition-colors duration-150',
    btnSize, radius,
  );

  const numActive = clsx(
    numBase, 'bg-primary text-white cursor-default',
    isOutline && 'border border-primary',
  );

  const numInactive = clsx(
    numBase, 'text-text-secondary hover:bg-background-secondary cursor-pointer',
    isOutline ? 'bg-white border border-neutral-p80' : 'bg-white',
  );

  // ── Summary text ────────────────────────────────────────────────────────────

  const rangeText = totalItems !== undefined
    ? itemRangeText(page, pageSize, totalItems)
    : `Page ${page} of ${totalPages}`;

  const pageItems = getPageItems(page, totalPages);

  return (
    <div className={clsx('flex flex-col gap-5 w-full', className)}>

      {/* Divider */}
      {showDivider && (
        <hr className="border-0 border-t border-neutral-p80 w-full" />
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">

        {/* ── Left: item range summary ── */}
        <span className="text-base text-text-secondary whitespace-nowrap select-none">
          {rangeText}
        </span>

        {/* ── Right: navigation + page size ── */}
        <div className="flex items-center gap-6">

          {/* Prev arrow + page numbers + Next arrow */}
          <div className="flex items-center gap-3">

            {/* Previous */}
            <button
              type="button"
              aria-label="Previous page"
              disabled={isPrevDisabled}
              onClick={() => !isPrevDisabled && onPageChange(page - 1)}
              className={isPrevDisabled ? arrowDisabled : arrowEnabled}
            >
              <ChevronLeftSvg />
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {pageItems.map((item, i) =>
                item === null ? (
                  <span
                    key={`e-${i}`}
                    className={clsx(
                      'inline-flex items-center justify-center text-sm text-text-secondary select-none',
                      btnSize,
                    )}
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    aria-label={`Page ${item}`}
                    aria-current={item === page ? 'page' : undefined}
                    onClick={() => item !== page && onPageChange(item)}
                    className={item === page ? numActive : numInactive}
                  >
                    {item}
                  </button>
                )
              )}
            </div>

            {/* Next */}
            <button
              type="button"
              aria-label="Next page"
              disabled={isNextDisabled}
              onClick={() => !isNextDisabled && onPageChange(page + 1)}
              className={isNextDisabled ? arrowDisabled : arrowEnabled}
            >
              <ChevronRightSvg />
            </button>
          </div>

          {/* Per-page dropdown */}
          {showPageSize && (
            <div className="flex items-center gap-2">
              {showPageSizeLabel && (
                <span className="text-base text-text-secondary whitespace-nowrap select-none">
                  items per page
                </span>
              )}
              <div className="relative inline-flex items-center">
                <select
                  value={pageSize}
                  onChange={e => onPageSizeChange?.(Number(e.target.value))}
                  aria-label="Items per page"
                  className={clsx(
                    'appearance-none bg-white border border-neutral-p80 rounded-[8px]',
                    'pl-3 pr-8 py-2 text-base text-text-secondary',
                    'cursor-pointer outline-none',
                    'hover:border-primary',
                    'focus:border-primary focus:shadow-[0_0_0_3px_#CCEFD9]',
                    'transition-[border-color,box-shadow] duration-150',
                  )}
                >
                  {pageSizeOptions.map(opt => (
                    <option key={opt} value={opt}>{opt} / page</option>
                  ))}
                </select>
                <span className="absolute right-2 text-text-secondary pointer-events-none">
                  <ChevronDownSvg />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Pagination.displayName = 'Pagination';
