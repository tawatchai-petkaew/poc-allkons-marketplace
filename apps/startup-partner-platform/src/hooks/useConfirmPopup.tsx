'use client';

import { useState, useCallback } from 'react';
import ConfirmPopup from '@/components/Popup/ConfirmPopup';
import { ReactNode } from 'react';

type ConfirmPopupType = 'confirm' | 'warn' | 'info';
type FooterButtons = 'both' | 'confirm' | 'cancel' | 'none';
type ButtonWidth = 'fill' | 'fit';

interface ConfirmPopupConfig {
  title: string;
  detail: string | ReactNode;
  confirmText: string;
  cancelText: string;
  type: ConfirmPopupType;
  onConfirm: (() => void) | null;
  footerButtons: FooterButtons;
  buttonWidth: ButtonWidth;
}

interface ShowConfirmOptions {
  title?: string;
  detail?: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmPopupType;
  onConfirm?: () => void;
  footerButtons?: FooterButtons;
  buttonWidth?: ButtonWidth;
}

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
    buttonWidth: 'fill',
  });

  const showConfirm = useCallback((options: ShowConfirmOptions) => {
    setConfig({
      title: options.title || '',
      detail: options.detail || '',
      confirmText: options.confirmText || 'ยืนยัน',
      cancelText: options.cancelText || 'ยกเลิก',
      type: options.type || 'confirm',
      onConfirm: options.onConfirm || null,
      footerButtons: options.footerButtons || 'both',
      buttonWidth: options.buttonWidth || 'fill',
    });
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleConfirm = useCallback(() => {
    if (config.onConfirm) {
      config.onConfirm();
    }
    setIsOpen(false);
  }, [config]);

  // Optimize: Only render when actually open
  const confirmPopup = isOpen ? (
    <ConfirmPopup
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={config.title}
      detail={config.detail}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
      type={config.type}
      footerButtons={config.footerButtons}
      buttonWidth={config.buttonWidth}
    />
  ) : null;

  return {
    confirmPopup,
    showConfirm,
  };
};
