export const PRICE_DISPLAY_OPTIONS = [
  { value: 'with-vat', label: 'ราคารวมภาษี' },
  { value: 'without-vat', label: 'ราคาไม่รวมภาษี' },
];

export type PriceDisplayMode = 'with-vat' | 'without-vat';

export const SEARCH_TYPE_OPTIONS = [
  { value: 'all', label: 'เกี่ยวข้องกับสินค้า' },
  { value: 'name', label: 'ชื่อสินค้า' },
  { value: 'barcode', label: 'บาร์โค้ด (Barcode)' },
  { value: 'brandName', label: 'แบรนด์สินค้า' },
] as const;

export type SearchType = typeof SEARCH_TYPE_OPTIONS[number]['value'];

export interface TempFilterState {
  searchType: SearchType;
  search: string;
  productType: string;
}

export interface FilterState extends TempFilterState {
  status: string;
  categories?: number[];
}

export const STORAGE_KEYS = {
  SELECTED_PRODUCT_ROW_KEYS: 'selectedProductRowKeys',
  SELECTED_PRODUCT_CACHE: 'selectedProductCache',
  SELECTED_PRODUCT_VARIANT_IDS: 'selectedProductVariantIds',
  SELECTED_PRODUCT_DATA: 'selectedProductData',
  ADD_PRODUCT_SUCCESS: 'addProduct',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

export const SCREEN_WIDTH_BREAKPOINT = 1280;

export const DEFAULT_PRODUCT_IMAGE = '/images/product/default-product.png';

export const DEFAULT_PRICE_DISPLAY_MODE: PriceDisplayMode = 'without-vat';
export const DEFAULT_SHOW_VAT_DETAILS = true;

export const DEBOUNCE_TIMINGS = {
  STORAGE_SYNC: 300,
  RESIZE_HANDLER: 100,
} as const;

export const PRODUCT_STATUS = {
  ALL: 'ALL',
  SELLING: 'Selling',
  HIDDEN: 'Hidden',
  OUT_OF_STOCK: 'OutOfStock',
  NOT_APPROVED: 'NotApproved',
} as const;

export const PRODUCT_STATUS_CONFIG: Record<
  string,
  { label: string; color: "success" | "neutral" | "error" | "warning"; icon: string }
> = {
  [PRODUCT_STATUS.SELLING]: {
    label: 'ขายอยู่',
    color: 'success',
    icon: 'ri-eye-line',
  },
  [PRODUCT_STATUS.HIDDEN]: {
    label: 'ไม่แสดง',
    color: 'neutral',
    icon: 'ri-eye-off-line',
  },
  [PRODUCT_STATUS.OUT_OF_STOCK]: {
    label: 'ถูกระงับ',
    color: 'error',
    icon: 'ri-forbid-line',
  },
  [PRODUCT_STATUS.NOT_APPROVED]: {
    label: 'รอจัดการราคา',
    color: 'warning',
    icon: 'ri-home-office-line',
  },
};

export const INITIAL_TEMP_FILTER: TempFilterState = {
  searchType: "all",
  search: "",
  productType: "all",
};

export const INITIAL_FILTER: FilterState = {
  searchType: "all",
  search: "",
  productType: "all",
  status: "ALL",
};

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;


export const MERCHANT_REDIRECT_DELAY = 1000;

export const QUERY_STALE_TIME = {
  REFERENCE_DATA: Infinity,           
  PRODUCT_IMAGES: 5 * 60 * 1000,     
  CATEGORY_HIERARCHY: 5 * 60 * 1000,
} as const;

export const QUERY_GC_TIME = {
  REFERENCE_DATA: 30 * 60 * 1000,   
} as const;

export const PRODUCT_MESSAGES = {
  EDIT_PRICING_INFO: 'ฟังก์ชันแก้ไขราคากำลังพัฒนา',
  SHOW_PRODUCTS_INFO: 'ฟังก์ชันแสดงสินค้ากำลังพัฒนา',
  BULK_UPDATE_STATUS_SUCCESS: (count: number) => `อัปเดตสถานะสำหรับ ${count} รายการสำเร็จ`,
  BULK_UPDATE_STATUS_ERROR: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ',
  BULK_DELETE_SUCCESS: (count: number) => `ลบ ${count} รายการสำเร็จ`,
  BULK_DELETE_ERROR: 'เกิดข้อผิดพลาดในการลบสินค้า',
  EDIT_PRODUCT_INFO: (alias: string) => `แก้ไขสินค้า: ${alias}`,
  DELETE_PRODUCT_INFO: (alias: string) => `ลบสินค้า: ${alias}`,
  TOGGLE_STATUS_INFO: (alias: string, newStatus: string) => `เปลี่ยนสถานะสินค้า: ${alias} → ${newStatus}`,
} as const;

export const PRODUCT_EXPORT_MESSAGES = {
  NO_MERCHANT: 'ไม่พบข้อมูลร้านค้า',
  SUCCESS: (filename: string) => `ส่งออกไฟล์สำเร็จ: ${filename}`,
  ERROR: 'เกิดข้อผิดพลาดในการส่งออกไฟล์',
} as const;

export const PRODUCT_STATUS_TABS = [
  { label: 'ทั้งหมด', value: 'ALL' },
  { label: 'ขายอยู่', value: 'Selling' },
  { label: 'ไม่แสดง', value: 'Hidden' },
  { label: 'ถูกระงับ', value: 'OutOfStock' },
  { label: 'รอจัดการราคา', value: 'NotApproved' },
] as const;

export const SEARCH_PLACEHOLDER_MAP: Record<string, string> = {
  all: 'บาร์โค้ด แบรนด์ หรือชื่อสินค้า',
  name: 'ชื่อสินค้า',
  barcode: 'บาร์โค้ด (Barcode)',
  brandName: 'แบรนด์สินค้า',
  _default: 'ค้นหา...',
};

export const PRODUCTS_TABLE_COLUMN_WIDTHS = {
  PRODUCT_NAME: 364,
  BARCODE: 160,
  CATEGORY: 160,
  REGULAR_PRICE: 160,
  SPECIAL_PRICE: 160,
  DISCOUNT: 100,
  STATUS: 160,
  PRODUCT_TYPE: 140,
  PREPARE_DAYS: 180,
  ACTION: 170,
} as const;

export const PRODUCTS_TABLE_SCROLL_X = 1600;
export const PRODUCTS_TABLE_PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'] as const;
export const LOCKED_PRODUCT_STATUSES = ['OutOfStock', 'NotApproved'] as const;

export const CATEGORY_MODAL_SCROLL_DELAY = 100;

export const ADD_PRODUCT_SUCCESS_MESSAGES = {
  TITLE: 'เพิ่มสินค้าสำเร็จ',
  DESCRIPTION: (products: number, merchants: number) =>
    `เพิ่มสินค้า ${products} รายการ เข้าร้านค้า ${merchants} ร้าน`,
} as const;

export const PRODUCTS_HEADER_UI = {
  TITLE: 'สินค้าร้านค้า',
  SUBTITLE: 'คุณกำลังจัดการสินค้าในร้านค้า',
  BTN_EXPORT: 'Export สินค้าทั้งหมด',
  BTN_IMPORT: 'นำเข้า/อัปเดตสินค้า',
  BTN_ADD: 'เพิ่มสินค้าจากระบบ',
} as const;

export const PRODUCTS_FILTER_UI = {
  SEARCH_TYPE_LABEL: 'ประเภทคำค้นหา',
  SEARCH_TYPE_PLACEHOLDER: 'เลือกประเภทการค้นหา',
  SEARCH_LABEL: 'ค้นหา',
  PRODUCT_TYPE_LABEL: 'ประเภทสินค้า',
  PRODUCT_TYPE_PLACEHOLDER: 'เลือกประเภทสินค้า',
  CATEGORY_LABEL: 'หมวดหมู่สินค้า',
  CATEGORY_BTN: 'เลือกหมวดหมู่สินค้า',
  BTN_RESET: 'ล้างค่า',
  BTN_SEARCH: 'ค้นหา',
} as const;

export const PRODUCTS_TABLE_ACTIONS_UI = {
  TOTAL_ITEMS: (count: number) => `สินค้าทั้งหมด ${count} รายการ`,
  SELECTED_COUNT: (count: number) => `เลือก ${count} รายการ`,
  BTN_EDIT_PRICING: 'แก้ไขที่เลือก',
  BTN_SHOW: 'แสดงที่เลือก',
  BTN_HIDE: 'ไม่แสดงที่เลือก',
  BTN_DELETE: 'ลบที่เลือก',
} as const;

export const PRODUCTS_TABLE_UI = {
  EMPTY_TEXT: 'ไม่พบสินค้า',
  PAGINATION: {
    ITEMS_PER_PAGE: ' / หน้า',
    PREV_PAGE: 'ย้อนกลับ',
    NEXT_PAGE: 'หน้าถัดไป',
  },
  COLUMNS: {
    PRODUCT_NAME: 'รายการสินค้า/แบรนด์',
    BARCODE: 'Barcode',
    CATEGORY: 'หมวดหมู่',
    REGULAR_PRICE: 'ราคาปกติ',
    SPECIAL_PRICE: 'ราคาพิเศษ',
    DISCOUNT: 'ลด',
    STATUS: 'สถานะ',
    PRODUCT_TYPE: 'ประเภทสินค้า',
    PREPARE_DAYS: 'เวลาจัดเตรียม (วัน)',
    ACTION: 'จัดการ',
  },
  POPOVER: {
    DISCOUNT_DESC: 'เปอร์เซ็นต์ส่วนลด ระบบจะคำนวณส่วนลดโดยอ้างอิงจากราคาปกติและราคาพิเศษ',
    PREPARE_DAYS_TITLE: 'จำนวนวันที่ร้านค้าใช้เตรียมสินค้า',
    PREPARE_DAYS_DESC: 'นับจากวันที่รับคำสั่งซื้อ จนถึงวันที่ผู้ซื้อยืนยันคำสั่งซื้อ (0 วัน คือ ส่งทันที)',
    PRODUCT_NAME_LABEL: 'ชื่อสินค้า',
    CATEGORY_LABEL: 'หมวดหมู่',
  },
  VAT_EXEMPT: 'ยกเว้นภาษี',
  CATEGORY_UNKNOWN: 'ไม่ระบุ',
  TOGGLE_STATUS: {
    LOCKED_TITLE: 'ไม่สามารถเปลี่ยนสถานะได้',
    LOCKED_DESC: 'สินค้ารอจัดการราคา หรือถูกระงับ',
    SHOW_TITLE: 'แสดงสินค้า',
    SHOW_DESC: 'ผู้ซื้อสามารถเห็นและสั่งซื้อสินค้าได้',
    HIDE_TITLE: 'ไม่แสดงสินค้า',
    HIDE_DESC: 'ผู้ซื้อจะไม่เห็นและไม่สามารถสั่งซื้อสินค้าได้',
  },
} as const;

export const CATEGORY_MODAL_UI = {
  TITLE: 'หมวดหมู่สินค้า',
  SEARCH_PLACEHOLDER: 'ค้นหาหมวดหมู่',
  BTN_SEARCH: 'ค้นหา',
  SELECTED_COUNT: (count: number) => `หมวดหมู่ที่เลือก ${count} รายการ`,
  EMPTY_TEXT: 'ไม่พบหมวดหมู่สินค้า',
  BTN_RESET: 'รีเซ็ต',
  BTN_CONFIRM: 'ตกลง',
} as const;

export const PRICE_TYPE_MAP = {
  'with-vat': 'InVat',
  'without-vat': 'ExVAT',
} as const;

export type PriceTypeValue = typeof PRICE_TYPE_MAP[PriceDisplayMode];
