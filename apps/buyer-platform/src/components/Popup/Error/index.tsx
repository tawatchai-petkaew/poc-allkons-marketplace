import { Grid } from 'antd';
import React from 'react';
import CustomButton from '../../Button';
import Typography from '../../Typography';
import ResponsivePopup from '../index';
import Button from '../../Button';
import SectionIcon from '../../Sections/SectionIcon';

interface ErrorPopupProps {
  visible: boolean;
  onClose: () => void;
  statusCode?: number | null;
  showButtons?: boolean;
  buttonElement?: React.ReactNode;
  title?: string;
  description?: string;
  iconClass?: string;
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({
  visible,
  onClose,
  statusCode,
  showButtons = false,
  buttonElement = null,
  title,
  description,
  iconClass,
}) => {
  const { sm } = Grid.useBreakpoint();
  const isMobile = !sm;

  const handleClose = (): void => {
    onClose();
  };

  const getErrorDetails = (): {
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
          description:
            'ระบบไม่พร้อมใช้งานในขณะนี้ กรุณาลองใหม่อีกครั้งในภายหลัง',
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

  const {
    iconClass: getIconClass,
    message: getMessage,
    description: getDescription,
  } = getErrorDetails();

  return (
    <ResponsivePopup
      visible={visible}
      onClose={handleClose}
      drawerTitle={
        <div className="flex justify-end">
          <Button
            onClick={onClose}
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
        <SectionIcon iconClass={iconClass || getIconClass} />
        <div className="mt-5">
          <Typography
            variant={isMobile ? `h1` : `h3`}
            className="!text-text-secondary"
          >
            {title || getMessage}
          </Typography>
        </div>
        <div className="mt-2">
          <Typography
            variant={isMobile ? `paragraph-medium` : `paragraph-big`}
            className="!text-text-quinary"
          >
            {description || getDescription}
          </Typography>
        </div>
        {buttonElement}
      </div>
    </ResponsivePopup>
  );
};

export default ErrorPopup;
