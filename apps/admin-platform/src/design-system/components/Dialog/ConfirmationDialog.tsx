'use client';

import type { ReactNode } from 'react';
import { Dialog } from './Dialog';
import { IconWithRing } from '../IconWithRing';
import type { IconWithRingVariant } from '../IconWithRing';
import { Button } from '../Button';
import type { ButtonVariant } from '../Button/button.variants';

// ─── Types ────────────────────────────────────────────────────────────────────
// Figma: Confirmation Dialog — node 40010065:41839
//
// Types = default (info icon) | error (alert icon) | success (check icon)
// Assembled from Dialog base (size=sm, showHeader=false)

export type ConfirmDialogType = 'default' | 'error' | 'success';

export interface ConfirmationDialogProps {
  /** Whether the dialog is visible */
  open: boolean;
  /** Called when overlay or X is clicked (same as onCancel by default) */
  onClose?: () => void;
  /** Called when the primary confirm button is clicked */
  onConfirm?: () => void;
  /** Called when the cancel button is clicked */
  onCancel?: () => void;
  /** Controls icon color and confirm button style. Default: default */
  type?: ConfirmDialogType;
  /** Dialog heading. Default: "Are you sure?" */
  title?: ReactNode;
  /** Supporting text below the heading */
  description?: ReactNode;
  /** Override the center icon (defaults to type-specific inline SVG) */
  icon?: ReactNode;
  /** Primary/confirm button label. Default: "Confirm" */
  confirmLabel?: string;
  /** Cancel button label. Default: "Cancel" */
  cancelLabel?: string;
  /** Show loading spinner on the confirm button */
  confirmLoading?: boolean;
  /** Disable the confirm button */
  confirmDisabled?: boolean;
  /** Hide the cancel button (single-action confirm only) */
  hideCancel?: boolean;
}

// ─── Type config ──────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<ConfirmDialogType, {
  ringVariant: IconWithRingVariant;
  confirmVariant: ButtonVariant;
}> = {
  default: { ringVariant: 'info',    confirmVariant: 'primary-brand'  },
  error:   { ringVariant: 'error',   confirmVariant: 'primary-error'  },
  success: { ringVariant: 'success', confirmVariant: 'primary-brand'  },
};

// ─── Default icons ─────────────────────────────────────────────────────────────

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="w-full h-full">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="w-full h-full">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="w-full h-full">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

const DEFAULT_ICONS: Record<ConfirmDialogType, ReactNode> = {
  default: <InfoIcon />,
  error:   <AlertIcon />,
  success: <CheckIcon />,
};

// ─── ConfirmationDialog ───────────────────────────────────────────────────────

export const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  onCancel,
  type = 'default',
  title = 'Are you sure?',
  description,
  icon,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmLoading = false,
  confirmDisabled = false,
  hideCancel = false,
}: ConfirmationDialogProps) => {
  const { ringVariant, confirmVariant } = TYPE_CONFIG[type];
  const handleCancel = onCancel ?? onClose;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      showHeader={false}
      footer={
        hideCancel ? (
          // ── Single button: hug content, cap at 320px, centered ────────────
          <div className="flex justify-center w-full">
            <Button
              variant={confirmVariant}
              size="md"
              className="min-w-[120px] max-w-xs"
              loading={confirmLoading}
              disabled={confirmDisabled}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        ) : (
          // ── Two buttons: equal fill, height grows on long text ────────────
          <div className="flex gap-3 w-full">
            <Button
              variant="secondary-neutral"
              size="md"
              className="flex-1 !h-auto min-h-10"
              onClick={handleCancel}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={confirmVariant}
              size="md"
              className="flex-1 !h-auto min-h-10"
              loading={confirmLoading}
              disabled={confirmDisabled}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        )
      }
    >
      {/* Centered icon + heading + description */}
      <div className="flex flex-col items-center gap-4 text-center pt-2">
        <IconWithRing
          variant={ringVariant}
          icon={icon ?? DEFAULT_ICONS[type]}
          size={160}
        />

        <div className="flex flex-col items-center gap-2">
          {title && (
            <h2 className="text-[28px] font-bold text-text-primary leading-8">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-lg text-text-quaternary leading-6">
              {description}
            </p>
          )}
        </div>
      </div>
    </Dialog>
  );
};

ConfirmationDialog.displayName = 'ConfirmationDialog';
