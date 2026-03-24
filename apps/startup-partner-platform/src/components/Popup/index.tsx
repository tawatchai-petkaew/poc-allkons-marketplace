import { Drawer, DrawerProps, Grid, Modal, ModalProps } from 'antd';
import React, { ReactNode, useEffect } from 'react';
import './custom.css';

const { useBreakpoint } = Grid;

interface ResponsivePopupProps {
  visible: boolean;
  onClose: () => void;
  drawerTitle?: ReactNode;
  modalTitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  drawerClosable?: boolean; // Show/hide close button in drawer (default: true)
  modalProps?: Omit<ModalProps, 'open' | 'onCancel' | 'title' | 'footer'>;
  drawerProps?: Omit<DrawerProps, 'open' | 'onClose' | 'title' | 'placement'>;
}

const ResponsivePopup: React.FC<ResponsivePopupProps> = ({
  visible,
  onClose,
  drawerTitle,
  modalTitle,
  children,
  footer,
  drawerClosable = false,
  modalProps = {},
  drawerProps = {},
}) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    if (visible) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      document.documentElement.style.overflow = 'unset';
    };
  }, [visible]);

  if (isMobile) {
    return (
      <Drawer
        style={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}
        open={visible}
        onClose={onClose}
        classNames={{
          wrapper: 'custom-allkons custom-drawer',
        }}
        title={
          drawerClosable ? (
            <div style={{ position: 'relative', paddingRight: '48px' }}>
              {drawerTitle}
              <div onClick={onClose} className="drawer-close-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M12 4L4 12M4 4L12 12"
                    stroke="#37404f"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          ) : (
            drawerTitle
          )
        }
        closable={false}
        placement="bottom"
        height="auto"
        maskClosable={false}
        mask={true}
        footer={footer !== undefined ? <div className="p-4">{footer}</div> : undefined}
        {...drawerProps}
      >
        {children}
      </Drawer>
    );
  }

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title={modalTitle}
      footer={footer !== undefined ? <div className="px-6 py-4">{footer}</div> : null}
      centered
      classNames={{
        wrapper: 'custom-allkons custom-modal',
      }}
      {...modalProps}
    >
      {children}
    </Modal>
  );
};

export default ResponsivePopup;
