import Button from '@/components/Button';
import SectionIcon from '@/components/Sections/SectionIcon';
import Typography from '@/components/Typography';
import ResponsivePopup from '@/components/Popup';
import { Grid } from 'antd';
import { useState, useCallback } from 'react';
import { ReactNode } from 'react';

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
};

export type PopupType = 'success' | 'info' | 'error' | 'default' | 'warning' | 'reject' | 'approve';

type PopupState = {
  isOpen: boolean;
  params: PopupParams | null;
  type: PopupType | null;
};

const getErrorDetails = (
  statusCode?: number | null
): {
  iconClass: string;
  message: string;
  description: string;
} => {
  switch (statusCode) {
    case 400:
      return {
        iconClass: 'ri-information-fill',
        message: 'คำขอไม่สามารถดำเนินการได้',
        description: 'กรุณาตรวจสอบข้อมูลและลองอีกครั้ง',
      };
    case 401:
      return {
        iconClass: 'ri-information-fill',
        message: 'การเข้าถึงถูกปฏิเสธ',
        description: 'กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ',
      };
    case 403:
      return {
        iconClass: 'ri-information-fill',
        message: 'การเข้าถึงถูกปฏิเสธ',
        description:
          'คุณไม่ได้รับสิทธิ์ในการเข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบ',
      };
    case 404:
      return {
        iconClass: 'ri-alert-fill',
        message: 'ไม่พบหน้าหรือข้อมูลที่คุณต้องการ',
        description: 'กรุณาตรวจสอบ URL หรือลองใหม่อีกครั้ง',
      };
    case 408:
      return {
        iconClass: 'ri-error-warning-fill',
        message: 'เกิดความล่าช้าในการประมวลผลคำขอ',
        description: 'โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ',
      };
    case 429:
      return {
        iconClass: 'ri-error-warning-fill',
        message: 'มีคำขอจำนวนมาก',
        description: 'โปรดรอสักครู่ก่อนลองใหม่อีกครั้ง',
      };
    case 500:
      return {
        iconClass: 'ri-server-fill',
        message: 'ระบบขัดข้อง',
        description: 'กรุณาลองใหม่ภายหลัง',
      };
    case 502:
      return {
        iconClass: 'ri-server-fill',
        message: '502 Bad Gateway',
        description: 'ระบบไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
      };
    case 503:
      return {
        iconClass: 'ri-alert-fill',
        message: '503 Service Unavailable',
        description: 'ระบบไม่พร้อมใช้งานในขณะนี้ กรุณาลองใหม่อีกครั้งในภายหลัง',
      };
    case 504:
      return {
        iconClass: 'ri-server-fill',
        message: '504 Gateway Timeout',
        description:
          'ไม่สามารถเชื่อมต่อกับระบบปลายทางได้ในเวลาที่กำหนด กรุณาลองใหม่อีกครั้งในภายหลัง',
      };
    default:
      return {
        iconClass: 'ri-server-fill',
        message: 'ระบบขัดข้อง',
        description: 'กรุณาลองใหม่ภายหลัง',
      };
  }
};

const getIconConfig = (type: PopupType, statusCode?: number | null) => {
  // If statusCode is provided and type is error, use error details
  if (statusCode && type === 'error') {
    const errorDetails = getErrorDetails(statusCode);
    return {
      iconClass: errorDetails.iconClass,
    };
  }

  switch (type) {
    case 'success':
      return {
        iconClass: 'ri-checkbox-circle-fill',
      };
    case 'error':
      return {
        iconClass: 'ri-close-circle-fill',
      };
    case 'reject':
      return {
        iconClass: 'ri-information-fill',
      };
    case 'approve':
      return {
        iconClass: 'ri-information-fill',
      };
    case 'warning':
      return {
        iconClass: 'ri-information-fill',
      };

    default:
      return {
        iconClass: 'ri-server-fill',
      };
  }
};

