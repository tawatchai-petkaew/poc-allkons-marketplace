'use client';

import { type ReactNode } from 'react';
import { clsx } from 'clsx';
import { Button } from '../Button';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: Page Header — node 40001934:25857
//
// Types   = Simple (title + desc) | Avatar (avatar label group)
// Mobile  = stacked layout, actions below title
// Desktop = single row, actions + search inline

export type PageHeaderType = 'simple' | 'avatar';

export interface PageHeaderBreadcrumbItem {
  /** Visible label text */
  label: ReactNode;
  /** Optional href — renders as <a> when provided */
  href?: string;
  /** Called when this crumb is clicked */
  onClick?: () => void;
}

export interface PageHeaderAvatar {
  name: string;
  email?: string;
  /** Image URL — falls back to first-letter placeholder */
  src?: string;
}

export interface PageHeaderProps {
  /**
   * Layout type.
   * simple = title + supporting text
   * avatar = avatar label group (name + email)
   * Default: simple
   */
  type?: PageHeaderType;
  /** Breadcrumb path — first item is treated as Home icon, last is active */
  breadcrumbs?: PageHeaderBreadcrumbItem[];
  /** Page title (simple type) */
  title?: ReactNode;
  /** Supporting text below the title (simple type) */
  description?: ReactNode;
  /** Optional badge rendered inline after the title */
  badge?: ReactNode;
  /** If provided, renders a Back link button above the title */
  goBack?: { label?: string; onClick: () => void };
  /** Avatar info (avatar type) */
  avatar?: PageHeaderAvatar;
  /** Action buttons slot — renders to the right of the title on desktop */
  actions?: ReactNode;
  /** Search bar slot — renders after actions on desktop, stacks below on mobile */
  searchBar?: ReactNode;
  /** Show bottom divider. Default: true */
  divider?: boolean;
  /** Extra classes applied to the root element */
  className?: string;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const HomeIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className="w-5 h-5">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-3H9v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z"
    />
  </svg>
);

const ChevronRightIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden className="w-4 h-4 shrink-0">
    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden className="w-5 h-5">
    <path d="M15.833 10H4.167M4.167 10l5 5M4.167 10l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── PageHeader ───────────────────────────────────────────────────────────────

export const PageHeader = ({
  type = 'simple',
  breadcrumbs,
  title,
  description,
  badge,
  goBack,
  avatar,
  actions,
  searchBar,
  divider = true,
  className,
}: PageHeaderProps) => {
  const isSimple = type === 'simple';
  const isAvatar = type === 'avatar';

  return (
    <div className={clsx('flex flex-col items-start gap-4 w-full', className)}>

      {/* Breadcrumbs — desktop only */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="hidden sm:flex items-center gap-1" aria-label="Breadcrumb">
          {/* Home icon — always first */}
          <button
            type="button"
            className="flex items-center justify-center rounded-md text-text-tertiary hover:text-text-secondary transition-colors"
            onClick={breadcrumbs[0]?.onClick}
            aria-label="Home"
          >
            <HomeIcon />
          </button>

          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <span key={idx} className="flex items-center gap-1">
                <ChevronRightIcon />
                {isLast ? (
                  <span className="text-sm text-primary-text font-normal truncate max-w-[80px]">
                    {crumb.label}
                  </span>
                ) : crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-sm text-text-tertiary hover:text-text-secondary transition-colors truncate max-w-[80px] rounded-md"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <button
                    type="button"
                    className="text-sm text-text-tertiary hover:text-text-secondary transition-colors truncate max-w-[80px] rounded-md"
                    onClick={crumb.onClick}
                  >
                    {crumb.label}
                  </button>
                )}
              </span>
            );
          })}
        </nav>
      )}

      {/* Content row — title/avatar left, actions+search right */}
      <div className="flex flex-wrap sm:flex-nowrap gap-4 items-end w-full">

        {/* Left: goBack + title/avatar + description */}
        <div className="flex flex-col flex-1 min-w-0 items-start gap-1">
          {goBack && (
            <div className="pb-1">
              <Button
                variant="link-neutral"
                size="md"
                startIcon={<ArrowLeftIcon />}
                onClick={goBack.onClick}
              >
                {goBack.label ?? 'Back'}
              </Button>
            </div>
          )}

          {isSimple && (
            <>
              <div className="flex items-center gap-3 w-full">
                {title && (
                  <h1 className="text-2xl font-bold text-text-primary leading-7 whitespace-nowrap">
                    {title}
                  </h1>
                )}
                {badge}
              </div>
              {description && (
                <p className="text-base text-text-tertiary leading-6">{description}</p>
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

        {/* Right: actions + search — inline on desktop, stacked below on mobile */}
        {(actions || searchBar) && (
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 w-full sm:w-auto">
            {actions && (
              <div className="flex items-center gap-3">{actions}</div>
            )}
            {searchBar && (
              <div className="w-full sm:w-[320px] shrink-0">{searchBar}</div>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      {divider && <hr className="w-full border-0 border-t border-neutral-p80" />}
    </div>
  );
};

PageHeader.displayName = 'PageHeader';
