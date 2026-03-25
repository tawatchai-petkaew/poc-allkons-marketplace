'use client';

import { ReactNode, useCallback, useState } from 'react';
import { Dialog, IconWithRing, Button, Typography } from '@/design-system';
import type { IconWithRingVariant } from '@/design-system';

export type PopupParams = {
  title?: string;
  description?: string | ReactNode;
  onOk?: (...args: unknown[]) => unknown;
  okText?: string;
  showCancel?: boolean;
  cancelText?: string;
  onCancel?: (...args: unknown[]) => unknown;
  statusCode?: number | null;
  showConfirm?: boolean;
  showRetry?: boolean;
  onRetry?: (...args: unknown[]) => unknown;
  isLoading?: boolean;
};

export type PopupType = 'success' | 'info' | 'error' | 'default' | 'warning' | 'reject' | 'approve';

type PopupState = {
  isOpen: boolean;
  params: PopupParams | null;
  type: PopupType | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getErrorDetails = (statusCode?: number | null): { iconClass: string; message: string; description: string } => {
  switch (statusCode) {
    case 400: return { iconClass: 'ri-information-fill',   message: 'คำขอไม่สามารถดำเนินการได้',                               description: 'กรุณาตรวจสอบข้อมูลและลองอีกครั้ง' };
    case 401: return { iconClass: 'ri-information-fill',   message: 'การเข้าถึงถูกปฏิเสธ',                                    description: 'กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ' };
    case 403: return { iconClass: 'ri-information-fill',   message: 'การเข้าถึงถูกปฏิเสธ',                                    description: 'คุณไม่ได้รับสิทธิ์ในการเข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบ' };
    case 404: return { iconClass: 'ri-alert-fill',         message: 'ไม่พบหน้าหรือข้อมูลที่คุณต้องการ',                      description: 'กรุณาตรวจสอบ URL หรือลองใหม่อีกครั้ง' };
    case 408: return { iconClass: 'ri-error-warning-fill', message: 'เกิดความล่าช้าในการประมวลผลคำขอ',                        description: 'โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ' };
    case 429: return { iconClass: 'ri-error-warning-fill', message: 'มีคำขอจำนวนมาก',                                         description: 'โปรดรอสักครู่ก่อนลองใหม่อีกครั้ง' };
    case 500: return { iconClass: 'ri-server-fill',        message: 'ระบบขัดข้อง',                                            description: 'กรุณาลองใหม่ภายหลัง' };
    case 502: return { iconClass: 'ri-server-fill',        message: '502 Bad Gateway',                                        description: 'ระบบไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้' };
    case 503: return { iconClass: 'ri-alert-fill',         message: '503 Service Unavailable',                                description: 'ระบบไม่พร้อมใช้งานในขณะนี้ กรุณาลองใหม่อีกครั้งในภายหลัง' };
    case 504: return { iconClass: 'ri-server-fill',        message: '504 Gateway Timeout',                                    description: 'ไม่สามารถเชื่อมต่อกับระบบปลายทางได้ในเวลาที่กำหนด กรุณาลองใหม่อีกครั้งในภายหลัง' };
    default:  return { iconClass: 'ri-server-fill',        message: 'ระบบขัดข้อง',                                            description: 'กรุณาลองใหม่ภายหลัง' };
  }
};

const TYPE_TO_RING_VARIANT: Record<PopupType, IconWithRingVariant> = {
  success: 'success',
  info:    'info',
  error:   'error',
  default: 'gray',
  warning: 'warning',
  reject:  'error',
  approve: 'success',
};

const TYPE_TO_ICON_CLASS: Record<PopupType, string> = {
  success: 'ri-checkbox-circle-fill',
  info:    'ri-information-fill',
  error:   'ri-close-circle-fill',
  default: 'ri-server-fill',
  warning: 'ri-information-fill',
  reject:  'ri-information-fill',
  approve: 'ri-information-fill',
};

const TYPE_TO_BUTTON_VARIANT = (type: PopupType): 'primary-brand' | 'primary-error' => {
  return type === 'error' || type === 'reject' ? 'primary-error' : 'primary-brand';
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

const usePopup = () => {
  const [popupState, setPopupState] = useState<PopupState>({
    isOpen: false,
    params: null,
    type: null,
  });

  const closePopup = useCallback(() => {
    setPopupState({ isOpen: false, params: null, type: null });
  }, []);

  const showPopup = useCallback((type: PopupType, params: PopupParams) => {
    setPopupState({
      isOpen: true,
      params: {
        okText: 'ตกลง',
        showCancel: false,
        cancelText: 'ยกเลิก',
        showConfirm: false,
        ...params,
      },
      type,
    });
  }, []);

  const handleOk = useCallback(() => {
    popupState.params?.onOk?.();
    closePopup();
  }, [popupState.params, closePopup]);

  const handleCancel = useCallback(() => {
    popupState.params?.onCancel?.();
    closePopup();
  }, [popupState.params, closePopup]);

  const handleRetry = useCallback(() => {
    popupState.params?.onRetry?.();
    closePopup();
  }, [popupState.params, closePopup]);

  const PopupComponent = useCallback(() => {
    if (!popupState.isOpen || !popupState.params || !popupState.type) return null;

    const { title, description, okText, cancelText, showCancel, statusCode, showConfirm, showRetry, isLoading = false } = popupState.params;

    const errorDetails = statusCode ? getErrorDetails(statusCode) : null;
    const displayTitle       = title       || errorDetails?.message      || '';
    const displayDescription = description || errorDetails?.description  || '';

    const ringVariant = TYPE_TO_RING_VARIANT[popupState.type];
    const iconClass   = statusCode && popupState.type === 'error'
      ? getErrorDetails(statusCode).iconClass
      : TYPE_TO_ICON_CLASS[popupState.type];
    const confirmVariant = TYPE_TO_BUTTON_VARIANT(popupState.type);

    return (
      <Dialog open={popupState.isOpen} onClose={closePopup} size="sm" showHeader={false} showFooter={false}>
        <div className="flex flex-col items-center text-center px-6 py-8">
          <IconWithRing
            variant={ringVariant}
            icon={<i className={`${iconClass} text-3xl`} />}
          />
          <div className="mt-5">
            <Typography variant="h4" className="text-text-secondary">
              {displayTitle}
            </Typography>
          </div>
          {displayDescription && (
            <div className="mt-2">
              <Typography variant="paragraph-medium" className="text-text-quinary whitespace-pre-line">
                {displayDescription}
              </Typography>
            </div>
          )}
          <div className="mt-6 flex w-full gap-3 justify-center">
            {showCancel && (
              <Button variant="secondary-neutral" fullWidth={!!(showCancel && showConfirm)} onClick={handleCancel}>
                {cancelText}
              </Button>
            )}
            {showConfirm && (
              <Button variant={confirmVariant} fullWidth={!!(showCancel && showConfirm)} loading={isLoading} onClick={handleOk}>
                {okText}
              </Button>
            )}
            {showRetry && (
              <Button variant="primary-brand" fullWidth={!!(showCancel && showConfirm)} startIcon={<i className="ri-refresh-line" />} onClick={handleRetry}>
                ลองใหม่อีกครั้ง
              </Button>
            )}
          </div>
        </div>
      </Dialog>
    );
  }, [popupState, closePopup, handleOk, handleCancel, handleRetry]);

  return {
    showPopup,
    PopupComponent,
    isPopupOpen: popupState.isOpen,
    closePopup,
  };
};

export default usePopup;
