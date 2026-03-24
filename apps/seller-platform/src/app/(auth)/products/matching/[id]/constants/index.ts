// ============================================
// Type Definitions
// ============================================

export type IPriceDisplayMode = 'with-vat' | 'without-vat';

export type IImportStatus =
  | 'PENDING'
  | 'PENDING_ADMIN'
  | 'IMPORTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REJECTED';

export type IMatchStatus = 'FOUND' | 'SIMILAR' | 'NOT_FOUND';

export type IStatusTab = 'imported' | 'found' | 'similar' | 'notFound';

export type IBadgeColor = 'default' | 'warning' | 'processing' | 'success' | 'error';

export type IImportType = 'CREATE' | 'UPDATE';

export interface IPriceDisplayOption {
  value: IPriceDisplayMode;
  label: string;
}

export interface IStatusConfig {
  label: string;
  className: string;
  icon?: string;
}

export interface IImportTypeConfig {
  label: string;
  className: string;
}

// ============================================
// Price Display Options
// ============================================

export const PRICE_DISPLAY_OPTIONS = [
  { value: 'with-vat', label: 'ราคารวมภาษี' },
  { value: 'without-vat', label: 'ราคาไม่รวมภาษี' },
] satisfies IPriceDisplayOption[];

export const PRICE_DISPLAY_MODES = {
  WITH_VAT: 'with-vat',
  WITHOUT_VAT: 'without-vat',
} as const satisfies Record<'WITH_VAT' | 'WITHOUT_VAT', IPriceDisplayMode>;

export const DEFAULT_PRICE_DISPLAY_MODE: IPriceDisplayMode = PRICE_DISPLAY_MODES.WITHOUT_VAT;
export const DEFAULT_SHOW_VAT_DETAILS = true;

export const UNSPECIFIED_TEXT = 'ไม่ระบุ';

// ============================================
// Status Tabs
// ============================================

export const STATUS_TABS = {
  imported: 'imported',
  found: 'found',
  similar: 'similar',
  notFound: 'notFound',
} as const satisfies Record<'imported' | 'found' | 'similar' | 'notFound', IStatusTab>;

export const STATUS_TAB_LABELS = {
  [STATUS_TABS.imported]: 'สินค้านำเข้า',
  [STATUS_TABS.found]: 'สินค้าที่พบตรงกับในระบบ',
  [STATUS_TABS.similar]: 'สินค้าใกล้เคียง',
  [STATUS_TABS.notFound]: 'สินค้าที่ไม่พบในระบบ',
} as const satisfies Record<IStatusTab, string>;

// ============================================
// Imported Product Status Configuration
// ============================================

export const IMPORTED_STATUS_CONFIG = {
  PENDING: {
    label: 'รอนำเข้า',
    className: 'importedStatusWaiting',
  },
  PENDING_ADMIN: {
    label: 'รอแอดมินตรวจสอบ',
    className: 'importedStatusReview',
  },
  IMPORTING: {
    label: 'ระบบกำลังนำเข้า',
    className: 'importedStatusImporting',
  },
  COMPLETED: {
    label: 'นำเข้าสำเร็จ',
    className: 'importedStatusSuccess',
  },
  FAILED: {
    label: 'นำเข้าไม่สำเร็จ',
    className: 'importedStatusFailed',
  },
  REJECTED: {
    label: 'ปฏิเสธ',
    className: 'importedStatusRejected',
  },
} as const satisfies Record<IImportStatus, IStatusConfig>;

export const DEFAULT_IMPORTED_STATUS: IImportStatus = 'PENDING';

// ============================================
// Product Matching Status Configuration
// ============================================

export const MATCHING_STATUS_CONFIG = {
  FOUND: {
    label: 'พบสินค้า',
    className: 'matchingStatusFound',
  },
  SIMILAR: {
    label: 'ใกล้เคียง',
    className: 'matchingStatusSimilar',
  },
  NOT_FOUND: {
    label: 'ไม่พบสินค้า',
    className: 'matchingStatusNotFound',
  },
} as const satisfies Record<IMatchStatus, IStatusConfig>;

// ============================================
// Available for Sale Status Configuration
// ============================================

export const AVAILABLE_FOR_SALE_CONFIG = {
  true: {
    icon: 'ri-eye-line',
    label: 'ขายอยู่',
    className: 'availableForSaleTrue',
  },
  false: {
    icon: 'ri-eye-off-line',
    label: 'ไม่แสดง',
    className: 'availableForSaleFalse',
  },
} as const satisfies Record<'true' | 'false', IStatusConfig>;

// ============================================
// Yes/No Status Configuration
// ============================================

export const YES_NO_STATUS_CONFIG = {
  true: {
    icon: 'ri-checkbox-circle-fill',
    label: 'ใช่',
    className: 'inquiredTrue',
  },
  false: {
    icon: 'ri-close-circle-fill',
    label: 'ไม่ใช่',
    className: 'inquiredFalse',
  },
} as const satisfies Record<'true' | 'false', IStatusConfig>;

// ============================================
// Tab to Match Status Mapping
// ============================================

export const TAB_TO_MATCH_STATUS_MAP = {
  [STATUS_TABS.imported]: '',
  [STATUS_TABS.found]: 'FOUND',
  [STATUS_TABS.similar]: 'SIMILAR',
  [STATUS_TABS.notFound]: 'NOT_FOUND',
} as const satisfies Record<IStatusTab, string>;

// ============================================
// Import Type Configuration
// ============================================

export const IMPORT_TYPE_CONFIG = {
  CREATE: {
    label: 'เพิ่มใหม่',
    className: 'importTypeCreate',
  },
  UPDATE: {
    label: 'แก้ไข',
    className: 'importTypeUpdate',
  },
} as const satisfies Record<IImportType, IImportTypeConfig>;

// ============================================
// Helper Functions
// ============================================

/**
 * Get imported status configuration by status key
 */
export const getImportedStatusConfig = (status: string): IStatusConfig => {
  const config = IMPORTED_STATUS_CONFIG[status as IImportStatus];
  return config || IMPORTED_STATUS_CONFIG.PENDING;
};

/**
 * Get matching status configuration by status key
 */
export const getMatchingStatusConfig = (status: string): IStatusConfig => {
  const config = MATCHING_STATUS_CONFIG[status as IMatchStatus];
  return config || MATCHING_STATUS_CONFIG.NOT_FOUND;
};

/**
 * Get import type configuration by type key
 */
export const getImportTypeConfig = (type: string): IImportTypeConfig => {
  const config = IMPORT_TYPE_CONFIG[type as IImportType];
  if (!config) {
    throw new Error(`Invalid import type: ${type}`);
  }
  return config;
};
