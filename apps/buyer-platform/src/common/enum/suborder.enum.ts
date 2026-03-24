export enum SubOrderStatus {
  NEW = 'NEW', // รอเลือกชำระ
  WAITING_DELIVERY_FEE = 'WAITING_DELIVERY_FEE', // รอค่าจัดส่ง
  PENDING_PAYMENT = 'PENDING_PAYMENT', // ที่ต้องชำระ
  PENDING_VERIFY = 'PENDING_VERIFY', // รอร้านค้าตรวจสอบการชำระ
  PREPARE_PRODUCT = 'PREPARE_PRODUCT', // เตรียมสินค้า || ที่ต้องจัดส่ง
  DELIVERY = 'DELIVERY', // กำลังจัดส่ง || ที่ต้องได้รับ
  SUCCESS = 'SUCCESS', // สำเร็จแล้ว
  CANCEL = 'CANCEL', // ยกเลิก
  EXPIRED = 'EXPIRED', // หมดอายุ
}
