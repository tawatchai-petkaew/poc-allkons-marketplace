import Button from '@/components/Button';
import SectionIcon from '@/components/Sections/SectionIcon';
import Typography from '@/components/Typography';
import { Grid, Modal, Drawer, App } from 'antd';
import { useState, useCallback } from 'react';
import { ReactNode } from 'react';

export type ConfirmModalParams = {
  title: string;
  description?: string | ReactNode;
  onOk: (...args: unknown[]) => unknown;
  okText?: string;
  cancelText?: string;
};

type MobileDrawerState = {
  isOpen: boolean;
  params: ConfirmModalParams | null;
  type: 'delete' | 'warning' | null;
};

const useConfirmModal = () => {
  const { modal } = App.useApp();
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  const [drawerState, setDrawerState] = useState<MobileDrawerState>({
    isOpen: false,
    params: null,
    type: null,
  });

  const closeMobileDrawer = useCallback(() => {
    setDrawerState({
      isOpen: false,
      params: null,
      type: null,
    });
  }, []);

  const handleMobileConfirm = useCallback(() => {
    if (drawerState.params?.onOk) {
      drawerState.params.onOk();
    }
    closeMobileDrawer();
  }, [drawerState.params, closeMobileDrawer]);

  const confirmDelete = useCallback(
    (params: ConfirmModalParams) => {
      const {
        title,
        description,
        onOk,
        okText = 'ยืนยัน',
        cancelText = 'ยกเลิก',
      } = params;

      if (isMobile) {
        setDrawerState({
          isOpen: true,
          params: { ...params, okText, cancelText, onOk },
          type: 'delete',
        });
      } else {
        const modalInstance = modal.confirm({
          title: (
            <div className="flex flex-col items-center text-center">
              <SectionIcon iconClass="ri-information-fill" type="error" />
              <div className="mt-5">
                <Typography
                  variant={isMobile ? `h1` : `h3`}
                  className="!text-text-secondary"
                >
                  {title}
                </Typography>
              </div>
              <div className="mt-2">
                <Typography
                  variant={isMobile ? `paragraph-medium` : `paragraph-big`}
                  className="!text-text-quinary"
                >
                  {description}
                </Typography>
              </div>
              <button
                type="button"
                className="ant-modal-close absolute right-4 top-4"
                aria-label="Close"
                onClick={() => modalInstance.destroy()}
                style={{ position: 'absolute', right: 16, top: 16 }}
              >
                <i className="ri-close-line text-lg text-icon-quinary"></i>
              </button>
            </div>
          ),
          className: 'custom-allkons custom-modal relative',
          width: 620,
          onOk() {
            onOk();
          },
          footer: (_, { OkBtn, CancelBtn }) => (
            <div className="mt-4 flex gap-3 justify-center">
              <Button
                onClick={() => modalInstance.destroy()}
                variant="outlined"
                color="neutral"
                fullWidth
              >
                {cancelText || 'ยกเลิก'}
              </Button>
              <Button
                color="error"
                fullWidth
                onClick={() => {
                  modalInstance.destroy();
                  onOk();
                }}
              >
                {okText || 'ยืนยัน'}
              </Button>
            </div>
          ),
          icon: null,
          centered: true,
        });
      }
    },
    [isMobile]
  );

  const confirmWarning = useCallback(
    (params: ConfirmModalParams) => {
      const {
        title,
        description,
        onOk,
        okText = 'ยืนยัน',
        cancelText = 'ยกเลิก',
      } = params;

      if (isMobile) {
        setDrawerState({
          isOpen: true,
          params: { ...params, okText, cancelText, onOk },
          type: 'warning',
        });
      } else {
        const modalInstance = modal.confirm({
          title: (
            <div className="flex flex-col items-center text-center">
              <SectionIcon iconClass="ri-information-fill" />
              <div className="mt-5">
                <Typography
                  variant={isMobile ? `h1` : `h3`}
                  className="!text-text-secondary"
                >
                  {title}
                </Typography>
              </div>
              <div className="mt-2">
                <Typography
                  variant={isMobile ? `paragraph-medium` : `paragraph-big`}
                  className="!text-text-quinary"
                >
                  {description}
                </Typography>
              </div>
              <button
                type="button"
                className="ant-modal-close absolute right-4 top-4"
                aria-label="Close"
                onClick={() => modalInstance.destroy()}
                style={{ position: 'absolute', right: 16, top: 16 }}
              >
                <i className="ri-close-line text-lg text-icon-quinary"></i>
              </button>
            </div>
          ),
          className: 'custom-allkons custom-modal relative',
          width: 620,
          onOk() {
            onOk();
          },
          footer: (_, { OkBtn, CancelBtn }) => (
            <div className="mt-4 flex gap-3 justify-center">
              <Button
                onClick={() => modalInstance.destroy()}
                variant="outlined"
                color="neutral"
                fullWidth
              >
                {cancelText || 'ยกเลิก'}
              </Button>
              <Button
                fullWidth
                onClick={() => {
                  modalInstance.destroy();
                  onOk();
                }}
              >
                {okText || 'ยืนยัน'}
              </Button>
            </div>
          ),
          icon: null,
          centered: true,
        });
      }
    },
    [isMobile]
  );

  // Mobile Drawer Component
  const MobileConfirmDrawer = useCallback(() => {
    if (!drawerState.isOpen || !drawerState.params) return null;

    const { title, description, okText, cancelText, onOk } = drawerState.params;
    const isDelete = drawerState.type === 'delete';

    return (
      <Drawer
        open={drawerState.isOpen}
        onClose={closeMobileDrawer}
        title={null}
        className="custom-allkons custom-drawer"
        placement="bottom"
        height="auto"
        closable={false}
        maskClosable={false}
        mask={true}
        footer={null}
        classNames={{
          body: '!p-4',
        }}
      >
        <div className="relative flex flex-col items-center text-center">
          <div className="absolute right-2 z-10 top-2">
            <Button
              onClick={() => {
                closeMobileDrawer();
              }}
              variant="outlined"
              className="!px-0"
              color="neutral"
              bold="400"
            >
              <i className="ri-close-line text-xl text-neutral-40"></i>
            </Button>
          </div>
          <SectionIcon iconClass="ri-information-fill" />
          <div className="mt-5">
            <Typography
              variant={isMobile ? `h1` : `h3`}
              className="!text-text-secondary"
            >
              {title}
            </Typography>
          </div>
          <div className="mt-2">
            <Typography
              variant={isMobile ? `paragraph-medium` : `paragraph-big`}
              className="!text-text-quinary"
            >
              {description}
            </Typography>
          </div>
          <div className="mt-4 flex w-full gap-3 justify-center">
            <Button
              onClick={() => {
                closeMobileDrawer();
              }}
              variant="outlined"
              color="neutral"
              fullWidth
            >
              {cancelText || 'ยกเลิก'}
            </Button>
            <Button
              color={isDelete ? 'error' : 'primary'}
              onClick={() => {
                onOk();
                closeMobileDrawer();
              }}
              fullWidth
            >
              {okText || 'ยืนยัน'}
            </Button>
          </div>
        </div>
      </Drawer>
    );
  }, [drawerState, closeMobileDrawer, handleMobileConfirm]);

  return {
    confirmDelete,
    confirmWarning,
    MobileConfirmDrawer,
    // Additional utilities
    isDrawerOpen: drawerState.isOpen,
    closeMobileDrawer,
  };
};

export default useConfirmModal;