const getButtonColor = (type: PopupType): 'primary' | 'error' | 'neutral' => {
  switch (type) {
    case 'error':
    case 'reject':
      return 'error';
    case 'approve':
    case 'success':
    default:
      return 'primary';
  }
};

const usePopup = () => {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  const [popupState, setPopupState] = useState<PopupState>({
    isOpen: false,
    params: null,
    type: null,
  });

  const closePopup = useCallback(() => {
    setPopupState({
      isOpen: false,
      params: null,
      type: null,
    });
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
    if (popupState.params?.onOk) {
      popupState.params.onOk();
    }
    closePopup();
  }, [popupState.params, closePopup]);

  const handleCancel = useCallback(() => {
    if (popupState.params?.onCancel) {
      popupState.params.onCancel();
    }
    closePopup();
  }, [popupState.params, closePopup]);

  const handleRetry = useCallback(() => {
    if (popupState.params?.onRetry) {
      popupState.params.onRetry();
    }
    closePopup();
  }, [popupState.params, closePopup]);

  // Popup Component
  const PopupComponent = useCallback(() => {
    if (!popupState.isOpen || !popupState.params || !popupState.type)
      return null;

    const {
      title,
      description,
      okText,
      cancelText,
      showCancel,
      statusCode,
      showConfirm,
      showRetry,
    } = popupState.params;

    // Get error details if statusCode is provided
    const errorDetails = statusCode ? getErrorDetails(statusCode) : null;

    // Use error details for title/description if statusCode provided and no custom title/description
    const displayTitle = title || (errorDetails ? errorDetails.message : '');
    const displayDescription =
      description || (errorDetails ? errorDetails.description : '');

    const iconConfig = getIconConfig(popupState.type, statusCode);
    const buttonColor = getButtonColor(popupState.type);

    return (
      <ResponsivePopup
        visible={popupState.isOpen}
        onClose={closePopup}
        drawerTitle={
          <div className="flex justify-end">
            <Button
              onClick={closePopup}
              variant="ghost"
              className="absolute !right-0 !px-0"
              color="neutral"
              bold="400"
            >
              <i className="ri-close-line text-2xl text-neutral-40"></i>
            </Button>
          </div>
        }
        modalProps={{
          width: 620,
          centered: true,
          destroyOnHidden: true,
        }}
        drawerProps={{
          height: 'auto',
          destroyOnClose: true,
        }}
      >
        <div className="flex flex-col items-center text-center">
          <SectionIcon
            iconClass={iconConfig.iconClass}
            type={popupState.type}
          />
          <div className="mt-5">
            <Typography
              variant={isMobile ? `h1` : `h3`}
              className="!text-text-secondary"
            >
              {displayTitle}
            </Typography>
          </div>
          {displayDescription && (
            <div className="mt-2">
              <Typography
                variant={isMobile ? `paragraph-medium` : `paragraph-big`}
                className="!text-text-quinary"
              >
                {displayDescription}
              </Typography>
            </div>
          )}
          <div className="mt-4 flex w-full gap-3 justify-center">
            {showCancel && (
              <Button
                onClick={handleCancel}
                variant="outlined"
                color="neutral"
                fullWidth={showCancel && showConfirm}
              >
                {cancelText}
              </Button>
            )}
            {showConfirm && (
              <Button
                color={buttonColor}
                onClick={handleOk}
                fullWidth={showCancel && showConfirm}
              >
                {okText}
              </Button>
            )}
            {showRetry && (
              <Button
                color="primary"
                onClick={handleRetry}
                fullWidth={showCancel && showConfirm}
                icon={<i className="ri-refresh-line"></i>}
              >
                {'ลองใหม่อีกครั้ง'}
              </Button>
            )}
          </div>
        </div>
      </ResponsivePopup>
    );
  }, [popupState, closePopup, handleOk, handleCancel, isMobile]);

  return {
    showPopup,
    PopupComponent,
    // Additional utilities
    isPopupOpen: popupState.isOpen,
    closePopup,
  };
};

export default usePopup;
