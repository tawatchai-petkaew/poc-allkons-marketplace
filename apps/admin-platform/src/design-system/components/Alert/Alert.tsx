'use client';

import { type ReactNode } from 'react';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: Alert   — node 40002769:82899
// Figma: Toast/M — node 40002777:85018  (Alert, Toast — Figma description)
//
// variant = alert  → rounded card with border, close X is absolute top-right
// variant = banner → full-width strip, no border/radius, close X inline at end
//
// No description layout : [icon] [title ──────────] [action] [X]
// With description layout: [icon] [title            [X]
//                                  description
//                                  [action1] [action2]]

export type AlertType    = 'error' | 'warning' | 'success' | 'info';
export type AlertVariant = 'alert' | 'banner';

export interface AlertProps {
  /** Semantic type — controls color and icon. Default: info */
  type?: AlertType;
  /**
   * Layout variant.
   * alert  = rounded bordered card (inline message)
   * banner = full-width strip without border/radius (page-level notice)
   * Default: alert
   */
  variant?: AlertVariant;
  /** Alert heading / main message */
  title?: ReactNode;
  /** Optional supporting description below the title */
  description?: ReactNode;
  /** Action link buttons. Rendered inline (no description) or below description */
  actions?: ReactNode;
  /** Whether to render the leading icon. Default: true */
  showIcon?: boolean;
  /** Custom icon — overrides the default type icon */
  icon?: ReactNode;
  /** Called when X is clicked. If omitted, no close button is shown */
  onClose?: () => void;
  /** Extra classes applied to the root element */
  className?: string;
}

// ─── Per-type config ──────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<AlertType, {
  bg:        string;  // Tailwind bg token
  border:    string;  // Tailwind border-color (alert variant)
  iconColor: string;  // Tailwind text color for icon
}> = {
  error:   { bg: 'bg-error-subtle',   border: 'border-[#F0A69F]', iconColor: 'text-error'   },
  warning: { bg: 'bg-warning-subtle', border: 'border-[#FFDD9C]', iconColor: 'text-warning' },
  success: { bg: 'bg-success-subtle', border: 'border-[#ACE5BE]', iconColor: 'text-success' },
  info:    { bg: 'bg-info-subtle',    border: 'border-[#C1E0F5]', iconColor: 'text-info'    },
};

// ─── Icons ────────────────────────────────────────────────────────────────────

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="w-6 h-6 shrink-0">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Zm0 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm1 4a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0v-5Z" />
  </svg>
);

const WarningIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="w-6 h-6 shrink-0">
    <path fillRule="evenodd" clipRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0V9a1 1 0 0 1 1-1Zm1 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
  </svg>
);

const SuccessIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="w-6 h-6 shrink-0">
    <path fillRule="evenodd" clipRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-3.707a1 1 0 0 0-1.414 0L11 11.586 9.707 10.293a1 1 0 1 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0 0-1.414Z" />
  </svg>
);

const ErrorIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="w-6 h-6 shrink-0">
    <path fillRule="evenodd" clipRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12ZM12 7a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0V8a1 1 0 0 1 1-1Zm1 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
  </svg>
);

const DEFAULT_ICONS: Record<AlertType, ReactNode> = {
  info:    <InfoIcon />,
  warning: <WarningIcon />,
  success: <SuccessIcon />,
  error:   <ErrorIcon />,
};

// ─── Close button ─────────────────────────────────────────────────────────────

const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Close"
    className="flex items-center justify-center rounded text-text-secondary hover:text-text-primary transition-colors shrink-0"
  >
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="w-6 h-6">
      <path d="M18.364 5.636a1 1 0 0 1 0 1.414L13.414 12l4.95 4.95a1 1 0 0 1-1.414 1.414L12 13.414l-4.95 4.95a1 1 0 0 1-1.414-1.414L10.586 12 5.636 7.05a1 1 0 0 1 1.414-1.414L12 10.586l4.95-4.95a1 1 0 0 1 1.414 0Z" />
    </svg>
  </button>
);

// ─── Alert ────────────────────────────────────────────────────────────────────

