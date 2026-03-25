'use client';

import { type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { Button } from '../Button';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: Dialog — node 40009379:116716
//
// Sizes   = sm (600px) | md (720px) | lg (960px)
// Mobile  = bottom sheet, rounded-top-2xl, full-width
// Desktop = centered modal, rounded-3xl

export type DialogSize = 'sm' | 'md' | 'lg';

export interface DialogProps {
  /** Whether the dialog is rendered */
  open: boolean;
  /** Called when X button or overlay is clicked */
  onClose?: () => void;
  /** Header title text */
  title?: ReactNode;
  /** Header subtitle / description text */
  description?: ReactNode;
  /** Scrollable body content */
  children?: ReactNode;
  /** Footer slot (action buttons) */
  footer?: ReactNode;
  /**
   * Dialog panel width on desktop.
   * sm = 600px | md = 720px | lg = 960px. Default: sm
   */
  size?: DialogSize;
  /**
   * Whether to show the header section (title + divider).
   * Defaults to true when title or description are provided.
   */
  showHeader?: boolean;
  /** Whether to show the footer slot. Default: true */
  showFooter?: boolean;
  /** Close when the backdrop overlay is clicked. Default: true */
  closeOnOverlayClick?: boolean;
  /** Extra classes applied to the dialog panel */
  className?: string;
}

// ─── Width map (desktop) ──────────────────────────────────────────────────────

const PANEL_MAX_W: Record<DialogSize, string> = {
  sm: 'sm:max-w-[600px]',
  md: 'sm:max-w-[720px]',
  lg: 'sm:max-w-[960px]',
};

// Fixed panel height for md/lg (content scrolls inside)
const PANEL_HEIGHT: Record<DialogSize, string> = {
  sm: '',                       // auto — shrinks to content
  md: 'sm:h-[600px]',
  lg: 'sm:h-[800px]',
};

// Top padding on dialog panel (below X button)
const PANEL_PT: Record<DialogSize, string> = {
  sm: 'pt-6',   // 24px — compact for small/confirmation
  md: 'pt-8',   // 32px
  lg: 'pt-8',   // 32px
};

// ─── X close icon ─────────────────────────────────────────────────────────────

const XIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden className="w-4 h-4">
    <path d="M4 4l8 8M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// ─── Dialog ───────────────────────────────────────────────────────────────────

export const Dialog = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'sm',
  showHeader,
  showFooter = true,
  closeOnOverlayClick = true,
  className,
}: DialogProps) => {
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Focus first focusable element
  useEffect(() => {
    if (!open || !panelRef.current) return;
    const el = panelRef.current.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    el?.focus();
  }, [open]);

  const hasHeader = showHeader ?? !!(title || description);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center"
      role="dialog"
      aria-modal
      aria-labelledby={title ? titleId : undefined}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={clsx(
          'relative z-10 flex flex-col bg-white overflow-hidden',
          'w-full',
          PANEL_MAX_W[size],
          PANEL_HEIGHT[size],
          PANEL_PT[size],
          'pb-6',
          // Mobile: top-only radius (bottom sheet)
          'rounded-t-2xl',
          // Desktop: all-corner radius
          'sm:rounded-3xl',
          className,
        )}
      >
        {/* X close button */}
        {onClose && (
          <div className="absolute top-5 right-5 z-10">
            <Button
              variant="secondary-neutral"
              size="md"
              iconOnly
              aria-label="Close dialog"
              startIcon={<XIcon />}
              onClick={onClose}
            />
          </div>
        )}

        {/* Header */}
        {hasHeader && (
          <div className="shrink-0 px-6">
            <div className={onClose ? 'pr-8' : ''}>
              {title && (
                <h2
                  id={titleId}
                  className="text-2xl font-bold text-text-primary leading-7"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-base text-text-tertiary leading-6">
                  {description}
                </p>
              )}
            </div>
            <hr className="mt-5 border-0 border-t border-neutral-p80" />
          </div>
        )}

        {/* Content */}
        {children !== undefined && (
          <div
            className={clsx(
              'px-6 overflow-y-auto',
              size === 'sm' ? 'shrink-0' : 'flex-1 min-h-0',
              hasHeader ? 'pt-6' : '',
              !footer ? 'pb-0' : '',
            )}
          >
            {children}
          </div>
        )}

        {/* Footer */}
        {showFooter && footer && (
          <div className="shrink-0 px-6 pt-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

Dialog.displayName = 'Dialog';
