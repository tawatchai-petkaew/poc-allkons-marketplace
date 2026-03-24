import * as ExcelJS from 'exceljs';

export const ErrorMessagesImportProduct = {
  EMPTY_FIELDS_ERROR: 'กรุณาระบุข้อมูลอย่างน้อย 1 ช่อง',
  DUPLICATE_ERROR_MESSAGE: 'ภายใต้ข้อมูลสินค้าเดียวกัน สามารถนำเข้าได้ทีละ 1 แถว',
  DUPLICATE_BARCODE_ERROR: 'ภายใต้ข้อมูล Barcode สินค้าเดียวกัน สามารถนำเข้าได้ทีละ 1 แถว',
  INVALID_FORMAT_ERROR: 'ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบรูปแบบการระบุข้อมูล',
  REQUIRED_FIELD_ERROR: 'กรุณาระบุข้อมูล',
  MUST_BE_GREATER_THAN_ZERO: 'รูปแบบข้อมูลต้องมากกว่า 0',
  MUST_NOT_BE_NEGATIVE: 'รูปแบบข้อมูลต้องไม่เป็นตัวเลขติดลบ',
  MAX_LENGTH_ERROR: 'ความยาวต้องไม่เกิน 13 ตัวอักษร',
  MUST_BE_NUMERIC: 'รูปแบบข้อมูลต้องเป็นตัวเลข',
  MAX_DECIMAL_PLACES_ERROR: 'ทศนิยมต้องไม่เกิน 2 ตำแหน่ง',
  START_DATE_BEFORE_IMPORT_ERROR: 'วันที่เริ่มต้นราคาพิเศษ ต้องไม่น้อยกว่าวันที่นำเข้าสินค้า',
  END_DATE_BEFORE_START_ERROR: 'วันที่สิ้นสุดราคาพิเศษ ต้องไม่น้อยกว่าวันที่เริ่มต้นราคาพิเศษ',
  TEMPLATE_FORMAT_ERROR: 'รองรับเฉพาะรูปแบบ Template ที่กำหนด',
  TEMPLATE_FORMAT_VALIDATION_FAILED: 'ตรวจสอบไม่สำเร็จ',
  TEMPLATE_FORMAT_DESCRIPTION: 'รองรับเฉพาะรูปแบบ Template ที่กำหนด',
  EMPTY_DATA_DESCRIPTION: 'กรุณากรอกข้อมูลสำหรับ นำเข้า/อัปเดตสินค้า',
  INVALID_FILE_FORMAT_ERROR: 'รูปแบบไฟล์ไม่ถูกต้อง กรุณาตรวจสอบว่าเป็นไฟล์ Excel (.xlsx) ที่ถูกต้อง',
  WORKSHEET_NOT_FOUND_ERROR: 'ไม่พบ worksheet ในไฟล์ Excel',
  INVALID_FILE_EXTENSION_ERROR: 'รูปแบบไฟล์ไม่ถูกต้อง ระบบรองรับเฉพาะไฟล์ .xlsx เท่านั้น',
  EMPTY_FILE_ERROR: 'ไฟล์ที่อัปโหลดว่างเปล่า',
};

export const ERROR_FONT = {
  size: 11,
  color: { argb: 'FF000000' },
  name: 'Calibri',
  bold: false,
};
export const ERROR_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFF0000' },
};