export const Alert = ({
  type = 'info',
  variant = 'alert',
  title,
  description,
  actions,
  showIcon = true,
  icon,
  onClose,
  className,
}: AlertProps) => {
  const { bg, border, iconColor } = TYPE_CONFIG[type];
  const isBanner = variant === 'banner';
  const hasDescription = !!description;

  const iconNode = showIcon ? (icon ?? DEFAULT_ICONS[type]) : null;

  // ── Banner variant ─────────────────────────────────────────────────────────
  // Full-width strip: no rounded corners, no border.
  // No description → single row: [icon][title][actions][X]
  // With description → stacked:  [icon][title+desc] with X absolute, actions below
  if (isBanner) {
    return (
      <div
        role="alert"
        className={clsx(
          'relative w-full',
          bg,
          'px-4 py-2 sm:py-3',
          className,
        )}
      >
        {/* Absolute close — used for banner+description layout */}
        {onClose && hasDescription && (
          <div className="absolute top-3 right-3">
            <CloseButton onClick={onClose} />
          </div>
        )}

        <div className={clsx(
          'flex gap-2 w-full sm:max-w-[1376px]',
          hasDescription ? 'items-start' : 'items-center',
        )}>
          {/* Icon */}
          {iconNode && (
            <span className={clsx('flex items-center justify-center shrink-0', iconColor)}>
              {iconNode}
            </span>
          )}

          {/* Title / description */}
          <div className={clsx(
            'flex-1 min-w-0',
            hasDescription ? '' : 'flex items-center gap-2',
          )}>
            {title && (
              <p className="text-base font-medium text-text-primary leading-6">{title}</p>
            )}
            {hasDescription && description && (
              <p className="text-sm text-text-secondary leading-5">{description}</p>
            )}
          </div>

          {/* Inline actions + close (no-description row layout) */}
          {!hasDescription && (actions || onClose) && (
            <div className="flex items-center gap-3 shrink-0">
              {actions}
              {onClose && <CloseButton onClick={onClose} />}
            </div>
          )}
        </div>

        {/* Actions below content for banner+description */}
        {hasDescription && actions && (
          <div className="flex items-center gap-3 mt-2 pl-8">
            {actions}
          </div>
        )}
      </div>
    );
  }

  // ── Alert variant (card) ───────────────────────────────────────────────────
  // Rounded card with border. Close X is always absolute top-right.
  // No description → [icon][title][actions with pr-9]  (X absolute)
  // With description → [icon][title+desc] then actions row
  return (
    <div
      role="alert"
      className={clsx(
        'relative w-full',
        bg,
        'border rounded-xl',
        border,
        'p-3 sm:p-4',
        className,
      )}
    >
      {/* Absolute close button */}
      {onClose && (
        <div className="absolute top-[11px] right-[11px]">
          <CloseButton onClick={onClose} />
        </div>
      )}

      <div className={clsx(
        'flex gap-2',
        hasDescription ? 'items-start' : 'items-center',
      )}>
        {/* Icon */}
        {iconNode && (
          <span className={clsx('flex items-center justify-center shrink-0', iconColor)}>
            {iconNode}
          </span>
        )}

        {/* Title + (for no-description: inline actions) */}
        <div className={clsx(
          'flex min-w-0',
          hasDescription ? 'flex-col flex-1' : 'flex-1 items-center gap-2',
        )}>
          {title && (
            <p className="text-base font-medium text-text-primary leading-6">{title}</p>
          )}
          {hasDescription && (
            <p className="text-sm text-text-secondary leading-5 mt-0.5">{description}</p>
          )}

          {/* Inline actions (no-description only) — leave room for the absolute X */}
          {!hasDescription && actions && (
            <div className={clsx(
              'flex items-center gap-3 shrink-0',
              onClose ? 'pr-9' : '',
            )}>
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Stacked actions row (description layout) */}
      {hasDescription && actions && (
        <div className="flex items-center gap-3 mt-2 pl-8">
          {actions}
        </div>
      )}
    </div>
  );
};

Alert.displayName = 'Alert';
