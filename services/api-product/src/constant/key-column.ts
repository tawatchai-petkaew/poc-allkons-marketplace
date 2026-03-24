export const KEY_COLUMNS_IMPORT_PRODUCTS = {
  ProductBarcode: 'ProductBarcode',
  Brand: 'Brand',
  ProductName: 'ProductName',
  PricingTypes: 'PricingTypes',
  RegularPrice: 'RegularPrice',
  SpecialPrice: 'SpecialPrice',
  Vat: 'Vat',
  SpecialPriceStartDate: 'SpecialPriceStartDate',
  SpecialPriceEndDate: 'SpecialPriceEndDate',
  CustomersRequiredInquire: 'CustomersRequiredInquire',
  ProductStatus: 'ProductStatus',
} as const;

export const KEY_COLUMNS_IMPORT_PRODUCTS_ARRAY = [
  KEY_COLUMNS_IMPORT_PRODUCTS.ProductBarcode,
  KEY_COLUMNS_IMPORT_PRODUCTS.Brand,
  KEY_COLUMNS_IMPORT_PRODUCTS.ProductName,
  KEY_COLUMNS_IMPORT_PRODUCTS.PricingTypes,
  KEY_COLUMNS_IMPORT_PRODUCTS.RegularPrice,
  KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPrice,
  KEY_COLUMNS_IMPORT_PRODUCTS.Vat,
  KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPriceStartDate,
  KEY_COLUMNS_IMPORT_PRODUCTS.SpecialPriceEndDate,
  KEY_COLUMNS_IMPORT_PRODUCTS.CustomersRequiredInquire,
  KEY_COLUMNS_IMPORT_PRODUCTS.ProductStatus,
] as const;


export const KEY_VALIDATE_COLUMNS_PRODUCT_IMPORT = {
  ProductBarcode: 'Barcode สินค้า\n(บังคับต้องระบุอย่างน้อย 1 ช่อง)',
  Brand: 'แบรนด์สินค้า\n(บังคับต้องระบุอย่างน้อย 1 ช่อง)',
  ProductName: 'ชื่อสินค้า\n(บังคับต้องระบุอย่างน้อย 1 ช่อง)',
  PricingTypes: 'ประเภทการระบุราคา\n(จำเป็นต้องระบุ)',
  RegularPrice: 'ราคาปกติ\n(จำเป็นต้องระบุ)',
  SpecialPrice: 'ราคาพิเศษ',
  Vat: 'ภาษีมูลค่าเพิ่ม\n(จำเป็นต้องระบุ)',
  SpecialPriceStartDate: 'วันที่เริ่มต้นราคาพิเศษ',
  SpecialPriceEndDate: 'วันที่สิ้นสุดราคาพิเศษ',
  CustomersRequiredInquire: 'ต้องการให้ลูกค้าสอบถามราคาก่อนสั่งซื้อ\n(จำเป็นต้องระบุ)',
  ProductStatus: 'สถานะสินค้า\n(จำเป็นต้องระบุ)',
} as const;