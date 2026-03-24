// Product Matching Status Configuration
export const STATUS_CONFIG: Record<
  string,
  { text: string; icon: string; bgColor: string; className: string }
> = {
  validated: {
    text: 'ตรวจสอบข้อมูลเรียบร้อย',
    icon: 'ri-file-check-line',
    bgColor: '#1890ff',
    className: '',
  },
  matching: {
    text: 'ระบบกำลังจับคู่',
    icon: 'ri-database-2-line',
    bgColor: '#5a606b',
    className: '',
  },
  managing: {
    text: 'จัดการผลการจับคู่',
    icon: 'ri-list-check-3',
    bgColor: '#f9ac0a',
    className: '',
  },
  complete: {
    text: 'นำเข้าเสร็จสิ้น',
    icon: 'ri-checkbox-circle-line',
    bgColor: '#00af43',
    className: '',
  },
  cancelled: {
    text: 'ยกเลิก',
    icon: 'ri-close-circle-line',
    bgColor: '#ef4444',
    className: '',
  },
};

// Button Configuration for Product Matching
export const BUTTON_CONFIG: Record<
  string,
  { text: string; variant: string; color: string; className: string }
> = {
  validated: {
    text: 'ยืนยันการนำเข้า',
    variant: 'solid',
    color: 'primary',
    className: 'confirmImportBtn',
  },
  managing: {
    text: 'จัดการผลการจับคู่',
    variant: 'solid',
    color: 'primary',
    className: 'manageResultBtn',
  },
  matching: {
    text: 'ยกเลิกการจับคู่',
    variant: 'outlined',
    color: 'error',
    className: 'cancelMatchingBtn',
  },
  complete: {
    text: 'ดูรายงานการนำเข้า',
    variant: 'outlined',
    color: 'neutral',
    className: 'viewReportBtn',
  },
  cancelled: {
    text: 'ลบรายการ',
    variant: 'outlined',
    color: 'error',
    className: 'deleteItemBtn',
  },
};

// Menu Item Types
export const MENU_ITEM_TYPES = {
  COMPLETE: 'complete',
  CANCEL: 'cancel',
  DOWNLOAD_ORIGINAL: 'download-original',
  DOWNLOAD_MATCHING: 'download-matching',
  DELETE: 'delete',
  DELETE_DEFAULT: 'delete-default',
  DOWNLOAD: 'download',
};

// Menu Item Configuration
export const MENU_ITEM_CONFIG: Record<
  string,
  { key: string; label: string; icon: string; iconColor?: string }
> = {
  [MENU_ITEM_TYPES.CANCEL]: {
    key: MENU_ITEM_TYPES.CANCEL,
    label: 'ยกเลิกการจับคู่',
    icon: 'ri-close-circle-line',
  },
  [MENU_ITEM_TYPES.COMPLETE]: {
    key: MENU_ITEM_TYPES.COMPLETE,
    label: 'เสร็จสิ้นและยืนยันนำเข้า',
    icon: 'ri-check-line',
  },
  [MENU_ITEM_TYPES.DOWNLOAD_ORIGINAL]: {
    key: MENU_ITEM_TYPES.DOWNLOAD_ORIGINAL,
    label: 'ดาวน์โหลดไฟล์ต้นฉบับ',
    icon: 'ri-file-download-line',
  },
  [MENU_ITEM_TYPES.DOWNLOAD_MATCHING]: {
    key: MENU_ITEM_TYPES.DOWNLOAD_MATCHING,
    label: 'ดาวน์โหลดผลการจับคู่',
    icon: 'ri-download-2-line',
  },
  [MENU_ITEM_TYPES.DELETE]: {
    key: MENU_ITEM_TYPES.DELETE,
    label: 'ลบรายการ',
    icon: 'ri-delete-bin-6-line',
    iconColor: '#EF4444',
  },
  [MENU_ITEM_TYPES.DELETE_DEFAULT]: {
    key: MENU_ITEM_TYPES.DELETE_DEFAULT,
    label: 'ลบรายการ',
    icon: 'ri-delete-bin-line',
    iconColor: '#EF4444',
  },
  [MENU_ITEM_TYPES.DOWNLOAD]: {
    key: MENU_ITEM_TYPES.DOWNLOAD,
    label: 'ดาวน์โหลดไฟล์ต้นฉบับ',
    icon: 'ri-file-download-line',
  },
};

// Menu Items by Status
export const MENU_ITEMS_BY_STATUS: Record<string, string[]> = {
  validated: [MENU_ITEM_TYPES.COMPLETE, MENU_ITEM_TYPES.DOWNLOAD_ORIGINAL, MENU_ITEM_TYPES.DELETE],
  managing: [
    MENU_ITEM_TYPES.COMPLETE,
    MENU_ITEM_TYPES.DOWNLOAD_ORIGINAL,
    MENU_ITEM_TYPES.DOWNLOAD_MATCHING,
    MENU_ITEM_TYPES.DELETE,
  ],
  complete: [
    MENU_ITEM_TYPES.DOWNLOAD_ORIGINAL,
    MENU_ITEM_TYPES.DOWNLOAD_MATCHING,
    MENU_ITEM_TYPES.DELETE,
  ],
  cancelled: [MENU_ITEM_TYPES.DOWNLOAD_ORIGINAL],
  default: [MENU_ITEM_TYPES.DOWNLOAD, MENU_ITEM_TYPES.DELETE_DEFAULT],
};

// Map API status to UI status
export const STATUS_MAP: Record<string, string> = {
  VALIDATED: 'validated',
  MATCHING: 'matching',
  PENDING_REVIEW: 'managing',
  COMPLETED: 'complete',
  CANCELLED: 'cancelled',
};

export const getApiStatusFromUiStatus = (uiStatus?: string) => {
  if (!uiStatus || uiStatus === 'all') return '';
  const entry = Object.entries(STATUS_MAP).find(([_, value]) => value === uiStatus);
  return entry ? entry[0] : '';
};

// Helper functions
export const getStatusConfig = (status: string) => {
  return STATUS_CONFIG[status] || STATUS_CONFIG.matching;
};

export const getButtonConfig = (status: string) => {
  return BUTTON_CONFIG[status] || BUTTON_CONFIG.managing;
};

export const isMatchingStatus = (status: string) => status === 'matching';

export const getMenuItemsConfigForStatus = (status: string) => {
  return MENU_ITEMS_BY_STATUS[status] || MENU_ITEMS_BY_STATUS.default;
};

export const getMenuItemConfig = (type: string) => {
  return MENU_ITEM_CONFIG[type];
};

export type IStatusConfigKey = 'validated' | 'matching' | 'managing' | 'complete' | 'cancelled';

export type IStatusMapKey = 'VALIDATED' | 'MATCHING' | 'PENDING_REVIEW' | 'COMPLETED' | 'CANCELLED';
