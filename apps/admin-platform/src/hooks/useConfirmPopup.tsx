'use client';

import { useState, useCallback } from 'react';
import { ConfirmationDialog } from '@/design-system';
import type { ConfirmDialogType } from '@/design-system';
import { ReactNode } from 'react';

type ConfirmPopupType = 'confirm' | 'warn' | 'info';
type FooterButtons = 'both' | 'confirm' | 'cancel' | 'none';

interface ConfirmPopupConfig {
  title: string;
  detail: string | ReactNode;
  confirmText: string;
  cancelText: string;
  type: ConfirmPopupType;
  onConfirm: (() => void) | null;
  footerButtons: FooterButtons;
}

interface ShowConfirmOptions {
  title?: string;
  detail?: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmPopupType;
  onConfirm?: () => void;
  footerButtons?: FooterButtons;
  /** @deprecated — no longer used */
  buttonWidth?: 'fill' | 'fit';
}

// Map old ConfirmPopup type → DS ConfirmationDialog type
const toDialogType = (type: ConfirmPopupType): ConfirmDialogType => {
  switch (type) {
    case 'warn':    return 'error';
    case 'confirm':
    case 'info':
    default:        return 'default';
  }
};

export const useConfirmPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ConfirmPopupConfig>({
    title: '',
    detail: '',
    confirmText: 'ยืนยัน',
    cancelText: 'ยกเลิก',
    type: 'confirm',
    onConfirm: null,
    footerButtons: 'both',
  });

  const showConfirm = useCallback((options: ShowConfirmOptions) => {
    setConfig({
      title:       options.title       ?? '',
      detail:      options.detail      ?? '',
      confirmText: options.confirmText ?? 'ยืนยัน',
      cancelText:  options.cancelText  ?? 'ยกเลิก',
      type:        options.type        ?? 'confirm',
      onConfirm:   options.onConfirm   ?? null,
      footerButtons: options.footerButtons ?? 'both',
    });
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleConfirm = useCallback(() => {
    config.onConfirm?.();
    setIsOpen(false);
  }, [config]);

  const confirmPopup = isOpen ? (
    <ConfirmationDialog
      open={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      onCancel={handleClose}
      type={toDialogType(config.type)}
      title={config.title}
      description={config.detail}
      confirmLabel={config.confirmText}
      cancelLabel={config.cancelText}
      hideCancel={config.footerButtons === 'confirm'}
    />
  ) : null;

  return {
    confirmPopup,
    showConfirm,
  };
};
