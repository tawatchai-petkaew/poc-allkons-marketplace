'use client';

import { Modal, Drawer, Grid } from 'antd';
import React, { useMemo } from 'react';
import CustomButton from '@/components/Button';
import Typography from '@/components/Typography';
import SectionIcon from '@/components/Section/SectionIcon';
import './custom.css';

const { useBreakpoint } = Grid;

type ConfirmPopupType = 'confirm' | 'warn' | 'info';
type FooterButtons = 'both' | 'confirm' | 'cancel' | 'none';
type ButtonWidth = 'fill' | 'fit';

interface ConfirmPopupProps {
  isOpen?: boolean;
  onClose?: (() => void) | null;
  onConfirm?: (() => void) | null;
  isDisableButton?: boolean;
  cancelText?: string;
  confirmText?: string;
  title?: string;
  detail?: string | React.ReactNode;
  type?: ConfirmPopupType;
  footerButtons?: FooterButtons;
  buttonWidth?: ButtonWidth;
}

export default function ConfirmPopup({
  isOpen = true,
  onClose = null,
  onConfirm = null,
  isDisableButton = false,
  cancelText = 'ยกเลิก',
  confirmText = '',
  title = '',
  detail = '',
  type = 'confirm',
  footerButtons = 'both',
  buttonWidth = 'fill',
}: ConfirmPopupProps) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const iconConfig = useMemo(() => {
    const iconMap: Record<
      ConfirmPopupType,
      { iconClass: string; iconType: 'success' | 'error' | 'info' }
    > = {
      confirm: {
        iconClass: 'ri-checkbox-circle-fill',
        iconType: 'success',
      },
      warn: {
        iconClass: 'ri-close-circle-fill',
        iconType: 'error',
      },
      info: {
        iconClass: 'ri-information-fill',
        iconType: 'info',
      },
    };
    return iconMap[type];
  }, [type]);

  const footer = useMemo(() => {
    if (footerButtons === 'none') return null;

    const buttonColorMap: Record<ConfirmPopupType, 'primary' | 'error'> = {
      confirm: 'primary',
      warn: 'error',
      info: 'primary',
    };

    const showCancel = footerButtons === 'both' || footerButtons === 'cancel';
    const showConfirm = footerButtons === 'both' || footerButtons === 'confirm';

    // Button width classes:
    // - 'fill': flex-1 min-w-[120px] - buttons grow to share space equally
    // - 'fit': flex-0 min-w-[120px] - buttons fit content, don't grow
    const buttonWidthClass =
      buttonWidth === 'fill' ? 'flex-1 min-w-[160px]' : 'flex-0 min-w-[160px]';

    return (
      <div className="flex flex-row justify-center gap-3 flex-wrap">
        {showCancel && (
          <div>
            <CustomButton
              color="neutral"
              variant="outlined"
              onClick={onClose || undefined}
              disabled={isDisableButton}
              className={buttonWidthClass}
            >
              {cancelText}
            </CustomButton>
          </div>
        )}
        {showConfirm && (
          <div>
            <CustomButton
              color={buttonColorMap[type]}
              variant="solid"
              onClick={onConfirm || undefined}
              disabled={isDisableButton}
              className={buttonWidthClass}
            >
              {confirmText}
            </CustomButton>
          </div>
        )}
      </div>
    );
  }, [
    footerButtons,
    onClose,
    onConfirm,
    isDisableButton,
    cancelText,
    confirmText,
    type,
    buttonWidth,
  ]);

  const content = (
    <div className="flex flex-col items-center">
      {/* New SectionIcon with Remix icon */}
      <SectionIcon iconClass={iconConfig.iconClass} type={iconConfig.iconType} />

      <div className="flex flex-col gap-2">
        {/* Title */}
        <Typography variant="h3" className="!text-text-primary text-center">
          {title}
        </Typography>
        {/* Detail */}
        {typeof detail === 'string' ? (
          <Typography variant="paragraph-medium" className="!text-text-quaternary text-center">
            {detail}
          </Typography>
        ) : (
          <div className="!text-text-quaternary text-center">{detail}</div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer
        style={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}
        open={isOpen}
        onClose={onClose || undefined}
        closable={true}
        placement="bottom"
        height="auto"
        maskClosable={false}
        footer={footer}
        styles={{
          header: {
            borderBottom: 0,
            position: 'absolute',
            right: '-8px',
          },
          footer: {
            borderTop: 0,
            padding: '14px',
          },
        }}
        classNames={{
          wrapper: 'confirm-popup-drawer',
        }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Modal
      open={isOpen}
      onCancel={onClose || undefined}
      closable={true}
      centered
      width={600}
      footer={footer}
      styles={{
        header: { paddingBottom: '16px' },
        content: {
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
        },
        body: {
          flex: 1,
          overflowY: 'auto',
          paddingBottom: '0.75rem',
          scrollbarWidth: 'thin',
          scrollbarColor: '#dee1e6 transparent',
        },
        footer: { borderTop: 'none', margin: 0 },
      }}
      classNames={{
        wrapper: 'confirm-popup-modal',
      }}
    >
      {content}
    </Modal>
  );
}
